#!/bin/bash
# Script to update Vercel environment variables with new secure credentials
# Usage: ./scripts/security/update-vercel-env.sh [production|test]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Vercel Environment Variables Update${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Check environment argument
ENVIRONMENT=${1:-production}

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "test" ]; then
    echo -e "${RED}❌ Invalid environment. Use 'production' or 'test'${NC}"
    echo "Usage: $0 [production|test]"
    exit 1
fi

# Set project-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_NAME="docujourney"
    GCP_PROJECT_ID="doctracker-b4528"
    FIREBASE_AUTH_DOMAIN="doctracker-b4528.firebaseapp.com"
    FIREBASE_PROJECT_ID="doctracker-b4528"
    FIREBASE_STORAGE_BUCKET="doctracker-b4528.firebasestorage.app"
    FIREBASE_MESSAGING_SENDER_ID="213026976072"
    FIREBASE_APP_ID="1:213026976072:web:40ff129938660330e3037d"
    FIREBASE_MEASUREMENT_ID="G-WGK0Z3JVF8"
    BIGQUERY_DATASET_ID="h1b_data"
    VERCEL_ENV_VALUE="production"
else
    PROJECT_NAME="immigrant-central-test"
    GCP_PROJECT_ID="immigrant-central-test"
    FIREBASE_AUTH_DOMAIN="immigrant-central-test.firebaseapp.com"
    FIREBASE_PROJECT_ID="immigrant-central-test"
    FIREBASE_STORAGE_BUCKET="immigrant-central-test.appspot.com"
    FIREBASE_MESSAGING_SENDER_ID="test_sender_id"
    FIREBASE_APP_ID="test_app_id"
    FIREBASE_MEASUREMENT_ID=""
    BIGQUERY_DATASET_ID="h1b_data_test"
    VERCEL_ENV_VALUE="preview"
fi

echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo ""

# Function to set environment variable
set_env_var() {
    local name=$1
    local value=$2
    local environment=$3
    
    if [ ! -z "$value" ]; then
        echo -e "${YELLOW}Setting: ${name}${NC}"
        if vercel env add "$name" "$environment" <<< "$value" &>/dev/null; then
            echo -e "${GREEN}✅ ${name} updated${NC}"
        else
            echo -e "${RED}❌ Failed to update ${name}${NC}"
        fi
    fi
}

echo -e "${YELLOW}🔍 Checking for required credential files...${NC}"

# Check for service account key file
if [ "$ENVIRONMENT" = "production" ]; then
    SERVICE_ACCOUNT_FILE="serviceAccountKey.json"
else
    SERVICE_ACCOUNT_FILE="serviceAccountKey-test.json"
fi

if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo -e "${RED}❌ Service account key file not found: $SERVICE_ACCOUNT_FILE${NC}"
    echo ""
    echo "Please ensure you have generated a new service account key after revoking the compromised one."
    echo "Place it as $SERVICE_ACCOUNT_FILE in the project root."
    exit 1
fi

echo -e "${GREEN}✅ Service account key found${NC}"

# Read values from user for new credentials
echo ""
echo -e "${YELLOW}📝 Enter new credential values (press Enter to skip):${NC}"
echo ""

read -p "🔑 New Firebase API Key: " FIREBASE_API_KEY
read -p "🤖 Google Gemini API Key: " GEMINI_API_KEY
read -p "📧 Service Account Email: " SERVICE_ACCOUNT_EMAIL
read -sp "🔐 Service Account Private Key (paste full key): " PRIVATE_KEY
echo ""

# Validate private key format
if [ ! -z "$PRIVATE_KEY" ] && [[ ! "$PRIVATE_KEY" =~ "-----BEGIN PRIVATE KEY-----" ]]; then
    echo -e "${RED}❌ Invalid private key format. Should start with '-----BEGIN PRIVATE KEY-----'${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Updating Vercel environment variables...${NC}"
echo ""

# Set environment variables
set_env_var "NODE_ENV" "production" "$VERCEL_ENV_VALUE"
set_env_var "VERCEL_ENV" "$VERCEL_ENV_VALUE" "$VERCEL_ENV_VALUE"

# Google Cloud credentials
set_env_var "GOOGLE_CLOUD_PROJECT_ID" "$GCP_PROJECT_ID" "$VERCEL_ENV_VALUE"
set_env_var "GOOGLE_CLOUD_CLIENT_EMAIL" "$SERVICE_ACCOUNT_EMAIL" "$VERCEL_ENV_VALUE"
set_env_var "GOOGLE_CLOUD_PRIVATE_KEY" "$PRIVATE_KEY" "$VERCEL_ENV_VALUE"

# Firebase configuration (client-side)
set_env_var "NEXT_PUBLIC_FIREBASE_API_KEY" "$FIREBASE_API_KEY" "$VERCEL_ENV_VALUE"
set_env_var "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$FIREBASE_AUTH_DOMAIN" "$VERCEL_ENV_VALUE"
set_env_var "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID" "$VERCEL_ENV_VALUE"
set_env_var "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "$FIREBASE_STORAGE_BUCKET" "$VERCEL_ENV_VALUE"
set_env_var "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "$FIREBASE_MESSAGING_SENDER_ID" "$VERCEL_ENV_VALUE"
set_env_var "NEXT_PUBLIC_FIREBASE_APP_ID" "$FIREBASE_APP_ID" "$VERCEL_ENV_VALUE"

if [ ! -z "$FIREBASE_MEASUREMENT_ID" ]; then
    set_env_var "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" "$FIREBASE_MEASUREMENT_ID" "$VERCEL_ENV_VALUE"
fi

# BigQuery configuration
set_env_var "BIGQUERY_DATASET_ID" "$BIGQUERY_DATASET_ID" "$VERCEL_ENV_VALUE"
set_env_var "BIGQUERY_TABLE_ID" "lca_applications" "$VERCEL_ENV_VALUE"

# API Keys
set_env_var "GOOGLE_GENAI_API_KEY" "$GEMINI_API_KEY" "$VERCEL_ENV_VALUE"

# Add Google Application Credentials JSON if service account file exists
if [ -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo -e "${YELLOW}Setting: GOOGLE_APPLICATION_CREDENTIALS_JSON${NC}"
    SERVICE_ACCOUNT_JSON=$(cat "$SERVICE_ACCOUNT_FILE" | jq -c .)
    if vercel env add "GOOGLE_APPLICATION_CREDENTIALS_JSON" "$VERCEL_ENV_VALUE" <<< "$SERVICE_ACCOUNT_JSON" &>/dev/null; then
        echo -e "${GREEN}✅ GOOGLE_APPLICATION_CREDENTIALS_JSON updated${NC}"
    else
        echo -e "${RED}❌ Failed to update GOOGLE_APPLICATION_CREDENTIALS_JSON${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Environment variables update completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Verify variables in Vercel Dashboard:"
echo "   https://vercel.com/YOUR_USERNAME/${PROJECT_NAME}/settings/environment-variables"
echo ""
echo "2. Trigger a new deployment to test:"
echo "   vercel --prod"
echo ""
echo "3. Monitor deployment logs:"
echo "   vercel logs ${PROJECT_NAME}"
echo ""
echo "4. Test application functionality after deployment"
echo ""

# List current environment variables
echo -e "${BLUE}📋 Current environment variables:${NC}"
vercel env ls --scope "$PROJECT_NAME" || echo "Run 'vercel link' if not linked to project"

echo ""
echo -e "${GREEN}🎉 Vercel environment update completed for ${ENVIRONMENT} environment!${NC}"