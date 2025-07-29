# 🚀 Deploy to Vercel - Quick Start Guide

## Current Status
✅ Google Cloud project ready with 100k test records
✅ All configuration files updated
✅ Deployment files prepared
❌ Firebase setup pending
❌ Vercel deployment pending

## Step-by-Step Deployment

### 1. Login to Vercel
```bash
vercel login
```
Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email)

### 2. Link Your Project
```bash
vercel link
```
When prompted:
- Set up and deploy? **Y**
- Which scope? **(select your account)**
- Link to existing project? **No**
- What's your project's name? **immigrant-central-test**
- In which directory? **./apps/public-app**

### 3. Quick Deploy (Without Firebase)
You can deploy now with just BigQuery to test:

```bash
# Set minimal environment variables
vercel env add GOOGLE_CLOUD_PROJECT_ID
# Enter: immigrant-central-test

vercel env add BIGQUERY_DATASET_ID  
# Enter: h1b_data_test

vercel env add BIGQUERY_TABLE_ID
# Enter: lca_applications

vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON
# Paste the entire JSON from: cat .vercel-credentials-test

vercel env add GOOGLE_GENAI_API_KEY
# Enter: AIzaSyDZidIqkIZhMHKTEb13Yd6jHOGU-CDAy6w

# Deploy!
vercel --prod
```

### 4. Your Test Site
After deployment, your site will be available at:
**https://immigrant-central-test.vercel.app**

## What Works Without Firebase
✅ H1B Dashboard
✅ Search functionality  
✅ Filters and data visualization
✅ All BigQuery features

## What Requires Firebase
❌ User authentication
❌ Document upload
❌ Profile management
❌ Timeline features

## Quick Test URLs
Once deployed, test these:
- Dashboard: https://immigrant-central-test.vercel.app/h1b-dashboard
- API Test: https://immigrant-central-test.vercel.app/api/h1b-data

## Add Firebase Later
When ready, follow `FIREBASE_SETUP_GUIDE.md` and add these env vars:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

## 🎉 Ready to Deploy!
Run the commands above and your test environment will be live in minutes!