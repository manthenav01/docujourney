# Test Environment Setup Guide

This guide walks you through setting up the test environment for Immigrant Central.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install
- `bq` (BigQuery CLI) installed (comes with gcloud)
- Node.js and npm installed
- Access to Vercel account

## Step 1: Create Google Cloud Test Project

Run the setup script:

```bash
./scripts/setup-gcp-test.sh
```

This script will:
- Create project: `immigrant-central-test`
- Enable BigQuery API
- Create dataset: `h1b_data_test`
- Create service account with proper permissions
- Generate service account key: `serviceAccountKey-test.json`

## Step 2: Import Test Data

After the project is created, import a subset of H1B data:

```bash
./scripts/import-test-data.sh
```

This imports the last 2 years of H1B data (limited to 100k rows for testing).

## Step 3: Create Firebase Test Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: `immigrant-central-test`
4. Disable Google Analytics (for test environment)
5. Create project

### Configure Firebase Services:

1. **Authentication**:
   - Enable Google sign-in provider
   - Add test domain to authorized domains: `immigrant-central-test.vercel.app`

2. **Firestore Database**:
   - Create database in production mode
   - Choose `us-central` location
   - Update security rules for test environment

3. **Storage**:
   - Create default bucket
   - Set up basic security rules

### Generate Firebase Admin SDK Key:

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save as `firebase-admin-test.json`

## Step 4: Setup Vercel Test Deployment

### 4.1 Create Vercel Project

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Create new project
vercel link
```

When prompted:
- Set up a new project
- Project name: `immigrant-central-test`
- Framework: Next.js
- Root directory: `apps/public-app`

### 4.2 Configure Environment Variables

In Vercel dashboard (https://vercel.com/dashboard):

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:

```bash
# Node environment
NODE_ENV=development
VERCEL_ENV=preview

# Google Cloud / BigQuery
GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test
BIGQUERY_DATASET_ID=h1b_data_test
BIGQUERY_TABLE_ID=lca_applications

# Copy contents of serviceAccountKey-test.json
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Firebase (from Firebase console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-test-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=immigrant-central-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=immigrant-central-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=immigrant-central-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Other services
GOOGLE_GENAI_API_KEY=your-genai-key
```

### 4.3 Deploy to Test Environment

```bash
# Deploy to Vercel
vercel --prod
```

Your test site will be available at: `https://immigrant-central-test.vercel.app`

## Step 5: Update Local Development

Create `.env.local` for local testing:

```bash
cp .env.example .env.local
```

Update with test environment values:

```env
# Test Environment Configuration
GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test
BIGQUERY_DATASET_ID=h1b_data_test
BIGQUERY_TABLE_ID=lca_applications
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Firebase Test Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-test-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=immigrant-central-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=immigrant-central-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=immigrant-central-test.appspot.com
```

## Step 6: Test the Deployment

1. Visit: `https://immigrant-central-test.vercel.app`
2. Test H1B dashboard functionality
3. Verify data loads from test BigQuery dataset
4. Test authentication with Firebase

## Monitoring & Debugging

### BigQuery Console
- https://console.cloud.google.com/bigquery?project=immigrant-central-test

### Firebase Console
- https://console.firebase.google.com/project/immigrant-central-test

### Vercel Dashboard
- https://vercel.com/your-username/immigrant-central-test

## Cost Management

The test environment uses:
- BigQuery sandbox (free tier available)
- Limited data subset (100k rows)
- Firebase free tier
- Vercel hobby plan

Estimated monthly cost: < $10

## Next Steps

After test environment is working:

1. Set up production environment (`immigrant-central-prod`)
2. Configure custom domain
3. Set up CI/CD pipeline
4. Implement monitoring and analytics

## Troubleshooting

### BigQuery Errors
- Check service account permissions
- Verify dataset and table names
- Check environment variables in Vercel

### Firebase Errors
- Verify authorized domains include Vercel URL
- Check Firebase project ID matches
- Ensure authentication is enabled

### Build Errors
- Check all environment variables are set
- Verify monorepo configuration in vercel.json
- Check build logs in Vercel dashboard