// Bloom filter shared by the build-time generator (scripts/build-slug-filter.mjs)
// and the edge middleware. Both sides MUST use the same hashing, so the
// implementation lives here rather than being duplicated.
//
// Why a Bloom filter: the valid slug set is ~600k entries, far too large to
// ship to the edge verbatim. A Bloom filter has no false negatives, so a
// "not present" answer is always safe to 404 on; a false positive just falls
// through to the ISR page, which does the real BigQuery lookup and 404s
// properly. Sizing therefore only trades bundle bytes against how much junk
// traffic we catch, never against correctness.

const FNV_PRIME = 0x01000193;
export const SEED_A = 0x811c9dc5;
export const SEED_B = 0x9e3779b9;

/**
 * FNV-1a, 32-bit. Slugs are ASCII by construction (slugify() maps everything
 * outside [a-z0-9] to '-'), so charCodeAt is equivalent to iterating UTF-8
 * bytes here.
 * @param {string} str
 * @param {number} seed
 * @returns {number}
 */
function fnv1a(str, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

/**
 * Kirsch-Mitzenmacher double hashing: k probes from two hashes instead of k
 * independent ones. h2 is forced odd so the walk can never stall on one bit.
 * @param {string} value
 * @param {number} m total bits
 * @param {number} k probe count
 * @returns {number[]}
 */
export function probes(value, m, k) {
  const h2 = (fnv1a(value, SEED_B) | 1) >>> 0;
  let h = fnv1a(value, SEED_A) >>> 0;
  const out = new Array(k);
  for (let i = 0; i < k; i++) {
    out[i] = h % m;
    h = (h + h2) >>> 0;
  }
  return out;
}

/**
 * @param {Uint8Array} bytes
 * @param {string} value
 * @param {number} m
 * @param {number} k
 */
export function bloomAdd(bytes, value, m, k) {
  const idx = probes(value, m, k);
  for (let i = 0; i < idx.length; i++) {
    const bit = idx[i];
    bytes[bit >>> 3] |= 1 << (bit & 7);
  }
}

/**
 * @param {Uint8Array} bytes
 * @param {string} value
 * @param {number} m
 * @param {number} k
 * @returns {boolean} false means definitely absent; true means probably present
 */
export function bloomHas(bytes, value, m, k) {
  const idx = probes(value, m, k);
  for (let i = 0; i < idx.length; i++) {
    const bit = idx[i];
    if ((bytes[bit >>> 3] & (1 << (bit & 7))) === 0) return false;
  }
  return true;
}
