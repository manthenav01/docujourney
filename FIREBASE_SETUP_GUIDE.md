# Firebase Test Project Setup Guide

Follow these steps to set up Firebase for the test environment.

## Step 1: Access Firebase Console

1. Go to: https://console.firebase.google.com
2. Click "Add project"
3. **IMPORTANT**: Choose "Add Firebase to a Google Cloud project"
4. Select: `immigrant-central-test` (your existing GCP project)
5. Continue through the setup (disable Google Analytics for test)

## Step 2: Configure Firebase Services

### 2.1 Authentication

1. Go to **Authentication** > **Sign-in method**
2. Enable **Google** provider:
   - Click on Google
   - Enable it
   - Set project public-facing name: "Immigrant Central Test"
   - Set support email: your email
   - Save

3. Go to **Settings** tab
4. Under **Authorized domains**, add:
   - `immigrant-central-test.vercel.app`
   - `localhost` (should be there by default)

### 2.2 Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select location: **us-central1** (same as BigQuery)
5. Create

### 2.3 Storage

1. Go to **Storage**
2. Click **Get started**
3. Keep default rules for now
4. Choose location: **us-central1**
5. Done

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click **Add app** > **Web** (</> icon)
4. App nickname: "Immigrant Central Test Web"
5. Register app
6. You'll see configuration like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "immigrant-central-test.firebaseapp.com",
  projectId: "immigrant-central-test",
  storageBucket: "immigrant-central-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Save these values!** You'll need them for Vercel.

## Step 4: Generate Service Account Key

1. Stay in **Project Settings**
2. Go to **Service Accounts** tab
3. Click **Generate new private key**
4. Save the file as `firebase-admin-test.json`
5. Keep it secure!

## Step 5: Update Local Environment

Create/update `.env.local`:

```env
# Firebase Test Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-from-step-3
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=immigrant-central-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=immigrant-central-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=immigrant-central-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (from service account JSON)
FIREBASE_PROJECT_ID=immigrant-central-test
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@immigrant-central-test.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Step 6: Deploy Security Rules

After Firebase is set up, deploy the security rules:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules,storage:rules --project immigrant-central-test
```

## Step 7: Verify Setup

1. Check Firestore: https://console.firebase.google.com/project/immigrant-central-test/firestore
2. Check Auth: https://console.firebase.google.com/project/immigrant-central-test/authentication
3. Check Storage: https://console.firebase.google.com/project/immigrant-central-test/storage

All should show as active and configured.

## Next: Deploy to Vercel

Once Firebase is configured, you're ready to deploy to Vercel with all the environment variables!