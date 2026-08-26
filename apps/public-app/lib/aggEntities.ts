import { createHash } from 'node:crypto';
import { BigQuery } from '@google-cloud/bigquery';
import { slugify, STATE_CODE_TO_NAME } from '@docujourney/utils';
import { bqCached, MAX_BYTES_AGG } from './bqCache';
import { bigQueryConfig } from './config';
import { ValidationError } from './validation';
import {
  H1BCompanyAnalysis,
  H1BJobAnalysis,
  H1BCityAnalysis,
  H1BStateAnalysis,
  H1BAttorneyAnalysis,
} from './types';

// Entity dashboards are served from the pre-built agg_* tables
// (scripts/build_aggregates.py), fetched one hash SHARD at a time and held in
// the data cache. A shard is ~1MB and covers ~1000 entities, so a cold page
// costs one small clustered read instead of the 6-8 raw-table scans the
// legacy service methods ran. Shard counts and the hash (first 15 hex chars
// of MD5, mod N) must match build_aggregates.py exactly.
const SHARD_COUNTS = {
  agg_company_summary: 192,
  agg_job_summary: 512,
  agg_city_summary: 48,
  agg_attorney_summary: 128,
} as const;

type ShardTable = keyof typeof SHARD_COUNTS;

const KEY_COLUMNS: Record<ShardTable, string> = {
  agg_company_summary: 'slug',
  agg_job_summary: 'slug',
  agg_city_summary: 'city_key',
  agg_attorney_summary: 'CONCAT(name_key, \'\\u0001\', firm_key)',
};

function shardOf(key: string, n: number): number {
  const hex = createHash('md5').update(key, 'utf8').digest('hex').slice(0, 15);
  return Number(BigInt(`0x${hex}`) % BigInt(n));
}

function client(): BigQuery {
  return new BigQuery({
    projectId: bigQueryConfig.projectId,
    credentials: bigQueryConfig.credentials,
  });
}

async function shardPayloads(table: ShardTable, shard: number): Promise<Record<string, string>> {
  return bqCached(['shard', table, String(shard)], async () => {
    const [rows] = await client().query({
      query: `SELECT ${KEY_COLUMNS[table]} AS k, payload FROM \`${bigQueryConfig.projectId}.h1b_data.${table}\` WHERE shard = @shard`,
      params: { shard },
      maximumBytesBilled: MAX_BYTES_AGG,
    });
    const map: Record<string, string> = {};
    for (const row of rows as Array<{ k: string; payload: string }>) {
      map[row.k] = row.payload;
    }
    return map;
  });
}

// shardKey lets a table hash on a prefix of the row key: attorneys shard on
// the name alone so every (name, firm) row of one attorney shares a shard.
async function lookupPayload(table: ShardTable, key: string, shardKey: string = key): Promise<any | null> {
  if (!key || !shardKey) {
    return null;
  }
  const shard = shardOf(shardKey, SHARD_COUNTS[table]);
  const payloads = await shardPayloads(table, shard);
  const raw = payloads[key];
  return raw ? JSON.parse(raw) : null;
}

// The whole state table is ~60 rows; cache it under a single key.
async function statePayloads(): Promise<Record<string, string>> {
  return bqCached(['states', 'all'], async () => {
    const [rows] = await client().query({
      query: `SELECT state_code, payload FROM \`${bigQueryConfig.projectId}.h1b_data.agg_state_summary\``,
      maximumBytesBilled: MAX_BYTES_AGG,
    });
    const map: Record<string, string> = {};
    for (const row of rows as Array<{ state_code: string; payload: string }>) {
      map[row.state_code] = row.payload;
    }
    return map;
  });
}

const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));

// Mirrors H1BBigQueryService.calculateYoYGrowth, including the tiny-base
// guard that suppresses "+87,850%" badges from entity renames.
function yoy(cy: unknown, py: unknown): { yoyGrowth: number | null; yoyGrowthPercentage: number | null } {
  const currentYear = cy === null || cy === undefined ? null : Number(cy);
  const previousYear = py === null || py === undefined ? null : Number(py);
  if (currentYear === null) {
    return { yoyGrowth: null, yoyGrowthPercentage: null };
  }
  if (previousYear === null || previousYear < 25) {
    return { yoyGrowth: currentYear, yoyGrowthPercentage: null };
  }
  const growth = currentYear - previousYear;
  return {
    yoyGrowth: growth,
    yoyGrowthPercentage: Math.round((growth / previousYear) * 1000) / 10,
  };
}

function mapDistribution(dist: any[] | undefined): Array<{ range: string; count: number }> {
  return (dist || []).map(d => ({ range: d.range, count: num(d.count) }));
}

// The legacy company endpoint synthesized recent activity; keep the shape but
// make it deterministic so cached responses are stable.
function syntheticMonthly(total: number): Array<{ month: string; applications: number }> {
  const year = new Date().getFullYear();
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month: `${month} ${year}`,
    applications: Math.floor((total * 0.15) / 6) + ((i * 17) % 50),
  }));
}

export async function getCompanyAnalysisFromAgg(companyName: string): Promise<H1BCompanyAnalysis> {
  const payload = await lookupPayload('agg_company_summary', slugify(companyName));
  if (!payload || !num(payload.totalApplications)) {
    // Plain Error, matching the legacy service's not-found behavior (the
    // route maps it to the same error envelope it always returned).
    throw new Error(`No H1B data found for company: ${companyName}. Please check the company name and try again.`);
  }
  const totalApplications = num(payload.totalApplications);
  return {
    name: payload.name || companyName,
    totalApplications,
    certifiedApplications: num(payload.certifiedApplications),
    avgSalary: num(payload.avgSalary),
    medianSalary: num(payload.medianSalary),
    minSalary: num(payload.minSalary),
    maxSalary: num(payload.maxSalary),
    topStates: (payload.topStates || []).map((s: any) => ({
      state: s.state,
      applications: num(s.applications),
      percentage: num(s.percentage),
    })),
    topJobTitles: (payload.topJobTitles || []).map((t: any) => ({
      jobTitle: t.jobTitle,
      applications: num(t.applications),
      avgSalary: num(t.avgSalary),
      medianSalary: num(t.avgSalary),
      ...yoy(t.cy, t.py),
    })),
    yearlyTrends: (payload.yearlyTrends || []).map((t: any) => ({
      fiscalYear: String(t.fiscalYear),
      applications: num(t.applications),
      avgSalary: num(t.avgSalary),
      certificationRate: num(t.certificationRate),
    })),
    salaryDistribution: mapDistribution(payload.salaryDistribution),
    recentActivity: syntheticMonthly(totalApplications),
  };
}

export async function getJobAnalysisFromAgg(jobTitle: string): Promise<H1BJobAnalysis> {
  const payload = await lookupPayload('agg_job_summary', slugify(jobTitle));
  if (!payload || !num(payload.totalApplications)) {
    throw new Error(`No H1B data found for job title: ${jobTitle}. Please check the job title and try again.`);
  }
  return {
    title: jobTitle,
    totalApplications: num(payload.totalApplications),
    certifiedApplications: num(payload.certifiedApplications),
    avgSalary: num(payload.avgSalary),
    medianSalary: num(payload.medianSalary),
    minSalary: num(payload.minSalary),
    maxSalary: num(payload.maxSalary),
    fullTimePositions: num(payload.fullTimePositions),
    partTimePositions: num(payload.partTimePositions),
    uniqueEmployers: num(payload.uniqueEmployers),
    topEmployers: (payload.topEmployers || []).map((e: any) => ({
      employer: e.employer,
      applications: num(e.applications),
      avgSalary: num(e.avgSalary),
      medianSalary: num(e.avgSalary),
      ...yoy(e.cy, e.py),
    })),
    topStates: (payload.topStates || []).map((s: any) => ({
      state: s.state,
      applications: num(s.applications),
      percentage: num(s.percentage),
      avgSalary: num(s.avgSalary),
    })),
    yearlyTrends: (payload.yearlyTrends || []).map((t: any) => ({
      fiscalYear: String(t.fiscalYear),
      applications: num(t.applications),
      avgSalary: num(t.avgSalary),
      certificationRate: num(t.certificationRate),
    })),
    salaryDistribution: mapDistribution(payload.salaryDistribution),
    wageLevelAnalysis: (payload.wageLevelAnalysis || []).map((w: any) => ({
      level: w.level || 'Not Specified',
      applications: num(w.applications),
      avgActualWage: num(w.avgActualWage),
      avgPrevailingWage: num(w.avgPrevailingWage),
      abovePrevailingCount: num(w.abovePrevailingCount),
      avgWagePremium: num(w.avgWagePremium),
    })),
  };
}

// City/state parameters arrive as whatever the URL carried — sometimes a
// two-letter code, sometimes a full state name. The table keys on the code.
function resolveStateCode(state: string): string {
  const upper = state.trim().toUpperCase();
  if (upper.length <= 2) {
    return upper;
  }
  const match = Object.entries(STATE_CODE_TO_NAME).find(
    ([, name]) => name.toUpperCase() === upper,
  );
  return match ? match[0] : upper;
}

export async function getCityAnalysisFromAgg(cityName: string, stateName: string): Promise<H1BCityAnalysis> {
  const cityUpper = cityName.trim().toUpperCase();
  let payload = await lookupPayload('agg_city_summary', `${cityUpper}|${stateName.trim().toUpperCase()}`);
  if (!payload) {
    const code = resolveStateCode(stateName);
    if (code !== stateName.trim().toUpperCase()) {
      payload = await lookupPayload('agg_city_summary', `${cityUpper}|${code}`);
    }
  }
  if (!payload || !num(payload.totalApplications)) {
    throw new Error(`No H1B data found for ${cityName}, ${stateName}`);
  }
  return {
    city: cityName,
    state: stateName,
    totalApplications: num(payload.totalApplications),
    certifiedApplications: num(payload.certifiedApplications),
    uniqueEmployers: num(payload.uniqueEmployers),
    avgSalary: num(payload.avgSalary),
    medianSalary: num(payload.medianSalary),
    minSalary: num(payload.minSalary),
    maxSalary: num(payload.maxSalary),
    topEmployers: (payload.topEmployers || []).map((e: any) => ({
      employer: e.employer,
      applications: num(e.applications),
      percentage: num(e.percentage),
      avgSalary: num(e.avgSalary),
      medianSalary: num(e.avgSalary),
    })),
    topJobTitles: (payload.topJobTitles || []).map((t: any) => ({
      jobTitle: t.jobTitle,
      applications: num(t.applications),
      avgSalary: num(t.avgSalary),
      medianSalary: num(t.avgSalary),
      ...yoy(t.cy, t.py),
    })),
    yearlyTrends: (payload.yearlyTrends || []).map((t: any) => ({
      fiscalYear: String(t.fiscalYear),
      applications: num(t.applications),
      avgSalary: num(t.avgSalary),
      certificationRate: num(t.certificationRate),
    })),
    salaryDistribution: mapDistribution(payload.salaryDistribution),
    recentActivity: (payload.recentActivity || []).map((r: any) => ({
      month: r.month,
      applications: num(r.applications),
    })),
  };
}

export async function getStateAnalysisFromAgg(stateName: string): Promise<H1BStateAnalysis> {
  const payloads = await statePayloads();
  const raw = payloads[resolveStateCode(stateName)];
  const payload = raw ? JSON.parse(raw) : null;
  if (!payload || !num(payload.totalApplications)) {
    throw new Error(`No H1B data found for state: ${stateName}`);
  }
  const totalApplications = num(payload.totalApplications);
  const certifiedApplications = num(payload.certifiedApplications);
  return {
    state: stateName,
    totalApplications,
    certifiedApplications,
    deniedApplications: num(payload.deniedApplications),
    withdrawnApplications: num(payload.withdrawnApplications),
    certificationRate: totalApplications > 0
      ? Math.round((certifiedApplications / totalApplications) * 10000) / 100
      : 0,
    avgSalary: num(payload.avgSalary),
    medianSalary: num(payload.medianSalary),
    minSalary: num(payload.minSalary),
    maxSalary: num(payload.maxSalary),
    uniqueEmployers: num(payload.uniqueEmployers),
    uniqueCities: num(payload.uniqueCities),
    uniqueJobTitles: num(payload.uniqueJobTitles),
    topEmployers: (payload.topEmployers || []).map((e: any) => ({
      employer: e.employer,
      applications: num(e.applications),
      percentage: num(e.percentage),
      avgSalary: num(e.avgSalary),
      certificationRate: num(e.certificationRate),
      ...yoy(e.cy, e.py),
    })),
    topCities: (payload.topCities || []).map((c: any) => ({
      city: c.city,
      applications: num(c.applications),
      percentage: num(c.percentage),
      avgSalary: num(c.avgSalary),
      certificationRate: num(c.certificationRate),
    })),
    topJobTitles: (payload.topJobTitles || []).map((t: any) => ({
      jobTitle: t.jobTitle,
      applications: num(t.applications),
      percentage: num(t.percentage),
      avgSalary: num(t.avgSalary),
      certificationRate: num(t.certificationRate),
      ...yoy(t.cy, t.py),
    })),
    yearlyTrends: (payload.yearlyTrends || []).map((t: any) => ({
      fiscalYear: String(t.fiscalYear),
      applications: num(t.applications),
      certifiedApplications: num(t.certifiedApplications),
      certificationRate: num(t.certificationRate),
      avgSalary: num(t.avgSalary),
      ...yoy(t.applications, t.py),
    })),
    salaryDistribution: (payload.salaryDistribution || []).map((d: any) => ({
      range: d.range,
      count: num(d.count),
      percentage: num(d.percentage),
    })),
    recentActivity: (payload.recentActivity || []).map((r: any) => {
      const apps = num(r.applications);
      const certified = num(r.certifiedApplications);
      return {
        month: r.month,
        applications: apps,
        certificationRate: apps > 0 ? Math.round((certified / apps) * 10000) / 100 : 0,
        avgSalary: num(r.avgSalary),
      };
    }),
  };
}

export async function getAttorneyAnalysisFromAgg(attorneyName: string, lawFirm?: string): Promise<H1BAttorneyAnalysis> {
  const nameKey = attorneyName.trim().toLowerCase();
  const firmKey = lawFirm ? lawFirm.trim().toLowerCase() : '';
  const payload = await lookupPayload('agg_attorney_summary', nameKey + '\u0001' + firmKey, nameKey);
  if (!payload || !num(payload.totalApplications)) {
    throw new ValidationError(`No H1B data found for attorney: ${attorneyName}`, 'ATTORNEY_NOT_FOUND');
  }
  const certificationRate = num(payload.certificationRate);
  const recentActivity = [0.08, 0.12, 0.15, 0.2, 0.18, 0.27].map((share, i) => ({
    month: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]} ${new Date().getFullYear()}`,
    applications: Math.floor(num(payload.totalApplications) * share),
    certificationRate: certificationRate + [0, 2, -1, 1, 0, 3][i],
  }));
  return {
    attorneyName: payload.attorneyName || attorneyName,
    lawFirm: payload.lawFirm || 'Unknown Firm',
    city: payload.city || 'Unknown',
    state: payload.state || 'Unknown',
    totalApplications: num(payload.totalApplications),
    certifiedApplications: num(payload.certifiedApplications),
    deniedApplications: num(payload.deniedApplications),
    withdrawnApplications: num(payload.withdrawnApplications),
    certificationRate,
    uniqueEmployers: num(payload.uniqueEmployers),
    avgSalary: num(payload.avgSalary),
    medianSalary: num(payload.medianSalary),
    minSalary: num(payload.minSalary),
    maxSalary: num(payload.maxSalary),
    topEmployers: (payload.topEmployers || []).map((e: any) => ({
      employer: e.employer,
      applications: num(e.applications),
      percentage: num(e.percentage),
      avgSalary: num(e.avgSalary),
      certificationRate: num(e.certificationRate),
    })),
    topStates: (payload.topStates || []).map((s: any) => ({
      state: s.state,
      applications: num(s.applications),
      percentage: num(s.percentage),
      avgSalary: num(s.avgSalary),
    })),
    topJobCategories: (payload.topJobCategories || []).map((c: any) => ({
      jobCategory: c.jobCategory,
      applications: num(c.applications),
      percentage: num(c.percentage),
      avgSalary: num(c.avgSalary),
      certificationRate: num(c.certificationRate),
      ...yoy(c.cy, c.py),
    })),
    yearlyTrends: (payload.yearlyTrends || []).map((t: any) => ({
      fiscalYear: String(t.fiscalYear),
      applications: num(t.applications),
      certifiedApplications: num(t.certifiedApplications),
      certificationRate: num(t.certificationRate),
      avgSalary: num(t.avgSalary),
    })),
    salaryDistribution: mapDistribution(payload.salaryDistribution),
    recentActivity,
  };
}

// --- SEO summaries (server-rendered entity page copy + metadata) ---------

export async function getCompanyPayload(slug: string): Promise<any | null> {
  return lookupPayload('agg_company_summary', slug);
}

export async function getJobPayload(slug: string): Promise<any | null> {
  return lookupPayload('agg_job_summary', slug);
}

export async function getAllStatePayloads(): Promise<any[]> {
  const payloads = await statePayloads();
  return Object.values(payloads).map(raw => JSON.parse(raw));
}
