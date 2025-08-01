# 🔐 CI/CD Credential Update Guide

**URGENT**: After the security incident, all CI/CD systems must be updated with new credentials.

## 🚨 CRITICAL: Revoke Old Credentials First!

Before updating CI/CD, ensure you've revoked the compromised credentials:

1. **Google Cloud Console** → IAM & Admin → Service Accounts
   - Revoke key ID: `6c50e695e2fb5027f9a6846478cababb06a60b4b`
2. **Firebase Console** → Project Settings → General  
   - Regenerate API key: `AIzaSyBUKytxsHUuuqsr5sbAZOZ04WKBYuhXbos`

## 🎯 CI/CD Systems to Update

### 1. GitHub Actions Secrets

**Repository**: `docujourney`

#### Current Secrets to Update:
```bash
# Deployment secrets
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id

# Firebase/Google Cloud secrets (ADD THESE NEW ONES)
GOOGLE_APPLICATION_CREDENTIALS_JSON='{...new service account JSON...}'
GOOGLE_CLOUD_PROJECT_ID=doctracker-b4528
GOOGLE_CLOUD_CLIENT_EMAIL=new-service-account@doctracker-b4528.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Firebase Web API Key (NEW)
NEXT_PUBLIC_FIREBASE_API_KEY=your_new_firebase_api_key

# API Keys
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# BigQuery
BIGQUERY_DATASET_ID=h1b_data
BIGQUERY_TABLE_ID=lca_applications
```

#### How to Update GitHub Secrets:

**Option A: Via GitHub Web Interface**
1. Go to: `https://github.com/YOUR_USERNAME/docujourney/settings/secrets/actions`
2. Click "New repository secret" for each secret above
3. Add name and value

**Option B: Via GitHub CLI**
```bash
# Install GitHub CLI if not installed
# gh auth login

# Set secrets (replace with your actual values)
gh secret set GOOGLE_APPLICATION_CREDENTIALS_JSON --body-file new-service-account-key.json
gh secret set GOOGLE_CLOUD_PROJECT_ID --body "doctracker-b4528"  
gh secret set GOOGLE_CLOUD_CLIENT_EMAIL --body "new-sa@doctracker-b4528.iam.gserviceaccount.com"
gh secret set GOOGLE_CLOUD_PRIVATE_KEY --body "-----BEGIN PRIVATE KEY-----..."
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body "your_new_api_key"
gh secret set GOOGLE_GENAI_API_KEY --body "your_gemini_key"
gh secret set BIGQUERY_DATASET_ID --body "h1b_data"
gh secret set BIGQUERY_TABLE_ID --body "lca_applications"

# List all secrets to verify
gh secret list
```

### 2. Vercel Environment Variables

**Projects to Update**:
- `docujourney` (production)
- `immigrant-central-test` (test)

#### Production Environment (`docujourney`)
1. Go to: `https://vercel.com/YOUR_USERNAME/docujourney/settings/environment-variables`
2. Update these variables:

```bash
# Google Cloud (Server-side)
GOOGLE_CLOUD_PROJECT_ID=doctracker-b4528
GOOGLE_CLOUD_CLIENT_EMAIL=new-service-account@doctracker-b4528.iam.gserviceaccount.com  
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Firebase (Client-side - NEXT_PUBLIC prefix)
NEXT_PUBLIC_FIREBASE_API_KEY=your_new_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=doctracker-b4528.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=doctracker-b4528
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=doctracker-b4528.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=213026976072
NEXT_PUBLIC_FIREBASE_APP_ID=1:213026976072:web:40ff129938660330e3037d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WGK0Z3JVF8

# BigQuery
BIGQUERY_DATASET_ID=h1b_data
BIGQUERY_TABLE_ID=lca_applications

# API Keys  
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Environment
NODE_ENV=production
VERCEL_ENV=production
```

#### Test Environment (`immigrant-central-test`)
1. Go to: `https://vercel.com/YOUR_USERNAME/immigrant-central-test/settings/environment-variables`
2. Update with test project credentials:

```bash
# Google Cloud (Test Project)
GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test
GOOGLE_CLOUD_CLIENT_EMAIL=test-service-account@immigrant-central-test.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Firebase Test Project
NEXT_PUBLIC_FIREBASE_API_KEY=test_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=immigrant-central-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=immigrant-central-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=immigrant-central-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=test_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=test_app_id

# BigQuery Test
BIGQUERY_DATASET_ID=h1b_data_test
BIGQUERY_TABLE_ID=lca_applications

# API Keys (can be same as production)
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Environment
NODE_ENV=production
VERCEL_ENV=preview
```

### 3. Update CI/CD Workflows

The current workflows need to be enhanced to use the new credentials:

#### Enhanced GitHub Actions Workflow
Add to `.github/workflows/ci.yml`:

```yaml
  security-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Security Scan
        run: |
          # Check for hardcoded secrets
          if grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git; then
            echo "❌ Found hardcoded API keys"
            exit 1
          fi
          
          # Check for service account patterns
          if grep -r "private_key_id" . --exclude-dir=node_modules --exclude-dir=.git; then
            echo "❌ Found service account keys in code"
            exit 1
          fi
          
          echo "✅ Security check passed"

  test-credentials:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Test BigQuery Connection
        env:
          GOOGLE_CLOUD_PROJECT_ID: ${{ secrets.GOOGLE_CLOUD_PROJECT_ID }}
          GOOGLE_CLOUD_CLIENT_EMAIL: ${{ secrets.GOOGLE_CLOUD_CLIENT_EMAIL }}
          GOOGLE_CLOUD_PRIVATE_KEY: ${{ secrets.GOOGLE_CLOUD_PRIVATE_KEY }}
        run: |
          echo "Testing BigQuery connection..."
          # Add test script to verify credentials work
```

## 🔍 Verification Steps

### 1. GitHub Actions
```bash
# Trigger a CI run to test new credentials
git commit --allow-empty -m "test: verify new credentials"
git push origin main

# Check workflow results
gh run list --limit 1
```

### 2. Vercel Deployments
```bash
# Deploy to test the new environment variables
vercel --prod

# Check deployment logs
vercel logs YOUR_PROJECT_NAME
```

### 3. Application Testing
After updating credentials, test:

- [ ] **Authentication**: Firebase Auth works
- [ ] **Database**: Firestore read/write operations
- [ ] **Storage**: Firebase Storage access
- [ ] **BigQuery**: H1B data dashboard loads
- [ ] **AI Features**: Gemini API integration works

## 🚨 Emergency Rollback

If new credentials don't work:

1. **GitHub Actions**: Revert to previous secrets temporarily
2. **Vercel**: Use previous deployment version
3. **Fix Issues**: Debug credential problems
4. **Re-deploy**: Once fixed, redeploy with correct credentials

## 📋 Credential Update Checklist

### GitHub Actions Secrets:
- [ ] `GOOGLE_APPLICATION_CREDENTIALS_JSON` - New service account JSON
- [ ] `GOOGLE_CLOUD_PROJECT_ID` - Project ID
- [ ] `GOOGLE_CLOUD_CLIENT_EMAIL` - New service account email
- [ ] `GOOGLE_CLOUD_PRIVATE_KEY` - New private key
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - New Firebase web API key
- [ ] `GOOGLE_GENAI_API_KEY` - Gemini API key
- [ ] `BIGQUERY_DATASET_ID` - BigQuery dataset
- [ ] `BIGQUERY_TABLE_ID` - BigQuery table

### Vercel Production Environment:
- [ ] All Google Cloud credentials updated
- [ ] All Firebase credentials updated  
- [ ] BigQuery configuration updated
- [ ] API keys updated
- [ ] Environment variables set correctly

### Vercel Test Environment:
- [ ] Test project credentials configured
- [ ] Firebase test project configured
- [ ] BigQuery test dataset configured
- [ ] Environment variables set correctly

### Validation:
- [ ] GitHub Actions workflows pass
- [ ] Vercel deployments succeed
- [ ] Application functions correctly
- [ ] No credential errors in logs
- [ ] Security scans pass

## 🔗 Quick Links

- **GitHub Secrets**: `https://github.com/YOUR_USERNAME/docujourney/settings/secrets/actions`
- **Vercel Production**: `https://vercel.com/YOUR_USERNAME/docujourney/settings/environment-variables`
- **Vercel Test**: `https://vercel.com/YOUR_USERNAME/immigrant-central-test/settings/environment-variables`
- **Google Cloud Console**: `https://console.cloud.google.com/iam-admin/serviceaccounts`
- **Firebase Console**: `https://console.firebase.google.com/project/doctracker-b4528/settings/general`

---

**⚠️ Remember**: Test thoroughly after updating credentials. Monitor deployments for the first 24 hours to catch any issues early.