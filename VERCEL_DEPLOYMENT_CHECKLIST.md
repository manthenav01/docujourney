# Vercel Test Deployment Checklist

## ✅ Completed
- [x] Google Cloud project created: `immigrant-central-test`
- [x] BigQuery dataset with 100k test records
- [x] Service account key: `serviceAccountKey-test.json`
- [x] Environment configuration files updated
- [x] Vercel CLI installed
- [x] Deployment files prepared

## 📋 Ready to Deploy

### 1. Set Up Firebase (Manual Steps)
Follow the guide in `FIREBASE_SETUP_GUIDE.md`:
1. Add Firebase to existing GCP project
2. Enable Authentication (Google provider)
3. Create Firestore database
4. Set up Storage
5. Get Firebase configuration
6. Generate Firebase admin key

### 2. Link Vercel Project
```bash
cd /Users/manthena08/personal-work/docujourney
vercel link
```
When prompted:
- Set up and deploy: Y
- Which scope: (select your account)
- Link to existing project? **No**
- Project name: `immigrant-central-test`
- Directory: `./apps/public-app`

### 3. Add Environment Variables
Go to: https://vercel.com/[your-username]/immigrant-central-test/settings/environment-variables

Add these variables (copy from files):

#### From `.vercel-env-test`:
```
NODE_ENV=production
VERCEL_ENV=preview
GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test
BIGQUERY_DATASET_ID=h1b_data_test
BIGQUERY_TABLE_ID=lca_applications
```

#### From `.vercel-credentials-test`:
```
GOOGLE_APPLICATION_CREDENTIALS_JSON=(entire JSON string)
```

#### Add manually:
```
GOOGLE_GENAI_API_KEY=AIzaSyDZidIqkIZhMHKTEb13Yd6jHOGU-CDAy6w
```

#### From Firebase Console (after setup):
```
NEXT_PUBLIC_FIREBASE_API_KEY=(from Firebase)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=immigrant-central-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=immigrant-central-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=immigrant-central-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=(from Firebase)
NEXT_PUBLIC_FIREBASE_APP_ID=(from Firebase)
```

### 4. Deploy
```bash
vercel --prod
```

### 5. Test Your Deployment
Visit: https://immigrant-central-test.vercel.app

Test:
- [ ] H1B Dashboard loads
- [ ] Data displays from BigQuery
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Authentication (if Firebase is set up)

## 🎯 Quick Commands

```bash
# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs immigrant-central-test

# List environment variables
vercel env ls
```

## 🔍 Troubleshooting

### If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Check `vercel.json` is correct
4. Ensure monorepo paths are correct

### If BigQuery fails:
1. Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set correctly
2. Check project ID matches
3. Verify dataset name is correct

### If site loads but no data:
1. Check browser console for errors
2. Verify API routes are working: `/api/h1b-data`
3. Check BigQuery permissions

## 🚀 Ready to Deploy!

Once Firebase is set up, you can run:
```bash
vercel --prod
```

Your test environment will be live at:
**https://immigrant-central-test.vercel.app**