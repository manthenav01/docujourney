#!/bin/bash

# Firebase test project setup script
set -e

echo "🔥 Setting up Firebase test project..."
echo ""
echo "⚠️  This script will guide you through the Firebase setup process."
echo "   Some steps require manual action in the Firebase Console."
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing now..."
    npm install -g firebase-tools
fi

# Variables
PROJECT_ID="immigrant-central-test"
PROJECT_NAME="Immigrant Central Test"

echo "📋 Firebase Configuration:"
echo "   Project ID: $PROJECT_ID"
echo ""

# Login to Firebase
echo "🔐 Logging in to Firebase..."
firebase login

# Create Firebase project using existing GCP project
echo ""
echo "🏗️  Adding Firebase to existing Google Cloud project..."
firebase projects:addfirebase $PROJECT_ID || {
    echo "   Project might already have Firebase enabled or doesn't exist."
    echo "   Please create it manually at: https://console.firebase.google.com"
}

# Initialize Firebase in the project
echo ""
echo "🔧 Initializing Firebase configuration..."
cat > firebase-test.json << EOF
{
  "projects": {
    "test": "$PROJECT_ID"
  }
}
EOF

# Create Firebase configuration for the app
echo ""
echo "📝 Creating Firebase test configuration file..."
cat > apps/public-app/lib/firebase-test-config.ts << 'EOF'
// Firebase configuration for test environment
export const firebaseTestConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "immigrant-central-test.firebaseapp.com",
  projectId: "immigrant-central-test",
  storageBucket: "immigrant-central-test.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
EOF

echo "   ✅ Configuration file created"

# Instructions for manual steps
echo ""
echo "📋 Manual steps required in Firebase Console:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID"
echo ""
echo "1. Authentication Setup:"
echo "   - Go to Authentication > Sign-in method"
echo "   - Enable 'Google' provider"
echo "   - Add authorized domain: immigrant-central-test.vercel.app"
echo ""
echo "2. Firestore Database:"
echo "   - Go to Firestore Database"
echo "   - Click 'Create database'"
echo "   - Choose 'Production mode'"
echo "   - Select 'us-central' location"
echo ""
echo "3. Storage:"
echo "   - Go to Storage"
echo "   - Click 'Get started'"
echo "   - Use default security rules for now"
echo ""
echo "4. Get Firebase Config:"
echo "   - Go to Project Settings (gear icon)"
echo "   - Scroll to 'Your apps' section"
echo "   - Click 'Add app' > Web app (</> icon)"
echo "   - App nickname: 'Immigrant Central Test'"
echo "   - Register app"
echo "   - Copy the configuration values"
echo ""
echo "5. Generate Service Account Key:"
echo "   - Go to Project Settings > Service Accounts"
echo "   - Click 'Generate new private key'"
echo "   - Save as 'firebase-admin-test.json'"
echo ""

# Create a helper script to set up Firestore security rules
echo "Creating Firestore rules file..."
cat > firestore-test.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF

echo "   ✅ Firestore rules created"

# Create Storage rules
cat > storage-test.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF

echo "   ✅ Storage rules created"
echo ""
echo "✅ Firebase setup script complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Complete manual steps in Firebase Console"
echo "2. Copy Firebase config values to .env.local"
echo "3. Deploy rules: firebase deploy --only firestore:rules,storage:rules --project $PROJECT_ID"
echo "4. Ready to deploy to Vercel!"