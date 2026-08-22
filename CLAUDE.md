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
                          -> ISR pages (revalidate 86400) with server-rendered SEO content
```

- **Serving rule**: entity pages (company/job/state/city) are ISR, never `force-dynamic`, and never read `searchParams` in server components or `generateMetadata` (kills caching). See `lib/seoData.ts` for the cached server-side fetchers.
- **SEO conventions** (canonical host, slug scheme, sitemap layout, structured data): `packages/utils/src/seo.ts` is the source of truth. Canonical host is `https://www.usimmigrantcentral.com`. Slugs: lowercase, `[^a-z0-9]+` → `-`.
- **Sitemaps**: `sitemap.xml` (static+blog), `sitemap-companies.xml` / `sitemap-jobs.xml` (BigQuery, top 1000 each), `sitemap-locations.xml`.
- **Analytics**: GA4 only (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- **Wage data caveat**: raw wages contain unit-conversion artifacts (e.g. $400M "salaries"). Anything user- or crawler-visible must go through `saneSalary()` in `lib/seoData.ts`.

## Deployment (Vercel)

Project `immigrant-central` under team `sunilmanthenas-projects`. See the deploy-procedure memory file; short version:

```bash
vercel deploy --prod --yes
vercel promote <deployment-url> --yes   # domains do NOT follow deploys automatically
```

No Git integration — pushing to GitHub does not deploy. BigQuery env vars live on the Vercel project (build needs them for sitemaps).

## Security Rules

- **Never commit credentials.** `serviceAccountKey*.json`, `.env*`, and `config/environments/` are gitignored — keep it that way. This repo is PUBLIC on GitHub.
- Keys have leaked into git history before (see `ea9453a`, and `config/environments/` removed 2026-08). If a key touches the repo, revoke it in GCP — deleting the file is not enough.

## UX Design Consistency

Follow existing UX patterns when adding features. `TopAttorneysCard.tsx` is the reference pattern for ranking/list cards:
- `Card`/`CardHeader`/`CardTitle`/`CardContent` from `@docujourney/ui`; Card gets `className="w-full"`; titles `text-lg font-semibold flex items-center` with a Lucide icon `w-5 h-5 mr-2`.
- List items: `p-3 bg-muted/20 rounded-lg hover:bg-muted/30`, numbered circle badge, primary text `font-medium text-foreground`, metrics `text-sm text-muted-foreground`, top-5 by default.
- Loading states: 5 skeleton rows with `animate-pulse`; empty states: centered `text-muted-foreground` text, no icons.
- Components: `React.memo()` + `displayName`; `useMemo()` for data transforms; numbers via `formatNumber()`/`formatSalary()`; percentages `toFixed(1)`.
