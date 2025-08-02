# BigQuery Setup for Production

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository settings for BigQuery to work in production:

### Vercel Deployment Secrets
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

### Google Cloud / BigQuery Secrets
- `GOOGLE_CLOUD_PROJECT_ID` - The Google Cloud project ID (e.g., "immigrant-central")
- `GOOGLE_CLOUD_PRIVATE_KEY` - The service account private key (include the full key with BEGIN/END lines)
- `GOOGLE_CLOUD_CLIENT_EMAIL` - The service account email (e.g., "bigquery-service@immigrant-central.iam.gserviceaccount.com")

## How to Set Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret listed above

## Environment-Specific Configuration

### Production (main branch)
- Project ID: `immigrant-central`
- Dataset: `h1b_data`
- Table: `lca_applications`

### Preview/Test (preview branch)
- Project ID: `immigrant-central-test`
- Dataset: `h1b_data`
- Table: `lca_applications`

## Verifying the Setup

After deploying, you can verify BigQuery is working by visiting:
- Production: https://www.usimmigrantcentral.com/api/h1b-data?fiscalYears=2025
- Preview: https://preview.usimmigrantcentral.com/api/h1b-data?fiscalYears=2025

## Troubleshooting

If you get a 500 error on the API endpoint:
1. Check that all GitHub secrets are properly set
2. Verify the service account has BigQuery Data Viewer permissions
3. Check the Vercel function logs for specific error messages
4. Ensure the private key is properly formatted (newlines should be actual newlines, not \n)

## Service Account Permissions

The service account needs the following permissions:
- `bigquery.datasets.get`
- `bigquery.tables.get`
- `bigquery.tables.getData`
- `bigquery.jobs.create`

The easiest way is to grant the "BigQuery Data Viewer" role to the service account.