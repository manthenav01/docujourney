import { cache } from 'react';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';

// Server-side data for SEO pages, read from the pre-built aggregate tables
// (scripts/build_aggregates.py) instead of scanning the 3GB raw table:
// a slug lookup here touches kilobytes, so crawling every entity page daily
// costs effectively nothing against the BigQuery free tier.
//
// Shared between generateMetadata() and the page body via React cache() so
// each request runs at most one lookup per entity. Every fetcher fails soft
// (null) — pages must render without data, falling back to the client-side
// dashboard fetch exactly as before.

export interface CompanySEOSummary {
  name: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  uniqueJobTitles: number;
  topStates: Array<{ state: string; applications: number }>;
  topJobTitles: Array<{ jobTitle: string; applications: number; avgSalary: number }>;
}

export interface JobSEOSummary {
  title: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  uniqueEmployers: number;
  topStates: Array<{ state: string; applications: number }>;
  topEmployers: Array<{ employer: string; applications: number; avgSalary: number }>;
}

function client(): BigQuery {
  return new BigQuery({
    projectId: bigQueryConfig.projectId,
    credentials: bigQueryConfig.credentials,
  });
}

const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));

export const getCompanySEOData = cache(
  async (slug: string): Promise<CompanySEOSummary | null> => {
    try {
      const [rows] = await client().query({
        query: `
          SELECT * FROM \`${bigQueryConfig.projectId}.h1b_data.agg_company_summary\`
          WHERE slug = @slug LIMIT 1`,
        params: { slug },
      });
      if (!rows.length || !rows[0].total_applications) {return null;}
      const r = rows[0];
      return {
        name: r.employer_name,
        totalApplications: num(r.total_applications),
        certifiedApplications: num(r.certified_applications),
        avgSalary: num(r.avg_salary),
        medianSalary: num(r.median_salary),
        minSalary: num(r.min_salary),
        maxSalary: num(r.max_salary),
        uniqueJobTitles: num(r.unique_job_titles),
        topStates: (r.top_states || []).map((s: any) => ({ state: s.state, applications: num(s.applications) })),
        topJobTitles: (r.top_job_titles || []).map((t: any) => ({
          jobTitle: t.job_title, applications: num(t.applications), avgSalary: num(t.avg_salary),
        })),
      };
    } catch (error) {
      console.error('SEO data fetch failed for company slug:', slug, error);
      return null;
    }
  },
);

export const getJobSEOData = cache(
  async (slug: string): Promise<JobSEOSummary | null> => {
    try {
      const [rows] = await client().query({
        query: `
          SELECT * FROM \`${bigQueryConfig.projectId}.h1b_data.agg_job_summary\`
          WHERE slug = @slug LIMIT 1`,
        params: { slug },
      });
      if (!rows.length || !rows[0].total_applications) {return null;}
      const r = rows[0];
      return {
        title: r.job_title,
        totalApplications: num(r.total_applications),
        certifiedApplications: num(r.certified_applications),
        avgSalary: num(r.avg_salary),
        medianSalary: num(r.median_salary),
        minSalary: num(r.min_salary),
        maxSalary: num(r.max_salary),
        uniqueEmployers: num(r.unique_employers),
        topStates: (r.top_states || []).map((s: any) => ({ state: s.state, applications: num(s.applications) })),
        topEmployers: (r.top_employers || []).map((e: any) => ({
          employer: e.employer, applications: num(e.applications), avgSalary: num(e.avg_salary),
        })),
      };
    } catch (error) {
      console.error('SEO data fetch failed for job slug:', slug, error);
      return null;
    }
  },
);

// Top entity slugs, used by generateStaticParams to prebuild the head of
// each page type at deploy time. Fails soft to [] (pages fall back to ISR).
export async function getTopSlugs(
  table: 'agg_company_summary' | 'agg_job_summary',
  limit: number,
): Promise<string[]> {
  try {
    const [rows] = await client().query({
      query: `
        SELECT slug FROM \`${bigQueryConfig.projectId}.h1b_data.${table}\`
        ORDER BY total_applications DESC LIMIT ${Math.min(limit, 1000)}`,
    });
    return rows.map((r: any) => r.slug).filter(Boolean);
  } catch (error) {
    console.error('getTopSlugs failed for', table, error);
    return [];
  }
}

export interface StateSEOSummary {
  state: string;            // two-letter code
  applications: number;
  certifiedApplications: number;
  avgSalary: number;
}

// All states with filing counts, for the locations directory page.
// One grouped scan over the raw table, cached by ISR (page revalidates daily).
export const getStateSEOData = cache(
  async (): Promise<StateSEOSummary[]> => {
    try {
      const [rows] = await client().query({
        query: `
          SELECT
            UPPER(TRIM(worksite_state)) AS state,
            COUNT(*) AS applications,
            COUNTIF(case_status = 'Certified') AS certified,
            AVG(CASE WHEN (CASE wage_unit_of_pay
                  WHEN 'Hour' THEN wage_rate_of_pay_from * 2080
                  WHEN 'Week' THEN wage_rate_of_pay_from * 52
                  WHEN 'Month' THEN wage_rate_of_pay_from * 12
                  WHEN 'Bi-Weekly' THEN wage_rate_of_pay_from * 26
                  ELSE wage_rate_of_pay_from END) BETWEEN 30000 AND 900000
                THEN (CASE wage_unit_of_pay
                  WHEN 'Hour' THEN wage_rate_of_pay_from * 2080
                  WHEN 'Week' THEN wage_rate_of_pay_from * 52
                  WHEN 'Month' THEN wage_rate_of_pay_from * 12
                  WHEN 'Bi-Weekly' THEN wage_rate_of_pay_from * 26
                  ELSE wage_rate_of_pay_from END) END) AS avg_salary
          FROM \`${bigQueryConfig.projectId}.h1b_data.lca_applications\`
          WHERE worksite_state IS NOT NULL AND TRIM(worksite_state) != ''
          GROUP BY state
          ORDER BY applications DESC`,
      });
      return rows.map((r: any) => ({
        state: r.state,
        applications: num(r.applications),
        certifiedApplications: num(r.certified),
        avgSalary: num(r.avg_salary),
      }));
    } catch (error) {
      console.error('SEO data fetch failed for states:', error);
      return [];
    }
  },
);

export function approvalRate(total: number, certified: number): number {
  if (!total) {return 0;}
  return (certified / total) * 100;
}

// The raw wage data contains unit-conversion artifacts (e.g. annual salaries
// recorded as hourly and multiplied by 2080, producing $400M+ "salaries").
// Never let those reach titles, descriptions, or visible SEO copy.
export function saneSalary(value?: number): number | undefined {
  return value && value >= 15_000 && value <= 1_500_000 ? value : undefined;
}

const NOISY_TITLE = /\d{3,}/; // internal codes appended to titles, e.g. "... 1615.60770"

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, c => c.toUpperCase());
}

// Roles for display copy: drop titles with internal codes or single filings.
// Aggregate rows are already ranked by application volume.
export function cleanTopRoles(
  titles: Array<{ jobTitle?: string; title?: string; applications?: number }> | undefined,
  count: number,
): string[] {
  return (titles || [])
    .filter(t => {
      const name = t.jobTitle || t.title;
      return name && !NOISY_TITLE.test(name) && (t.applications ?? 0) >= 2;
    })
    .slice(0, count)
    .map(t => toTitleCase((t.jobTitle || t.title) as string));
}
