// Fallback copied to data.ts when scripts/build-slug-filter.mjs cannot reach
// BigQuery (local dev without credentials, CI). `enabled: false` makes the
// middleware pass every request straight through, i.e. exactly the behaviour
// from before the filter existed — a build without credentials must never
// start 404ing real pages.
import type { SlugFilter } from './types';

export const SLUG_FILTER: SlugFilter = {
  enabled: false,
  m: 0,
  k: 0,
  bits: '',
  companies: 0,
  jobs: 0,
  falsePositiveRate: 0,
  builtAt: null,
};
