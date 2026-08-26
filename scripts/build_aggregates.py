#!/usr/bin/env python3
"""Build serving aggregates from the raw LCA table.

The raw table is ~3GB and every scan of it costs quota; these aggregates are a
few MB and answer everything the SEO pages and autocomplete need. Rebuilt after
every data load (called from data_pipeline.py and the data-refresh workflow).

Tables produced in <project>.h1b_data:
  agg_company_summary  - one row per employer slug (stats + full dashboard payload)
  agg_job_summary      - one row per cleaned job-title slug (stats + payload)
  agg_city_summary     - one row per (city, state) worksite pair (payload)
  agg_state_summary    - one row per worksite state (payload)
  agg_attorney_summary - one row per (attorney, firm) and per attorney (payload)
  agg_search_index     - one row per suggestible entity for autocomplete

The `payload` column is a JSON string holding everything the entity dashboard
API returns for that entity (trends, top-N lists, salary histogram, wage
levels). The app fetches payloads in hash shards (`shard` column, cluster key)
and keeps them in Vercel's data cache for 30 days, so BigQuery is only touched
when a shard is cold — the request path never scans the raw table. Shard
counts here must match SHARD_COUNTS in apps/public-app/lib/aggEntities.ts, and
the shard hash (first 15 hex chars of MD5, mod N) is mirrored there in JS.
"""

import argparse
import os
import sys
from datetime import date

from google.cloud import bigquery
from google.oauth2 import service_account

DATASET = 'h1b_data'
SOURCE_TABLE = 'lca_applications'

# Must stay in sync with SHARD_COUNTS in apps/public-app/lib/aggEntities.ts
SHARDS = {'company': 192, 'job': 512, 'city': 48, 'attorney': 128}


def fiscal_year(today: date) -> int:
    return today.year + 1 if today.month >= 10 else today.year


CUR_FY = fiscal_year(date.today())
PREV_FY = CUR_FY - 1

# Mirrors the wage normalization used by the app's BigQuery service
SALARY_SQL = """
  CASE WHEN wage_rate_of_pay_from > 0 AND wage_rate_of_pay_from < 1000000 THEN
    CASE wage_unit_of_pay
      WHEN 'Hour' THEN wage_rate_of_pay_from * 2080
      WHEN 'Week' THEN wage_rate_of_pay_from * 52
      WHEN 'Month' THEN wage_rate_of_pay_from * 12
      WHEN 'Bi-Weekly' THEN wage_rate_of_pay_from * 26
      ELSE wage_rate_of_pay_from
    END
  END
"""

# Annualized wage, banded the way the dashboard API bands it (30k-900k).
CONV_SQL = """(CASE wage_unit_of_pay
      WHEN 'Hour' THEN wage_rate_of_pay_from * 2080
      WHEN 'Week' THEN wage_rate_of_pay_from * 52
      WHEN 'Month' THEN wage_rate_of_pay_from * 12
      WHEN 'Bi-Weekly' THEN wage_rate_of_pay_from * 26
      ELSE wage_rate_of_pay_from END)"""
ENT_SAL = f"(CASE WHEN wage_rate_of_pay_from > 0 AND {CONV_SQL} BETWEEN 30000 AND 900000 THEN {CONV_SQL} END)"
CERT_SAL = f"(CASE WHEN case_status = 'Certified' THEN {ENT_SAL} END)"
# State/attorney endpoints historically used the raw (unconverted) wage.
RAW_BAND = "(CASE WHEN UPPER(case_status) = 'CERTIFIED' AND wage_rate_of_pay_from BETWEEN 30000 AND 900000 THEN wage_rate_of_pay_from END)"

SLUG_SQL = "REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM({col})), r'[^a-z0-9]+', '-'), r'^-+|-+$', '')"

# Strip internal job codes appended to titles, e.g. "ENGINEER - JC-123"
CLEAN_TITLE_SQL = (
    "CASE WHEN REGEXP_CONTAINS(job_title, r' - [A-Z0-9]+-[0-9]+$') "
    "THEN TRIM(REGEXP_REPLACE(job_title, r' - [A-Z0-9]+-[0-9]+$', '')) "
    "ELSE TRIM(job_title) END"
)


def shard_sql(key_expr: str, n: int) -> str:
    # First 15 hex chars of MD5 -> < 2^60, safely inside INT64. Mirrored in JS.
    return f"MOD(CAST(CONCAT('0x', SUBSTR(TO_HEX(MD5({key_expr})), 1, 15)) AS INT64), {n})"


def bucket_sql(col: str) -> str:
    return f"""CASE
      WHEN {col} < 80000 THEN 'Under $80K'
      WHEN {col} < 120000 THEN '$80K - $120K'
      WHEN {col} < 160000 THEN '$120K - $160K'
      WHEN {col} < 200000 THEN '$160K - $200K'
      WHEN {col} < 240000 THEN '$200K - $240K'
      WHEN {col} < 280000 THEN '$240K - $280K'
      WHEN {col} < 320000 THEN '$280K - $320K'
      ELSE '$320K+' END"""


BUCKET_ORDER = """CASE bucket_range
      WHEN 'Under $80K' THEN 1 WHEN '$80K - $120K' THEN 2 WHEN '$120K - $160K' THEN 3
      WHEN '$160K - $200K' THEN 4 WHEN '$200K - $240K' THEN 5 WHEN '$240K - $280K' THEN 6
      WHEN '$280K - $320K' THEN 7 ELSE 8 END"""

FY_SQL = """(CASE WHEN EXTRACT(MONTH FROM received_date) >= 10
      THEN EXTRACT(YEAR FROM received_date) + 1
      ELSE EXTRACT(YEAR FROM received_date) END)"""


def company_query(src: str, project_id: str) -> str:
    slug = SLUG_SQL.format(col='employer_name')
    return f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_company_summary`
    CLUSTER BY shard AS
    WITH base AS (
      SELECT
        TRIM(employer_name) AS employer_name,
        {slug} AS slug,
        case_status,
        received_date,
        CAST({FY_SQL} AS STRING) AS fy,
        UPPER(TRIM(worksite_state)) AS state,
        {CLEAN_TITLE_SQL} AS job_title,
        {SALARY_SQL} AS salary,
        {ENT_SAL} AS esal,
        {CERT_SAL} AS csal
      FROM {src}
      WHERE employer_name IS NOT NULL AND TRIM(employer_name) != '' AND employer_name != 'N/A'
    ),
    stats AS (
      SELECT
        slug,
        APPROX_TOP_COUNT(employer_name, 1)[OFFSET(0)].value AS employer_name,
        COUNT(*) AS total_applications,
        COUNTIF(case_status = 'Certified') AS certified_applications,
        -- Salary stats are banded: wage-unit artifacts (annual values recorded
        -- as hourly and multiplied out) survive the raw <$1M guard and would
        -- otherwise skew every displayed average.
        AVG(IF(salary BETWEEN 15000 AND 400000, salary, NULL)) AS avg_salary,
        APPROX_QUANTILES(IF(salary BETWEEN 15000 AND 1500000, salary, NULL), 100)[OFFSET(50)] AS median_salary,
        MIN(IF(salary BETWEEN 15000 AND 1500000, salary, NULL)) AS min_salary,
        MAX(IF(salary BETWEEN 15000 AND 1500000, salary, NULL)) AS max_salary,
        COUNT(DISTINCT job_title) AS unique_job_titles,
        -- Dashboard-parity stats (30k-900k band, unit-converted)
        ROUND(AVG(esal)) AS d_avg,
        APPROX_QUANTILES(esal, 100)[OFFSET(50)] AS d_median,
        MIN(esal) AS d_min,
        MAX(esal) AS d_max
      FROM base
      GROUP BY slug
      HAVING slug != ''
    ),
    states AS (
      SELECT slug, ARRAY_AGG(STRUCT(state, applications) ORDER BY applications DESC LIMIT 5) AS top_states,
             ARRAY_AGG(STRUCT(state, applications, percentage) ORDER BY applications DESC LIMIT 10) AS p_states
      FROM (
        SELECT slug, state, COUNT(*) AS applications,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY slug), 1) AS percentage
        FROM base WHERE state IS NOT NULL AND state != ''
        GROUP BY slug, state
      )
      GROUP BY slug
    ),
    titles AS (
      SELECT slug,
             ARRAY_AGG(STRUCT(job_title, applications, avg_salary) ORDER BY applications DESC LIMIT 8) AS top_job_titles
      FROM (
        SELECT slug, job_title, COUNT(*) AS applications, AVG(salary) AS avg_salary
        FROM base WHERE job_title IS NOT NULL AND job_title != ''
        GROUP BY slug, job_title
      )
      GROUP BY slug
    ),
    -- "Top paying" titles for the dashboard: >=10 filings, ranked by salary
    pay_titles AS (
      SELECT slug, ARRAY_AGG(STRUCT(jobTitle, applications, avgSalary, cy, py) ORDER BY avgSalary DESC LIMIT 10) AS d_titles
      FROM (
        SELECT slug, job_title AS jobTitle, SUM(apps) AS applications,
               ROUND(AVG(avg_sal)) AS avgSalary,
               MAX(IF(fy = '{CUR_FY}', apps, NULL)) AS cy,
               MAX(IF(fy = '{PREV_FY}', apps, NULL)) AS py
        FROM (
          SELECT slug, job_title, fy, COUNT(*) AS apps, AVG(csal) AS avg_sal
          FROM base WHERE job_title IS NOT NULL AND job_title != '' AND received_date IS NOT NULL
          GROUP BY slug, job_title, fy
        )
        GROUP BY slug, job_title
        HAVING SUM(apps) >= 10 AND ROUND(AVG(avg_sal)) IS NOT NULL
      )
      GROUP BY slug
    ),
    trends AS (
      SELECT slug, ARRAY_AGG(STRUCT(fiscalYear, applications, avgSalary, certificationRate) ORDER BY fiscalYear LIMIT 20) AS d_trends
      FROM (
        SELECT slug, fy AS fiscalYear, COUNT(*) AS applications,
               ROUND(AVG(esal)) AS avgSalary,
               ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 1) AS certificationRate
        FROM base WHERE received_date IS NOT NULL
        GROUP BY slug, fy
      )
      GROUP BY slug
    ),
    dist AS (
      SELECT slug, ARRAY_AGG(STRUCT(bucket_range AS `range`, bucket_count AS `count`) ORDER BY ord LIMIT 8) AS d_dist
      FROM (
        SELECT slug, bucket_range, COUNT(*) AS bucket_count, {BUCKET_ORDER} AS ord
        FROM (SELECT slug, {bucket_sql('esal')} AS bucket_range FROM base WHERE esal IS NOT NULL)
        GROUP BY slug, bucket_range
      )
      GROUP BY slug
    )
    SELECT
      s.slug, s.employer_name, s.total_applications, s.certified_applications,
      s.avg_salary, s.median_salary, s.min_salary, s.max_salary, s.unique_job_titles,
      st.top_states, t.top_job_titles,
      {shard_sql('s.slug', SHARDS['company'])} AS shard,
      TO_JSON_STRING(STRUCT(
        s.employer_name AS name,
        s.total_applications AS totalApplications,
        s.certified_applications AS certifiedApplications,
        s.d_avg AS avgSalary, s.d_median AS medianSalary, s.d_min AS minSalary, s.d_max AS maxSalary,
        s.unique_job_titles AS uniqueJobTitles,
        st.p_states AS topStates,
        pt.d_titles AS topJobTitles,
        t.top_job_titles AS topJobTitlesByVolume,
        tr.d_trends AS yearlyTrends,
        di.d_dist AS salaryDistribution
      )) AS payload
    FROM stats s
    LEFT JOIN states st USING (slug)
    LEFT JOIN titles t USING (slug)
    LEFT JOIN pay_titles pt USING (slug)
    LEFT JOIN trends tr USING (slug)
    LEFT JOIN dist di USING (slug)
    """


def job_query(src: str, project_id: str) -> str:
    slug = SLUG_SQL.format(col=CLEAN_TITLE_SQL)
    return f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_job_summary`
    CLUSTER BY shard AS
    WITH base AS (
      SELECT
        {CLEAN_TITLE_SQL} AS job_title,
        {slug} AS slug,
        case_status,
        received_date,
        full_time_position,
        CAST({FY_SQL} AS STRING) AS fy,
        UPPER(TRIM(worksite_state)) AS state,
        TRIM(employer_name) AS employer,
        COALESCE(TRIM(pw_wage_level), 'Not Specified') AS wage_level,
        (CASE pw_unit_of_pay
          WHEN 'Hour' THEN prevailing_wage * 2080
          WHEN 'Week' THEN prevailing_wage * 52
          WHEN 'Month' THEN prevailing_wage * 12
          WHEN 'Bi-Weekly' THEN prevailing_wage * 26
          ELSE prevailing_wage END) AS pw_annual,
        {CONV_SQL} AS conv,
        {SALARY_SQL} AS salary,
        {ENT_SAL} AS esal,
        {CERT_SAL} AS csal
      FROM {src}
      WHERE job_title IS NOT NULL AND TRIM(job_title) != ''
    ),
    stats AS (
      SELECT
        slug,
        APPROX_TOP_COUNT(job_title, 1)[OFFSET(0)].value AS job_title,
        COUNT(*) AS total_applications,
        COUNTIF(case_status = 'Certified') AS certified_applications,
        -- Salary stats are banded: wage-unit artifacts (annual values recorded
        -- as hourly and multiplied out) survive the raw <$1M guard and would
        -- otherwise skew every displayed average.
        AVG(IF(salary BETWEEN 15000 AND 400000, salary, NULL)) AS avg_salary,
        APPROX_QUANTILES(IF(salary BETWEEN 15000 AND 1500000, salary, NULL), 100)[OFFSET(50)] AS median_salary,
        MIN(IF(salary BETWEEN 15000 AND 1500000, salary, NULL)) AS min_salary,
        MAX(IF(salary BETWEEN 15000 AND 1500000, salary, NULL)) AS max_salary,
        COUNT(DISTINCT employer) AS unique_employers,
        COUNTIF(full_time_position = true) AS full_time,
        COUNTIF(full_time_position = false) AS part_time,
        ROUND(AVG(esal)) AS d_avg,
        APPROX_QUANTILES(esal, 100)[OFFSET(50)] AS d_median,
        MIN(esal) AS d_min,
        MAX(esal) AS d_max
      FROM base
      GROUP BY slug
      HAVING slug != ''
    ),
    states AS (
      SELECT slug, ARRAY_AGG(STRUCT(state, applications) ORDER BY applications DESC LIMIT 5) AS top_states,
             ARRAY_AGG(STRUCT(state, applications, percentage, avgSalary) ORDER BY applications DESC LIMIT 10) AS p_states
      FROM (
        SELECT slug, state, COUNT(*) AS applications,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY slug), 1) AS percentage,
               ROUND(AVG(esal)) AS avgSalary
        FROM base WHERE state IS NOT NULL AND state != ''
        GROUP BY slug, state
      )
      GROUP BY slug
    ),
    employers AS (
      SELECT slug, ARRAY_AGG(STRUCT(employer, applications, avg_salary) ORDER BY applications DESC LIMIT 8) AS top_employers,
             ARRAY_AGG(STRUCT(employer, applications, avg_salary AS avgSalary, cy, py) ORDER BY applications DESC LIMIT 10) AS d_employers
      FROM (
        SELECT slug, employer, SUM(apps) AS applications, ROUND(AVG(avg_sal)) AS avg_salary,
               MAX(IF(fy = '{CUR_FY}', apps, NULL)) AS cy,
               MAX(IF(fy = '{PREV_FY}', apps, NULL)) AS py
        FROM (
          SELECT slug, employer, fy, COUNT(*) AS apps, AVG(esal) AS avg_sal
          FROM base WHERE employer IS NOT NULL AND employer != ''
          GROUP BY slug, employer, fy
        )
        GROUP BY slug, employer
      )
      GROUP BY slug
    ),
    trends AS (
      SELECT slug, ARRAY_AGG(STRUCT(fiscalYear, applications, avgSalary, certificationRate) ORDER BY fiscalYear LIMIT 20) AS d_trends
      FROM (
        SELECT slug, fy AS fiscalYear, COUNT(*) AS applications,
               ROUND(AVG(esal)) AS avgSalary,
               ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 1) AS certificationRate
        FROM base WHERE received_date IS NOT NULL
        GROUP BY slug, fy
      )
      GROUP BY slug
    ),
    dist AS (
      SELECT slug, ARRAY_AGG(STRUCT(bucket_range AS `range`, bucket_count AS `count`) ORDER BY ord LIMIT 8) AS d_dist
      FROM (
        SELECT slug, bucket_range, COUNT(*) AS bucket_count, {BUCKET_ORDER} AS ord
        FROM (SELECT slug, {bucket_sql('esal')} AS bucket_range FROM base WHERE esal IS NOT NULL)
        GROUP BY slug, bucket_range
      )
      GROUP BY slug
    ),
    wages AS (
      SELECT slug, ARRAY_AGG(STRUCT(level, applications, avgActualWage, avgPrevailingWage, abovePrevailingCount, avgWagePremium) ORDER BY ord LIMIT 6) AS d_wages
      FROM (
        SELECT slug, wage_level AS level, COUNT(*) AS applications,
               ROUND(AVG(IF(conv > 0 AND conv < 1000000, conv, NULL))) AS avgActualWage,
               ROUND(AVG(IF(pw_annual > 0 AND pw_annual < 1000000, pw_annual, NULL))) AS avgPrevailingWage,
               COUNTIF(conv > pw_annual AND conv > 0 AND pw_annual > 0) AS abovePrevailingCount,
               ROUND(AVG(IF(conv > 0 AND pw_annual > 0 AND conv < 1000000 AND pw_annual < 1000000, conv - pw_annual, NULL))) AS avgWagePremium,
               CASE TRIM(wage_level) WHEN 'Level I' THEN 1 WHEN 'Level II' THEN 2 WHEN 'Level III' THEN 3 WHEN 'Level IV' THEN 4 ELSE 5 END AS ord
        FROM base WHERE case_status = 'Certified'
        GROUP BY slug, wage_level
      )
      GROUP BY slug
    )
    SELECT
      s.slug, s.job_title, s.total_applications, s.certified_applications,
      s.avg_salary, s.median_salary, s.min_salary, s.max_salary, s.unique_employers,
      st.top_states, e.top_employers,
      {shard_sql('s.slug', SHARDS['job'])} AS shard,
      TO_JSON_STRING(STRUCT(
        s.job_title AS title,
        s.total_applications AS totalApplications,
        s.certified_applications AS certifiedApplications,
        s.d_avg AS avgSalary, s.d_median AS medianSalary, s.d_min AS minSalary, s.d_max AS maxSalary,
        s.full_time AS fullTimePositions, s.part_time AS partTimePositions,
        s.unique_employers AS uniqueEmployers,
        e.d_employers AS topEmployers,
        st.p_states AS topStates,
        tr.d_trends AS yearlyTrends,
        di.d_dist AS salaryDistribution,
        w.d_wages AS wageLevelAnalysis
      )) AS payload
    FROM stats s
    LEFT JOIN states st USING (slug)
    LEFT JOIN employers e USING (slug)
    LEFT JOIN trends tr USING (slug)
    LEFT JOIN dist di USING (slug)
    LEFT JOIN wages w USING (slug)
    """


def city_query(src: str, project_id: str) -> str:
    return f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_city_summary`
    CLUSTER BY shard AS
    WITH base AS (
      SELECT
        CONCAT(UPPER(TRIM(worksite_city)), '|', UPPER(TRIM(worksite_state))) AS city_key,
        TRIM(worksite_city) AS city, UPPER(TRIM(worksite_state)) AS state,
        case_status, received_date,
        CAST({FY_SQL} AS STRING) AS fy,
        UPPER(TRIM(employer_name)) AS employer,
        {CLEAN_TITLE_SQL} AS job_title,
        {ENT_SAL} AS esal,
        {CERT_SAL} AS csal
      FROM {src}
      WHERE worksite_city IS NOT NULL AND TRIM(worksite_city) != ''
        AND worksite_state IS NOT NULL AND TRIM(worksite_state) != ''
    ),
    stats AS (
      SELECT city_key,
        APPROX_TOP_COUNT(city, 1)[OFFSET(0)].value AS display_city,
        ANY_VALUE(state) AS state_code,
        COUNT(*) AS total_applications,
        COUNTIF(case_status = 'Certified') AS certified_applications,
        COUNT(DISTINCT employer) AS unique_employers,
        ROUND(AVG(esal)) AS d_avg,
        APPROX_QUANTILES(esal, 100)[OFFSET(50)] AS d_median,
        MIN(esal) AS d_min, MAX(esal) AS d_max
      FROM base GROUP BY city_key
    ),
    employers AS (
      SELECT city_key, ARRAY_AGG(STRUCT(employer, applications, percentage, avgSalary) ORDER BY applications DESC LIMIT 10) AS d_employers
      FROM (
        SELECT city_key, employer, COUNT(*) AS applications,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY city_key), 1) AS percentage,
               ROUND(AVG(esal)) AS avgSalary
        FROM base WHERE employer IS NOT NULL AND employer != ''
        GROUP BY city_key, employer
      )
      GROUP BY city_key
    ),
    titles AS (
      SELECT city_key, ARRAY_AGG(STRUCT(jobTitle, applications, avgSalary, cy, py) ORDER BY avgSalary DESC LIMIT 10) AS d_titles
      FROM (
        SELECT city_key, job_title AS jobTitle, SUM(apps) AS applications,
               ROUND(AVG(avg_sal)) AS avgSalary,
               MAX(IF(fy = '{CUR_FY}', apps, NULL)) AS cy,
               MAX(IF(fy = '{PREV_FY}', apps, NULL)) AS py
        FROM (
          SELECT city_key, job_title, fy, COUNT(*) AS apps, AVG(csal) AS avg_sal
          FROM base WHERE job_title IS NOT NULL AND job_title != '' AND received_date IS NOT NULL
          GROUP BY city_key, job_title, fy
        )
        GROUP BY city_key, job_title
        HAVING SUM(apps) >= 10 AND ROUND(AVG(avg_sal)) IS NOT NULL
      )
      GROUP BY city_key
    ),
    trends AS (
      SELECT city_key, ARRAY_AGG(STRUCT(fiscalYear, applications, avgSalary, certificationRate) ORDER BY fiscalYear DESC LIMIT 5) AS d_trends
      FROM (
        SELECT city_key, fy AS fiscalYear, COUNT(*) AS applications,
               ROUND(AVG(esal)) AS avgSalary,
               ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 1) AS certificationRate
        FROM base WHERE received_date IS NOT NULL
        GROUP BY city_key, fy
      )
      GROUP BY city_key
    ),
    dist AS (
      SELECT city_key, ARRAY_AGG(STRUCT(bucket_range AS `range`, bucket_count AS `count`) ORDER BY ord LIMIT 8) AS d_dist
      FROM (
        SELECT city_key, bucket_range, COUNT(*) AS bucket_count, {BUCKET_ORDER} AS ord
        FROM (SELECT city_key, {bucket_sql('esal')} AS bucket_range FROM base WHERE esal IS NOT NULL)
        GROUP BY city_key, bucket_range
      )
      GROUP BY city_key
    ),
    recent AS (
      SELECT city_key, ARRAY_AGG(STRUCT(month, applications) ORDER BY ym DESC LIMIT 6) AS d_recent
      FROM (
        SELECT city_key, FORMAT_DATE('%b %Y', received_date) AS month,
               FORMAT_DATE('%Y-%m', received_date) AS ym, COUNT(*) AS applications
        FROM base
        WHERE received_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) AND received_date IS NOT NULL
        GROUP BY city_key, month, ym
      )
      GROUP BY city_key
    )
    SELECT
      s.city_key, s.display_city, s.state_code, s.total_applications,
      {shard_sql('s.city_key', SHARDS['city'])} AS shard,
      TO_JSON_STRING(STRUCT(
        s.display_city AS city, s.state_code AS state,
        s.total_applications AS totalApplications,
        s.certified_applications AS certifiedApplications,
        s.unique_employers AS uniqueEmployers,
        s.d_avg AS avgSalary, s.d_median AS medianSalary, s.d_min AS minSalary, s.d_max AS maxSalary,
        e.d_employers AS topEmployers,
        t.d_titles AS topJobTitles,
        tr.d_trends AS yearlyTrends,
        di.d_dist AS salaryDistribution,
        r.d_recent AS recentActivity
      )) AS payload
    FROM stats s
    LEFT JOIN employers e USING (city_key)
    LEFT JOIN titles t USING (city_key)
    LEFT JOIN trends tr USING (city_key)
    LEFT JOIN dist di USING (city_key)
    LEFT JOIN recent r USING (city_key)
    """


def state_query(src: str, project_id: str) -> str:
    return f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_state_summary` AS
    WITH base AS (
      SELECT
        UPPER(TRIM(worksite_state)) AS state_code,
        TRIM(worksite_city) AS city,
        case_status, received_date,
        TRIM(UPPER(employer_name)) AS employer,
        {CLEAN_TITLE_SQL} AS job_title,
        wage_rate_of_pay_from AS wage,
        {RAW_BAND} AS rsal,
        {ENT_SAL} AS esal
      FROM {src}
      WHERE worksite_state IS NOT NULL AND TRIM(worksite_state) != ''
    ),
    stats AS (
      SELECT state_code,
        COUNT(*) AS total_applications,
        COUNTIF(UPPER(case_status) = 'CERTIFIED') AS certified_applications,
        COUNTIF(UPPER(case_status) = 'DENIED') AS denied_applications,
        COUNTIF(UPPER(case_status) = 'WITHDRAWN') AS withdrawn_applications,
        ROUND(AVG(rsal)) AS d_avg,
        APPROX_QUANTILES(rsal, 100)[OFFSET(50)] AS d_median,
        MIN(rsal) AS d_min, MAX(rsal) AS d_max,
        COUNT(DISTINCT employer) AS unique_employers,
        COUNT(DISTINCT city) AS unique_cities,
        COUNT(DISTINCT job_title) AS unique_job_titles,
        COUNTIF(esal IS NOT NULL) AS seo_salary_n,
        ROUND(AVG(esal)) AS seo_avg_salary
      FROM base GROUP BY state_code
    ),
    employers AS (
      SELECT state_code, ARRAY_AGG(STRUCT(employer, applications, percentage, avgSalary, certificationRate, cy, py) ORDER BY applications DESC LIMIT 15) AS d_employers
      FROM (
        SELECT state_code, employer, COUNT(*) AS applications,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY state_code), 2) AS percentage,
               ROUND(AVG(rsal)) AS avgSalary,
               ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 2) AS certificationRate,
               COUNTIF(received_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)) AS cy,
               COUNTIF(received_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 730 DAY)
                       AND received_date < DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)) AS py
        FROM base WHERE employer IS NOT NULL AND employer != ''
        GROUP BY state_code, employer
        HAVING COUNT(*) >= 5
      )
      GROUP BY state_code
    ),
    cities AS (
      SELECT state_code, ARRAY_AGG(STRUCT(city, applications, percentage, avgSalary, certificationRate) ORDER BY applications DESC LIMIT 15) AS d_cities
      FROM (
        SELECT state_code, city, COUNT(*) AS applications,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY state_code), 2) AS percentage,
               ROUND(AVG(rsal)) AS avgSalary,
               ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 2) AS certificationRate
        FROM base WHERE city IS NOT NULL AND city != ''
        GROUP BY state_code, city
        HAVING COUNT(*) >= 10
      )
      GROUP BY state_code
    ),
    titles AS (
      SELECT state_code, ARRAY_AGG(STRUCT(jobTitle, applications, percentage, avgSalary, certificationRate, cy, py) ORDER BY avgSalary DESC LIMIT 15) AS d_titles
      FROM (
        SELECT state_code, job_title AS jobTitle, COUNT(*) AS applications,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY state_code), 2) AS percentage,
               ROUND(AVG(rsal)) AS avgSalary,
               ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 2) AS certificationRate,
               COUNTIF(received_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)) AS cy,
               COUNTIF(received_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 730 DAY)
                       AND received_date < DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)) AS py
        FROM base WHERE job_title IS NOT NULL AND job_title != ''
        GROUP BY state_code, job_title
        HAVING COUNT(*) >= 5 AND ROUND(AVG(rsal)) IS NOT NULL
      )
      GROUP BY state_code
    ),
    trends AS (
      SELECT state_code, ARRAY_AGG(STRUCT(fiscalYear, applications, certifiedApplications, certificationRate, avgSalary, py) ORDER BY fiscalYear DESC LIMIT 7) AS d_trends
      FROM (
        SELECT *, LAG(applications) OVER (PARTITION BY state_code ORDER BY fiscalYear) AS py
        FROM (
          SELECT state_code, EXTRACT(YEAR FROM received_date) AS fiscalYear,
                 COUNT(*) AS applications,
                 COUNTIF(UPPER(case_status) = 'CERTIFIED') AS certifiedApplications,
                 ROUND(COUNTIF(UPPER(case_status) = 'CERTIFIED') * 100.0 / COUNT(*), 2) AS certificationRate,
                 ROUND(AVG(rsal)) AS avgSalary
          FROM base WHERE received_date IS NOT NULL
          GROUP BY state_code, fiscalYear
        )
      )
      GROUP BY state_code
    ),
    dist AS (
      SELECT state_code, ARRAY_AGG(STRUCT(bucket_range AS `range`, bucket_count AS `count`, percentage) ORDER BY ord LIMIT 8) AS d_dist
      FROM (
        SELECT state_code, bucket_range, COUNT(*) AS bucket_count,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY state_code), 2) AS percentage,
               {BUCKET_ORDER} AS ord
        FROM (SELECT state_code, {bucket_sql('rsal')} AS bucket_range FROM base WHERE rsal IS NOT NULL)
        GROUP BY state_code, bucket_range
      )
      GROUP BY state_code
    ),
    recent AS (
      SELECT state_code, ARRAY_AGG(STRUCT(month, applications, certifiedApplications, avgSalary) ORDER BY month DESC LIMIT 12) AS d_recent
      FROM (
        SELECT state_code, FORMAT_DATE('%Y-%m', received_date) AS month,
               COUNT(*) AS applications,
               COUNTIF(UPPER(case_status) = 'CERTIFIED') AS certifiedApplications,
               ROUND(AVG(rsal)) AS avgSalary
        FROM base WHERE received_date IS NOT NULL
        GROUP BY state_code, month
      )
      GROUP BY state_code
    )
    SELECT
      s.state_code, s.total_applications,
      TO_JSON_STRING(STRUCT(
        s.state_code AS state,
        s.total_applications AS totalApplications,
        s.certified_applications AS certifiedApplications,
        s.denied_applications AS deniedApplications,
        s.withdrawn_applications AS withdrawnApplications,
        s.d_avg AS avgSalary, s.d_median AS medianSalary, s.d_min AS minSalary, s.d_max AS maxSalary,
        s.unique_employers AS uniqueEmployers,
        s.unique_cities AS uniqueCities,
        s.unique_job_titles AS uniqueJobTitles,
        s.seo_avg_salary AS seoAvgSalary,
        e.d_employers AS topEmployers,
        c.d_cities AS topCities,
        t.d_titles AS topJobTitles,
        tr.d_trends AS yearlyTrends,
        di.d_dist AS salaryDistribution,
        r.d_recent AS recentActivity
      )) AS payload
    FROM stats s
    LEFT JOIN employers e USING (state_code)
    LEFT JOIN cities c USING (state_code)
    LEFT JOIN titles t USING (state_code)
    LEFT JOIN trends tr USING (state_code)
    LEFT JOIN dist di USING (state_code)
    LEFT JOIN recent r USING (state_code)
    """


ATTORNEY_NAME_SQL = """CONCAT(
      COALESCE(agent_attorney_first_name, ''),
      CASE WHEN agent_attorney_first_name IS NOT NULL AND agent_attorney_last_name IS NOT NULL THEN ' ' ELSE '' END,
      COALESCE(agent_attorney_last_name, ''))"""


def attorney_query(src: str, project_id: str) -> str:
    # Two grouping passes over the same base: one row per (attorney, firm) and
    # one merged row per attorney (firm_key = ''), matching the API's optional
    # firm filter.
    def arrays(firm_pred: str, key2: str) -> str:
        return f"""
    stats_{key2} AS (
      SELECT name_key, {firm_pred} AS firm_key,
        COUNT(*) AS total_applications,
        COUNTIF(case_status = 'Certified') AS certified,
        COUNTIF(case_status = 'Denied') AS denied,
        COUNTIF(case_status = 'Withdrawn') AS withdrawn,
        COUNT(DISTINCT employer) AS unique_employers,
        APPROX_TOP_COUNT(attorney_name, 1)[OFFSET(0)].value AS display_name,
        APPROX_TOP_COUNT(law_firm, 1)[OFFSET(0)].value AS display_firm,
        APPROX_TOP_COUNT(atty_city, 1)[OFFSET(0)].value AS display_city,
        APPROX_TOP_COUNT(atty_state, 1)[OFFSET(0)].value AS display_state,
        ROUND(AVG(rsal)) AS avg_salary,
        APPROX_QUANTILES(rsal, 100)[OFFSET(50)] AS median_salary,
        MIN(rsal) AS min_salary, MAX(rsal) AS max_salary
      FROM base GROUP BY name_key, firm_key
    ),
    employers_{key2} AS (
      SELECT name_key, firm_key, ARRAY_AGG(STRUCT(employer, applications, percentage, avgSalary, certificationRate) ORDER BY applications DESC LIMIT 10) AS d_employers
      FROM (
        SELECT *, ROUND(applications * 100.0 / SUM(applications) OVER (PARTITION BY name_key, firm_key), 2) AS percentage
        FROM (
          SELECT name_key, {firm_pred} AS firm_key, employer, COUNT(*) AS applications,
                 ROUND(AVG(rsal)) AS avgSalary,
                 ROUND(AVG(IF(case_status = 'Certified', 1.0, 0.0)) * 100, 2) AS certificationRate
          FROM base WHERE employer IS NOT NULL AND employer != ''
          GROUP BY name_key, firm_key, employer
        )
      ) GROUP BY name_key, firm_key
    ),
    states_{key2} AS (
      SELECT name_key, firm_key, ARRAY_AGG(STRUCT(state, applications, percentage, avgSalary) ORDER BY applications DESC LIMIT 10) AS d_states
      FROM (
        SELECT *, ROUND(applications * 100.0 / SUM(applications) OVER (PARTITION BY name_key, firm_key), 2) AS percentage
        FROM (
          SELECT name_key, {firm_pred} AS firm_key, work_state AS state, COUNT(*) AS applications,
                 ROUND(AVG(rsal)) AS avgSalary
          FROM base WHERE work_state IS NOT NULL AND work_state != ''
          GROUP BY name_key, firm_key, state
        )
      ) GROUP BY name_key, firm_key
    ),
    cats_{key2} AS (
      SELECT name_key, firm_key, ARRAY_AGG(STRUCT(jobCategory, applications, percentage, avgSalary, certificationRate, cy, py) ORDER BY applications DESC LIMIT 10) AS d_cats
      FROM (
        SELECT name_key, firm_key, jobCategory, SUM(apps) AS applications,
               ROUND(SUM(apps) * 100.0 / SUM(SUM(apps)) OVER (PARTITION BY name_key, firm_key), 2) AS percentage,
               ROUND(AVG(avg_sal)) AS avgSalary,
               ROUND(AVG(cert_rate), 2) AS certificationRate,
               MAX(IF(fy = '{CUR_FY}', apps, NULL)) AS cy,
               MAX(IF(fy = '{PREV_FY}', apps, NULL)) AS py
        FROM (
          SELECT name_key, {firm_pred} AS firm_key, soc AS jobCategory, fy, COUNT(*) AS apps,
                 AVG(rsal) AS avg_sal,
                 ROUND(AVG(IF(case_status = 'Certified', 1.0, 0.0)) * 100, 2) AS cert_rate
          FROM base WHERE soc IS NOT NULL
          GROUP BY name_key, firm_key, soc, fy
        )
        GROUP BY name_key, firm_key, jobCategory
      ) GROUP BY name_key, firm_key
    ),
    trends_{key2} AS (
      SELECT name_key, firm_key, ARRAY_AGG(STRUCT(fiscalYear, applications, certifiedApplications, certificationRate, avgSalary) ORDER BY fiscalYear DESC LIMIT 5) AS d_trends
      FROM (
        SELECT name_key, {firm_pred} AS firm_key, fy AS fiscalYear, COUNT(*) AS applications,
               COUNTIF(case_status = 'Certified') AS certifiedApplications,
               ROUND(AVG(IF(case_status = 'Certified', 1.0, 0.0)) * 100, 2) AS certificationRate,
               ROUND(AVG(wage)) AS avgSalary
        FROM base WHERE received_date IS NOT NULL
        GROUP BY name_key, firm_key, fy
      ) GROUP BY name_key, firm_key
    ),
    dist_{key2} AS (
      SELECT name_key, firm_key, ARRAY_AGG(STRUCT(bucket_range AS `range`, bucket_count AS `count`) ORDER BY ord LIMIT 8) AS d_dist
      FROM (
        SELECT name_key, firm_key, bucket_range, COUNT(*) AS bucket_count, {BUCKET_ORDER} AS ord
        FROM (SELECT name_key, {firm_pred} AS firm_key, {bucket_sql('wage')} AS bucket_range FROM base WHERE wage IS NOT NULL)
        GROUP BY name_key, firm_key, bucket_range
      ) GROUP BY name_key, firm_key
    ),
    rows_{key2} AS (
      SELECT s.*, e.d_employers, st.d_states, c.d_cats, tr.d_trends, di.d_dist
      FROM stats_{key2} s
      LEFT JOIN employers_{key2} e USING (name_key, firm_key)
      LEFT JOIN states_{key2} st USING (name_key, firm_key)
      LEFT JOIN cats_{key2} c USING (name_key, firm_key)
      LEFT JOIN trends_{key2} tr USING (name_key, firm_key)
      LEFT JOIN dist_{key2} di USING (name_key, firm_key)
    )"""

    return f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_attorney_summary`
    CLUSTER BY shard AS
    WITH base AS (
      SELECT
        LOWER({ATTORNEY_NAME_SQL}) AS name_key,
        {ATTORNEY_NAME_SQL} AS attorney_name,
        LOWER(COALESCE(lawfirm_name_business_name, '')) AS firm_lower,
        lawfirm_name_business_name AS law_firm,
        agent_attorney_city AS atty_city,
        agent_attorney_state AS atty_state,
        UPPER(TRIM(employer_name)) AS employer,
        UPPER(TRIM(worksite_state)) AS work_state,
        soc_title AS soc,
        case_status, received_date,
        CAST({FY_SQL} AS STRING) AS fy,
        wage_rate_of_pay_from AS wage,
        {RAW_BAND} AS rsal
      FROM {src}
      WHERE agent_attorney_last_name IS NOT NULL AND TRIM(agent_attorney_last_name) != ''
    ),
    {arrays('firm_lower', 'f')},
    {arrays("''", 'a')},
    unioned AS (
      SELECT * FROM rows_f
      UNION ALL
      SELECT * FROM rows_a
    )
    SELECT
      name_key, firm_key, total_applications,
      {shard_sql('name_key', SHARDS['attorney'])} AS shard,
      TO_JSON_STRING(STRUCT(
        display_name AS attorneyName,
        display_firm AS lawFirm,
        display_city AS city,
        display_state AS state,
        total_applications AS totalApplications,
        certified AS certifiedApplications,
        denied AS deniedApplications,
        withdrawn AS withdrawnApplications,
        ROUND(certified * 100.0 / total_applications, 2) AS certificationRate,
        unique_employers AS uniqueEmployers,
        avg_salary AS avgSalary, median_salary AS medianSalary,
        min_salary AS minSalary, max_salary AS maxSalary,
        d_employers AS topEmployers,
        d_states AS topStates,
        d_cats AS topJobCategories,
        d_trends AS yearlyTrends,
        d_dist AS salaryDistribution
      )) AS payload
    FROM unioned
    """


def search_query(src: str, project_id: str) -> str:
    return f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_search_index`
    CLUSTER BY text_lower AS
    SELECT text, LOWER(text) AS text_lower, type, score FROM (
      SELECT employer_name AS text, 'employer' AS type, total_applications AS score
      FROM `{project_id}.{DATASET}.agg_company_summary`
      WHERE total_applications >= 3
      UNION ALL
      SELECT job_title AS text, 'job_title' AS type, total_applications AS score
      FROM `{project_id}.{DATASET}.agg_job_summary`
      WHERE total_applications >= 3
      UNION ALL
      -- City names carry stray punctuation in the raw data ("Austin," vs
      -- "Austin"), which produced duplicate suggestions like "Austin,, TX".
      -- Keep only letters/spaces/hyphens before composing the display string.
      SELECT CONCAT(
               INITCAP(TRIM(REGEXP_REPLACE(worksite_city, r"[^A-Za-z\\-' ]", ''))),
               ', ', UPPER(TRIM(worksite_state))) AS text,
             'location' AS type, COUNT(*) AS score
      FROM {src}
      WHERE worksite_city IS NOT NULL AND TRIM(REGEXP_REPLACE(worksite_city, r"[^A-Za-z\\-' ]", '')) != ''
        AND worksite_state IS NOT NULL AND TRIM(worksite_state) != ''
      GROUP BY text
      HAVING COUNT(*) >= 25
    )
    """


def build_queries(project_id: str):
    src = f'`{project_id}.{DATASET}.{SOURCE_TABLE}`'
    return {
        'agg_company_summary': company_query(src, project_id),
        'agg_job_summary': job_query(src, project_id),
        'agg_city_summary': city_query(src, project_id),
        'agg_state_summary': state_query(src, project_id),
        'agg_attorney_summary': attorney_query(src, project_id),
        'agg_search_index': search_query(src, project_id),
    }


def main():
    parser = argparse.ArgumentParser(description='Rebuild serving aggregate tables')
    parser.add_argument('--project-id', default='immigrant-central')
    parser.add_argument('--only', help='Build a single table by name')
    args = parser.parse_args()

    key_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS') or os.path.join(
        os.path.dirname(__file__), '..', 'serviceAccountKey-prod.json')
    if os.path.exists(key_path):
        creds = service_account.Credentials.from_service_account_file(key_path)
        client = bigquery.Client(project=args.project_id, credentials=creds)
    else:
        client = bigquery.Client(project=args.project_id)

    # CREATE OR REPLACE cannot change a table's clustering spec; drop first
    # when the existing clustering differs from the target.
    target_clustering = {
        'agg_company_summary': ['shard'],
        'agg_job_summary': ['shard'],
        'agg_city_summary': ['shard'],
        'agg_state_summary': None,
        'agg_attorney_summary': ['shard'],
        'agg_search_index': ['text_lower'],
    }

    for name, sql in build_queries(args.project_id).items():
        if args.only and name != args.only:
            continue
        table_ref = f'{args.project_id}.{DATASET}.{name}'
        try:
            existing = client.get_table(table_ref)
            if (existing.clustering_fields or None) != target_clustering[name]:
                print(f'Dropping {name} (clustering change)...')
                client.delete_table(table_ref)
        except Exception:
            pass
        print(f'Building {name}...')
        client.query(sql).result()
        table = client.get_table(f'{args.project_id}.{DATASET}.{name}')
        print(f'  -> {table.num_rows} rows, {table.num_bytes / 1e6:.1f} MB')

    print('All aggregates rebuilt.')


if __name__ == '__main__':
    sys.exit(main())
