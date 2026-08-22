# Google Search Console (GSC) Guide

## 1. Add Property
1.  Go to [Google Search Console](https://search.google.com/search-console).
2.  Click **"Add property"**.
3.  Enter your domain `usimmigrantcentral.com` (Domain property) or URL prefix. Domain property is recommended (requires DNS verification).

## 2. Submit Sitemaps
This is the most critical step to get your new content indexed.
1.  Go to **Sitemaps** in the sidebar.
2.  Submit the following URLs one by one:
    *   `https://usimmigrantcentral.com/sitemap.xml` (Main pages)
    *   `https://usimmigrantcentral.com/sitemap-companies.xml` (Company profiles)
    *   `https://usimmigrantcentral.com/sitemap-jobs.xml` (Job profiles)
    *   `https://usimmigrantcentral.com/sitemap-locations.xml` (Location pages)
3.  Check the "Status" column. usage should say "Success". If it says "Couldn't fetch", wait a few hours and try again, or inspect the URL.

## 3. Verify Breadcrumbs
1.  Go to **Shopping > Product Snippets** or **Enhancements > Breadcrumbs** (if it appears).
2.  If it doesn't appear yet, use the search bar at the top to inspect a specific URL, e.g., `https://usimmigrantcentral.com/h1b-dashboard/job/software-engineer`.
3.  Click **"Test Live URL"**.
4.  Look at the "Breadcrumbs" section in the test result. It should be valid.

## 4. Request Indexing
For high-priority pages (like your Homepage or Dashboard main page):
1.  Paste the URL in the top search bar.
2.  Click **"Request Indexing"**.
    *   *Note*: You have a daily quota for this, so only use it for the most important pages. Sitemaps handles the bulk.

## 5. Monitoring
*   Check the **Pages** report weekly to see "Indexed" vs "Not indexed".
*   Look for "Discovered - currently not indexed" (Google found it but hasn't crawled yet) vs "Crawled - currently not indexed" (Google crawled but decided not to index, often due to quality/duplication).
