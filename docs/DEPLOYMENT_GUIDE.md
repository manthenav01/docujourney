# DocuJourney H1B Dashboard - Deployment & CI/CD Guide

## Overview

This guide covers the complete deployment and CI/CD process for the DocuJourney H1B dashboard, including environment setup, data pipeline, and production deployment.

## Architecture

### Environment Structure
```
Development  → doctracker-b4528      (Local development)
Test         → immigrant-central-test (Vercel preview)
Production   → doctracker-prod       (Vercel production - TO BE CREATED)
```

### Data Flow
```
H1B Excel Data → Python Processing → BigQuery → Next.js API → Dashboard
```

## Environment Setup

### 1. Development Environment

**Prerequisites:**
- Node.js 18+ and npm
- Python 3.8+ with pandas, google-cloud-bigquery
- Google Cloud CLI (optional)

**Setup:**
```bash
# Install dependencies
npm install

# Set up development environment
cp config/environments/development.env apps/public-app/.env.local

# Ensure service account key exists
ls serviceAccountKey.json

# Start development server
cd apps/public-app && npm run dev
```

**Configuration:**
- Uses `doctracker-b4528` project
- Service account key authentication
- Dataset: `h1b_data`

### 2. Test Environment (Vercel Preview)

**Current Setup:**
- **Project**: `immigrant-central-test`
- **Dataset**: `h1b_data` 
- **Deployment**: Automatic on PR creation
- **Data**: 340,770 H1B applications (FY2025 focus)
- **Vercel Project**: `immigrant-central`

**Vercel Environment Variables:**
```bash
GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test
GOOGLE_CLOUD_CLIENT_EMAIL=bigquery-test-service@immigrant-central-test.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
BIGQUERY_DATASET_ID=h1b_data
BIGQUERY_TABLE_ID=lca_applications
```

### 3. Production Environment (TO BE CREATED)

## Production Setup Process

### Step 1: Create Production Google Cloud Project

1. **Create new GCP project:**
   ```bash
   gcloud projects create doctracker-prod --name="DocuJourney Production"
   ```

2. **Enable required APIs:**
   ```bash
   gcloud services enable bigquery.googleapis.com --project=doctracker-prod
   gcloud services enable storage.googleapis.com --project=doctracker-prod
   ```

3. **Create service account:**
   ```bash
   gcloud iam service-accounts create bigquery-prod-service \
     --description="BigQuery service account for production" \
     --display-name="BigQuery Production Service" \
     --project=doctracker-prod
   ```

4. **Grant necessary roles:**
   ```bash
   gcloud projects add-iam-policy-binding doctracker-prod \
     --member="serviceAccount:bigquery-prod-service@doctracker-prod.iam.gserviceaccount.com" \
     --role="roles/bigquery.dataEditor"
     
   gcloud projects add-iam-policy-binding doctracker-prod \
     --member="serviceAccount:bigquery-prod-service@doctracker-prod.iam.gserviceaccount.com" \
     --role="roles/bigquery.jobUser"
   ```

5. **Create and download service account key:**
   ```bash
   gcloud iam service-accounts keys create serviceAccountKey-prod.json \
     --iam-account=bigquery-prod-service@doctracker-prod.iam.gserviceaccount.com \
     --project=doctracker-prod
   ```

### Step 2: Set Up BigQuery Infrastructure

1. **Create dataset:**
   ```bash
   bq mk --project_id=doctracker-prod --dataset h1b_data
   ```

2. **Upload H1B data using the data pipeline:**
   ```bash
   # Update scripts/data_pipeline.py with production project ID
   python scripts/data_pipeline.py --year-folder 2025-q2
   ```

### Step 3: Configure Vercel Production Environment

1. **Update Vercel environment variables:**
   ```bash
   # Set production environment variables
   vercel env add GOOGLE_CLOUD_PROJECT_ID production
   # Enter: doctracker-prod
   
   vercel env add GOOGLE_CLOUD_CLIENT_EMAIL production  
   # Enter: bigquery-prod-service@doctracker-prod.iam.gserviceaccount.com
   
   vercel env add GOOGLE_CLOUD_PRIVATE_KEY production
   # Enter: [content from serviceAccountKey-prod.json private_key field]
   
   vercel env add BIGQUERY_DATASET_ID production
   # Enter: h1b_data
   
   vercel env add BIGQUERY_TABLE_ID production
   # Enter: lca_applications
   ```

2. **Update production config:**
   ```typescript
   // Update config/environments/production.env with actual values
   GOOGLE_CLOUD_PROJECT_ID=doctracker-prod
   GOOGLE_CLOUD_CLIENT_EMAIL=bigquery-prod-service@doctracker-prod.iam.gserviceaccount.com
   // ... etc
   ```

### Step 4: Deploy to Production

1. **Deploy to production:**
   ```bash
   vercel --prod
   ```

2. **Verify deployment:**
   ```bash
   curl -s "https://immigrant-central.vercel.app/api/h1b-data" | jq .data.totalApplications
   ```

## Data Pipeline Process

### Initial Data Setup

1. **Prepare H1B data files:**
   ```bash
   # Place Excel files in scripts/data/[year]/
   ls scripts/data/2025-q2/LCA_Disclosure_Data_FY2025_Q2.xlsx
   ```

2. **Run data cleanup and upload:**
   ```bash
   # Clean Excel data
   npm run cleanup:employer-data
   
   # Upload to BigQuery (specify target project in scripts)
   python scripts/data_pipeline.py --year-folder 2025-q2
   ```

3. **Verify data upload:**
   ```bash
   python scripts/verify_upload.py
   ```

### Ongoing Data Updates

```bash
# For new quarterly data releases
1. Download new Excel files from DOL
2. Place in scripts/data/[year-quarter]/
3. Run cleanup and upload pipeline
4. Deploy updated dashboard
```

## CI/CD Workflow

### Current Automated Process

1. **Pull Request:**
   - Triggers Vercel preview deployment
   - Uses test environment (`immigrant-central-test`)
   - Automatic BigQuery connection
   - Preview URL generated

2. **Merge to Main:**
   - Triggers production deployment (once configured)
   - Uses production environment (`doctracker-prod`)
   - Full data pipeline validation

### Manual Deployment Commands

```bash
# Deploy to preview (test environment)
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

## Environment Variables Summary

| Variable | Development | Test | Production |
|----------|-------------|------|------------|
| `GOOGLE_CLOUD_PROJECT_ID` | `doctracker-b4528` | `immigrant-central-test` | `doctracker-prod` |
| `BIGQUERY_DATASET_ID` | `h1b_data` | `h1b_data` | `h1b_data` |
| `BIGQUERY_TABLE_ID` | `lca_applications` | `lca_applications` | `lca_applications` |
| Authentication | Service key file | Env vars | Env vars |

## Security Considerations

1. **Service Account Keys:**
   - Never commit service account keys to version control
   - Use environment variables for deployed environments
   - Rotate keys regularly

2. **Environment Isolation:**
   - Each environment uses separate Google Cloud projects
   - No cross-environment data access
   - Separate service accounts with minimal permissions

3. **Data Privacy:**
   - H1B data is public information (from DOL)
   - No PII processing or storage
   - BigQuery access logs monitored

## Monitoring & Maintenance

### Health Checks
```bash
# API health check
curl -s https://your-domain.vercel.app/api/h1b-data | jq .metadata

# BigQuery connection test  
curl -s https://your-domain.vercel.app/api/debug | jq .env
```

### Performance Monitoring
- Monitor Vercel function execution times
- Track BigQuery query costs and performance
- Set up alerts for API failures

### Data Updates
- Quarterly H1B data releases from Department of Labor
- Annual data cleanup and archival
- Performance optimization for large datasets

## Troubleshooting

### Common Issues

1. **BigQuery Connection Errors:**
   - Check service account permissions
   - Verify environment variables are set correctly
   - Ensure project ID matches service account project

2. **Build Failures:**
   - Often caused by environment variables not available at build time
   - Ensure lazy initialization in API routes
   - Check for missing dependencies

3. **Data Pipeline Failures:**
   - Verify Excel file format matches expected schema
   - Check BigQuery dataset exists and is accessible
   - Ensure sufficient permissions for data upload

### Debug Commands
```bash
# Check current configuration
curl -s http://localhost:3000/api/debug | jq .

# Test BigQuery connection
node apps/public-app/test_bigquery_connection.js

# Verify data integrity
python scripts/verify_upload.py
```

## Support & Documentation

- **Code Repository**: GitHub repository with full source code
- **Environment Configs**: `config/environments/` directory
- **Data Pipeline**: `scripts/` directory with Python processing tools
- **API Documentation**: Built-in API documentation at `/api/docs`

---

**Next Steps After Reading This Guide:**
1. Review current environment setup
2. Create production Google Cloud project when ready
3. Configure production environment variables
4. Test production deployment process
5. Set up monitoring and alerts