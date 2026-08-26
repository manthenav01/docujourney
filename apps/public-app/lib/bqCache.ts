import { unstable_cache } from 'next/cache';

// Every BigQuery read on the request path goes through this wrapper, which
// stores the result in Vercel's Data Cache for 30 days under the 'bq' tag.
// DOL data changes quarterly; the pipeline's POST /api/revalidate call
// invalidates the tag, so a shorter window would only buy repeat scans.
//
// This is the cost boundary of the whole site: BigQuery on-demand bills a
// minimum of ~10MB per query and each agg-table lookup bills tens of MB, so
// serving must hit BigQuery once per cache key per month, not once per
// request. Do not remove this layer or add uncached per-request queries —
// that is exactly what produced the August 2026 $300 BigQuery bill.
export const BQ_CACHE_REVALIDATE = 2_592_000; // 30 days, matches ISR windows

// Hard per-query guards: a single runaway query cannot bill more than this.
// The raw table is ~3GB; agg shard reads are tens of MB.
export const MAX_BYTES_RAW = '8000000000'; // 8 GB, headroom for raw-table scans as data grows
export const MAX_BYTES_AGG = '1000000000'; // 1 GB for aggregate-table reads

export function bqCached<T>(keyParts: string[], fn: () => Promise<T>): Promise<T> {
  return unstable_cache(fn, ['bq', ...keyParts], {
    revalidate: BQ_CACHE_REVALIDATE,
    tags: ['bq'],
  })();
}
