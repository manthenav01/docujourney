import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

// On-demand revalidation for the whole data surface.
//
// Entity pages sit on a 30-day ISR window because DOL disclosure data only
// changes quarterly, and a shorter window meant one billed ISR write per
// crawled page per day across a 30k-URL sitemap. Freshness comes from here
// instead: scripts/data_pipeline.py calls this endpoint after it rebuilds the
// serving aggregates, so pages refresh when the numbers actually change.
//
// Invalidation is cheap — it only marks entries stale. The regeneration (and
// therefore the ISR write) happens lazily on the next request for each page,
// so this does not itself cost 30k writes.
export const dynamic = 'force-dynamic';

// Route patterns, not concrete URLs: revalidatePath(pattern, 'page') clears
// every page under a dynamic segment in one call.
const PATHS: Array<[string, 'page' | 'layout' | undefined]> = [
  ['/', undefined],
  ['/h1b-dashboard/company/[slug]', 'page'],
  ['/h1b-dashboard/job/[slug]', 'page'],
  ['/h1b-dashboard/locations/[state]', 'page'],
  ['/h1b-dashboard/locations/[state]/[city]', 'page'],
  ['/h1b-dashboard/locations', undefined],
  ['/h1b-sponsors', undefined],
  ['/sitemap.xml', undefined],
  ['/sitemap-companies.xml', undefined],
  ['/sitemap-jobs.xml', undefined],
  ['/sitemap-locations.xml', undefined],
];

function authorized(req: NextRequest, secret: string): boolean {
  const header = req.headers.get('authorization') ?? '';
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) {
    return false;
  }
  const provided = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(secret);
  // Length must match before timingSafeEqual, which throws on a mismatch.
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    // Fail closed: an unset secret must never mean "open to everyone".
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET is not configured' },
      { status: 503 },
    );
  }

  if (!authorized(req, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const revalidated: string[] = [];
  for (const [path, type] of PATHS) {
    revalidatePath(path, type);
    revalidated.push(path);
  }

  // Every BigQuery-backed data-cache entry (dashboard bundles, entity shard
  // payloads, autocomplete) carries the 'bq' tag; new quarterly data must
  // invalidate them or pages would serve month-old cached numbers.
  revalidateTag('bq');
  revalidated.push('tag:bq');

  return NextResponse.json({ revalidated, count: revalidated.length });
}
