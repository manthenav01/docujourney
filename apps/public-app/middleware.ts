import { NextResponse, type NextRequest } from 'next/server';
import { bloomHas } from '@/lib/slug-filter/bloom.mjs';
import { SLUG_FILTER } from '@/lib/slug-filter/data';

// Reject slugs that cannot exist before they reach an ISR page.
//
// Entity pages are ISR, and Next writes a cache entry for a notFound() result
// exactly as it does for a rendered page — so every invented URL a crawler or
// scanner tries costs one billed Vercel ISR write, over an unbounded URL
// space. Answering here turns that into an edge-middleware invocation, which
// sits on a far larger free allowance.
//
// Correctness: the Bloom filter has no false negatives, so anything it rejects
// is genuinely absent from the aggregate tables. False positives fall through
// to the page, which does the real lookup and 404s the same way it did before.

// slugify() output: lowercase alphanumeric groups joined by single hyphens,
// no leading/trailing hyphen. Longest real slug today is 118 chars.
const VALID_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 128;

const KIND_BY_SEGMENT: Record<string, 'c' | 'j'> = {
  company: 'c',
  job: 'j',
};

// Decoded once per isolate: base64 -> bit array is ~384 KB of work, so it must
// not run per request.
let cachedBits: Uint8Array | null = null;
function bits(): Uint8Array {
  if (cachedBits) {
    return cachedBits;
  }
  const binary = atob(SLUG_FILTER.bits);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  cachedBits = out;
  return out;
}

function notFound(): NextResponse {
  // Minimal body: the status code is what crawlers act on, and rendering the
  // styled 404 would mean rendering an ISR page, which is the cost being
  // avoided. Real visitors reach this only via a link to a slug that has no
  // data at all.
  return new NextResponse(
    '<!doctype html><meta charset="utf-8"><title>404 — Not Found</title>' +
    '<meta name="robots" content="noindex">' +
    '<p>No H-1B filings match this URL. ' +
    '<a href="https://www.usimmigrantcentral.com/h1b-dashboard/directory">Browse the directory</a>.</p>',
    {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}

export function middleware(request: NextRequest) {
  // No credentials at build time -> placeholder filter -> behave as before.
  if (!SLUG_FILTER.enabled) {
    return NextResponse.next();
  }

  const segments = request.nextUrl.pathname.split('/');
  // ['', 'h1b-dashboard', <segment>, <slug>]
  const kind = KIND_BY_SEGMENT[segments[2]];
  const slug = segments[3];
  if (!kind || !slug) {
    return NextResponse.next();
  }

  // Shape check first: free, and it catches scanner noise (path traversal,
  // encoded payloads, absurd lengths) that a Bloom false positive would let by.
  if (slug.length > MAX_SLUG_LENGTH || !VALID_SHAPE.test(slug)) {
    return notFound();
  }

  if (!bloomHas(bits(), `${kind}:${slug}`, SLUG_FILTER.m, SLUG_FILTER.k)) {
    return notFound();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/h1b-dashboard/company/:slug', '/h1b-dashboard/job/:slug'],
};
