import { cache } from 'react';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BCompanyAnalysis, H1BJobAnalysis } from '@/lib/types';

// Server-side data fetchers for SEO: shared between generateMetadata() and the
// page body via React cache() so each request runs at most one BigQuery lookup
// per entity. Every fetcher fails soft (null) — pages must render without data,
// falling back to the client-side dashboard fetch exactly as before.

export const getCompanySEOData = cache(
  async (companyName: string): Promise<H1BCompanyAnalysis | null> => {
    try {
      const service = createH1BBigQueryService();
      const data = await service.getCompanyAnalysis(companyName);
      // A name that matches nothing comes back with zero applications — treat as no data
      if (!data || !data.totalApplications) {return null;}
      return data;
    } catch (error) {
      console.error('SEO data fetch failed for company:', companyName, error);
      return null;
    }
  },
);

export const getJobSEOData = cache(
  async (jobTitle: string): Promise<H1BJobAnalysis | null> => {
    try {
      const service = createH1BBigQueryService();
      const data = await service.getJobAnalysis(jobTitle);
      if (!data || !data.totalApplications) {return null;}
      return data;
    } catch (error) {
      console.error('SEO data fetch failed for job:', jobTitle, error);
      return null;
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

// Company topJobTitles come back ranked by salary (highest-paying roles).
// Keep that order but drop titles with internal codes or single-filing noise.
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
