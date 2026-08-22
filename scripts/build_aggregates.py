#!/usr/bin/env python3
"""Build serving aggregates from the raw LCA table.

The raw table is ~3GB and every scan of it costs quota; these aggregates are a
few MB and answer everything the SEO pages and autocomplete need. Rebuilt after
every data load (called from data_pipeline.py and the data-refresh workflow).

Tables produced in <project>.h1b_data:
  agg_company_summary  - one row per employer slug (stats + top states/titles)
  agg_job_summary      - one row per cleaned job-title slug (stats + top employers/states)
  agg_search_index     - one row per suggestible entity for autocomplete
"""

import argparse
import os
import sys

from google.cloud import bigquery
from google.oauth2 import service_account

DATASET = 'h1b_data'
SOURCE_TABLE = 'lca_applications'

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

SLUG_SQL = "REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM({col})), r'[^a-z0-9]+', '-'), r'^-+|-+$', '')"

# Strip internal job codes appended to titles, e.g. "ENGINEER - JC-123"
CLEAN_TITLE_SQL = (
    "CASE WHEN REGEXP_CONTAINS(job_title, r' - [A-Z0-9]+-[0-9]+$') "
    "THEN TRIM(REGEXP_REPLACE(job_title, r' - [A-Z0-9]+-[0-9]+$', '')) "
    "ELSE TRIM(job_title) END"
)


def build_queries(project_id: str):
    src = f'`{project_id}.{DATASET}.{SOURCE_TABLE}`'

    company = f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_company_summary`
    CLUSTER BY slug AS
    WITH base AS (
      SELECT
        TRIM(employer_name) AS employer_name,
        {SLUG_SQL.format(col='employer_name')} AS slug,
        case_status,
        UPPER(TRIM(worksite_state)) AS state,
        {CLEAN_TITLE_SQL} AS job_title,
        {SALARY_SQL} AS salary
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
        COUNT(DISTINCT job_title) AS unique_job_titles
      FROM base
      GROUP BY slug
      HAVING slug != ''
    ),
    states AS (
      SELECT slug, ARRAY_AGG(STRUCT(state, applications) ORDER BY applications DESC LIMIT 5) AS top_states
      FROM (
        SELECT slug, state, COUNT(*) AS applications
        FROM base WHERE state IS NOT NULL AND state != ''
        GROUP BY slug, state
      )
      GROUP BY slug
    ),
    titles AS (
      SELECT slug, ARRAY_AGG(STRUCT(job_title, applications, avg_salary) ORDER BY applications DESC LIMIT 8) AS top_job_titles
      FROM (
        SELECT slug, job_title, COUNT(*) AS applications, AVG(salary) AS avg_salary
        FROM base WHERE job_title IS NOT NULL AND job_title != ''
        GROUP BY slug, job_title
      )
      GROUP BY slug
    )
    SELECT s.*, st.top_states, t.top_job_titles
    FROM stats s
    LEFT JOIN states st USING (slug)
    LEFT JOIN titles t USING (slug)
    """

    job = f"""
    CREATE OR REPLACE TABLE `{project_id}.{DATASET}.agg_job_summary`
    CLUSTER BY slug AS
    WITH base AS (
      SELECT
        {CLEAN_TITLE_SQL} AS job_title,
        {SLUG_SQL.format(col=CLEAN_TITLE_SQL)} AS slug,
        case_status,
        UPPER(TRIM(worksite_state)) AS state,
        TRIM(employer_name) AS employer,
        {SALARY_SQL} AS salary
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
        COUNT(DISTINCT employer) AS unique_employers
      FROM base
      GROUP BY slug
      HAVING slug != ''
    ),
    states AS (
      SELECT slug, ARRAY_AGG(STRUCT(state, applications) ORDER BY applications DESC LIMIT 5) AS top_states
      FROM (
        SELECT slug, state, COUNT(*) AS applications
        FROM base WHERE state IS NOT NULL AND state != ''
        GROUP BY slug, state
      )
      GROUP BY slug
    ),
    employers AS (
      SELECT slug, ARRAY_AGG(STRUCT(employer, applications, avg_salary) ORDER BY applications DESC LIMIT 8) AS top_employers
      FROM (
        SELECT slug, employer, COUNT(*) AS applications, AVG(salary) AS avg_salary
        FROM base WHERE employer IS NOT NULL AND employer != ''
        GROUP BY slug, employer
      )
      GROUP BY slug
    )
    SELECT s.*, st.top_states, e.top_employers
    FROM stats s
    LEFT JOIN states st USING (slug)
    LEFT JOIN employers e USING (slug)
    """

    search = f"""
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
      SELECT CONCAT(INITCAP(TRIM(worksite_city)), ', ', UPPER(TRIM(worksite_state))) AS text,
             'location' AS type, COUNT(*) AS score
      FROM {src}
      WHERE worksite_city IS NOT NULL AND TRIM(worksite_city) != ''
        AND worksite_state IS NOT NULL AND TRIM(worksite_state) != ''
      GROUP BY text
      HAVING COUNT(*) >= 25
    )
    """

    return {
        'agg_company_summary': company,
        'agg_job_summary': job,
        'agg_search_index': search,
    }


def main():
    parser = argparse.ArgumentParser(description='Rebuild serving aggregate tables')
    parser.add_argument('--project-id', default='immigrant-central')
    args = parser.parse_args()

    key_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS') or os.path.join(
        os.path.dirname(__file__), '..', 'serviceAccountKey-prod.json')
    if os.path.exists(key_path):
        creds = service_account.Credentials.from_service_account_file(key_path)
        client = bigquery.Client(project=args.project_id, credentials=creds)
    else:
        client = bigquery.Client(project=args.project_id)

    for name, sql in build_queries(args.project_id).items():
        print(f'Building {name}...')
        client.query(sql).result()
        table = client.get_table(f'{args.project_id}.{DATASET}.{name}')
        print(f'  -> {table.num_rows} rows, {table.num_bytes / 1e6:.1f} MB')

    print('All aggregates rebuilt.')


if __name__ == '__main__':
    sys.exit(main())
