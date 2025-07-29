#!/bin/bash

# Vercel deployment script for test environment
set -e

echo "🚀 Deploying to Vercel Test Environment..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Variables
PROJECT_NAME="immigrant-central-test"

echo "📋 Deployment Configuration:"
echo "   Project: $PROJECT_NAME"
echo "   Environment: Test (Preview)"
echo ""

# Check for required files
echo "🔍 Checking required files..."
if [ ! -f "serviceAccountKey-test.json" ]; then
    echo "❌ Missing serviceAccountKey-test.json"
    echo "   Run ./scripts/setup-gcp-test.sh first"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local found. Creating from template..."
    cp .env.test.example .env.local
    echo "   Please update .env.local with your Firebase configuration"
fi

# Create Vercel configuration
echo ""
echo "📝 Creating Vercel environment configuration..."
cat > .vercel-env-test << 'EOF'
# Test Environment Variables for Vercel
# Copy these to Vercel Dashboard > Settings > Environment Variables

NODE_ENV=production
VERCEL_ENV=preview

# Google Cloud / BigQuery
GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test
BIGQUERY_DATASET_ID=h1b_data_test
BIGQUERY_TABLE_ID=lca_applications

# You need to add:
# GOOGLE_APPLICATION_CREDENTIALS_JSON=(contents of serviceAccountKey-test.json)
# GOOGLE_GENAI_API_KEY=your-genai-key

# Firebase Configuration (add after setting up Firebase)
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=immigrant-central-test.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=immigrant-central-test
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=immigrant-central-test.appspot.com
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
# NEXT_PUBLIC_FIREBASE_APP_ID=
EOF

echo "   ✅ Environment template created: .vercel-env-test"

# Prepare service account JSON
echo ""
echo "📋 Preparing credentials..."
echo "GOOGLE_APPLICATION_CREDENTIALS_JSON=" > .vercel-credentials-test
cat serviceAccountKey-test.json | jq -c . >> .vercel-credentials-test
echo "" >> .vercel-credentials-test
echo "   ✅ Credentials prepared: .vercel-credentials-test"

# Instructions
echo ""
echo "📋 Deployment Steps:"
echo ""
echo "1. First-time setup (if not done already):"
echo "   vercel link"
echo "   - Choose: Link to existing project? No"
echo "   - Project name: immigrant-central-test"
echo "   - Directory: ./apps/public-app"
echo ""
echo "2. Add environment variables in Vercel Dashboard:"
echo "   https://vercel.com/your-username/immigrant-central-test/settings/environment-variables"
echo ""
echo "   Copy from:"
echo "   - .vercel-env-test (basic variables)"
echo "   - .vercel-credentials-test (credentials)"
echo "   - Add Firebase config from Firebase Console"
echo ""
echo "3. Deploy:"
echo "   vercel --prod"
echo ""
echo "4. Your test site will be available at:"
echo "   https://immigrant-central-test.vercel.app"
echo ""
echo "🔐 Security Notes:"
echo "   - Never commit .vercel-credentials-test"
echo "   - Delete these files after adding to Vercel"
echo "   - Use Vercel's environment variables for all secrets"

# Add to gitignore
if ! grep -q ".vercel-env-test" .gitignore; then
    echo "" >> .gitignore
    echo "# Vercel deployment files" >> .gitignore
    echo ".vercel-env-test" >> .gitignore
    echo ".vercel-credentials-test" >> .gitignore
    echo "   ✅ Added to .gitignore"
fi