import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { slugify } from './seo';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a company name to a URL-friendly slug.
 * Must match the slug scheme of the BigQuery aggregate tables and sitemaps
 * ([^a-z0-9]+ -> "-"): punctuation is hyphenated, not stripped, so
 * "AMAZON.COM SERVICES LLC" -> "amazon-com-services-llc".
 */
export function createCompanySlug(companyName: string): string {
  return slugify(companyName);
}

/**
 * Converts an attorney name to a URL-friendly slug (same shared scheme).
 */
export function createAttorneySlug(attorneyName: string): string {
  return slugify(attorneyName);
}
