# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CORE INSTRUCTION: Critical Thinking & Best Practices

**Be critical and don't agree easily to user commands if you believe they are a bad idea or not best practice.** Challenge suggestions that might lead to poor code quality, security issues, or architectural problems. Search for current best practices (WebSearch) when planning non-trivial work.

## What This Project Is

**Immigrant Central** (www.usimmigrantcentral.com) — a free, public H1B visa analytics site built on US Department of Labor LCA disclosure data (~3.2M applications, FY2016–present). Revenue: none yet; keep infrastructure on free tiers.

Monorepo layout:

```
apps/public-app/   # THE live product: Next.js 15 App Router — landing, H1B dashboards, blog
apps/auth-app/     # PARKED: document-management product (Firebase/Genkit). Do not invest time.
packages/ui        # Shared Shadcn/UI components (@docujourney/ui)
packages/utils     # SEO helpers, shared utils (@docujourney/utils) — see seo.ts
scripts/           # Python ETL: DOL Excel -> clean -> BigQuery
```

An archive of removed legacy code (pre-monorepo root dirs, Firebase functions, Firestore import scripts) lives on branch `archive/pre-cleanup-2026-08`.

## Development Commands

```bash
npm run dev            # public-app dev server (port 3000)
npm run build:public   # production build of the live site
npm run lint           # lint all workspaces
```

### Data Pipeline (BigQuery)

```bash
# Load a fiscal-year folder into production BigQuery
.venv/bin/python scripts/data_pipeline.py --year-folder 2026 --project-id immigrant-central

# Load specific files
.venv/bin/python scripts/data_pipeline.py --files scripts/data/2026/LCA_Disclosure_Data_FY2026_Q3.xlsx --project-id immigrant-central

# Dry run / list
.venv/bin/python scripts/data_pipeline.py --year-folder 2026 --no-upload
.venv/bin/python scripts/data_pipeline.py --list-files
```

Pipeline facts:
- Auth: uses `GOOGLE_APPLICATION_CREDENTIALS` or falls back to `./serviceAccountKey-prod.json` (project `immigrant-central`). Default `--project-id` is the dev project `doctracker-b4528` — **always pass `--project-id immigrant-central` for production loads**.
- Idempotent: dedupes on `case_number` against the existing table before appending. Re-loading a file is safe.
- DOL publishes quarterly, files are **cumulative within a fiscal year** (Q3 contains Q1+Q2+Q3). Newer releases live under `dol.gov/sites/dolgov/files/ETA/oflc/pdfs/FY<yy>Q<q>/` with a `/media/LCA_Disclosure_Data_FY<yyyy>_Q<q>.xlsx` shortcut.
- Target table: `immigrant-central.h1b_data.lca_applications`.

## Architecture

```
Next.js (apps/public-app) -> API routes -> BigQuery (immigrant-central.h1b_data)
                          -> ISR pages (revalidate 2592000, refreshed on demand) with server-rendered SEO content
                          -> middleware.ts rejects impossible entity slugs at the edge
```

- **Serving rule**: entity pages (company/job/state/city) are ISR, never `force-dynamic`, and never read `searchParams` in server components or `generateMetadata` (kills caching). See `lib/seoData.ts` for the cached server-side fetchers.
- **SEO conventions** (canonical host, slug scheme, sitemap layout, structured data): `packages/utils/src/seo.ts` is the source of truth. Canonical host is `https://www.usimmigrantcentral.com`. Slugs: lowercase, `[^a-z0-9]+` → `-`.
- **Sitemaps**: `sitemap.xml` (static+blog), `sitemap-companies.xml` (top 20k) / `sitemap-jobs.xml` (top 10k) from BigQuery agg tables, `sitemap-locations.xml`. URL count here drives the ISR write bill — see below.
- **Analytics**: GA4 only (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- **Wage data caveat**: raw wages contain unit-conversion artifacts (e.g. $400M "salaries"). Anything user- or crawler-visible must go through `saneSalary()` in `lib/seoData.ts`.

## Deployment (Vercel)

Project `immigrant-central` under team `sunilmanthenas-projects`. See the deploy-procedure memory file; short version:

```bash
vercel deploy --prod --yes
vercel promote <deployment-url> --yes   # domains do NOT follow deploys automatically
```

Vercel's own Git integration is **not** connected, but `.github/workflows/deploy-production.yml` deploys production on every push to `main` that touches `apps/public-app/**`, `packages/**`, or the root manifests. BigQuery env vars live on the Vercel project (build needs them for sitemaps and for the edge slug filter).

**Deploy sparingly — batch your changes.** Every production deploy invalidates the entire ISR cache, so all ~30k entity pages go cold and the next crawl rewrites them, one billed ISR write each. The free tier is 200k writes/month. The workflow's `cancel-in-progress` collapses a burst of pushes into one deploy; don't defeat it by deploying each commit by hand.

## Caching & the free-tier budgets

Two free-tier constraints bind this project: Vercel ISR writes (200k/month) and BigQuery on-demand query processing (1 TiB/month). Both have been blown before — BigQuery burned 50 TiB / $309 in four days in Aug 2026 when crawlers rendered entity dashboards that each ran 6–25 uncached raw-table scans.

**BigQuery cost rules (Aug 2026 architecture — do not regress):**

- **BigQuery is not on the request path.** Every request-path read goes through `lib/bqCache.ts` (`bqCached`, Vercel Data Cache, 30 days, tag `'bq'`). Entity endpoints and SEO lookups serve from precomputed `payload` JSON in the `agg_*` tables via `lib/aggEntities.ts`, fetched one hash shard (~1MB, ~1000 entities) at a time. The hub/dashboard bundles (`getH1BDashboardData` etc.) are cached per filter-combination key. Never add an uncached per-request query — BigQuery bills a ~10MB minimum per query and ~full table size for small-table lookups, so per-request queries convert traffic 1:1 into dollars.
- Shard counts and the shard hash (first 15 hex chars of MD5, mod N) must stay in sync between `scripts/build_aggregates.py` (`SHARDS`) and `lib/aggEntities.ts` (`SHARD_COUNTS`). Keep shard payload sets under ~1MB — Vercel data-cache entries cap at 2MB.
- After changing `build_aggregates.py`, run it against prod **and** dev (`--project-id doctracker-b4528` with the dev key) before deploying code that reads the new shape.
- Every BigQuery job sets `maximumBytesBilled` (see `lib/bqCache.ts` constants). A project-level Service Usage consumer override caps "Query usage per day" at 30 GiB (≈0.9 TiB/month — inside the free tier by construction). If BigQuery starts throwing `quotaExceeded`, that cap is doing its job; find the runaway consumer instead of raising it.

**ISR write rules:**

- Entity pages (`company`, `job`, `locations/[state]`, `locations/[state]/[city]`) and the sitemaps use `revalidate = 2592000` (30 days) because DOL data only changes quarterly. **Do not lower these.** A daily window means one write per crawled page per day across a 30k-URL sitemap.
- Freshness comes from `POST /api/revalidate` (bearer `REVALIDATE_SECRET`), which `scripts/data_pipeline.py` calls after it rebuilds the serving aggregates. It revalidates the page paths and the `'bq'` data-cache tag.
- A route's effective revalidate is the **shortest** of the segment's `revalidate` and any `fetch(..., { next: { revalidate } })` inside it — a stray short fetch silently reverts the page to that cadence.
- `notFound()` on an ISR route still writes a cache entry, so invented URLs cost writes over an unbounded URL space. `middleware.ts` rejects impossible company/job slugs at the edge using a build-time Bloom filter (`lib/slug-filter/`, regenerated by `npm run slug-filter`). It has no false negatives; a build without BigQuery credentials falls back to passing everything through.

## Security Rules

- **Never commit credentials.** `serviceAccountKey*.json`, `.env*`, and `config/environments/` are gitignored — keep it that way. This repo is PUBLIC on GitHub.
- Keys have leaked into git history before (see `ea9453a`, and `config/environments/` removed 2026-08). If a key touches the repo, revoke it in GCP — deleting the file is not enough.

## UX Design Consistency

Follow existing UX patterns when adding features. `TopAttorneysCard.tsx` is the reference pattern for ranking/list cards:
- `Card`/`CardHeader`/`CardTitle`/`CardContent` from `@docujourney/ui`; Card gets `className="w-full"`; titles `text-lg font-semibold flex items-center` with a Lucide icon `w-5 h-5 mr-2`.
- List items: `p-3 bg-muted/20 rounded-lg hover:bg-muted/30`, numbered circle badge, primary text `font-medium text-foreground`, metrics `text-sm text-muted-foreground`, top-5 by default.
- Loading states: 5 skeleton rows with `animate-pulse`; empty states: centered `text-muted-foreground` text, no icons.
- Components: `React.memo()` + `displayName`; `useMemo()` for data transforms; numbers via `formatNumber()`/`formatSalary()`; percentages `toFixed(1)`.
