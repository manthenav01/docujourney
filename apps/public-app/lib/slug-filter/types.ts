export interface SlugFilter {
  /** false => middleware passes everything through (no credentials at build). */
  enabled: boolean;
  /** Total bits in the filter. */
  m: number;
  /** Probes per lookup. */
  k: number;
  /** Base64-encoded bit array, m/8 bytes. */
  bits: string;
  /** Row counts the filter was built from, for build-log sanity checks. */
  companies: number;
  jobs: number;
  /** Estimated false-positive rate at build time. */
  falsePositiveRate: number;
  /** ISO timestamp, or null for the placeholder. */
  builtAt: string | null;
}
