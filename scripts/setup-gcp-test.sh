#!/bin/bash

# Setup script for Google Cloud test environment
# This script creates the immigrant-central-test project and configures BigQuery

set -e

echo "🚀 Setting up Google Cloud test environment..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Variables
PROJECT_ID="immigrant-central-test"
PROJECT_NAME="Immigrant Central Test"
DATASET_ID="h1b_data_test"
SERVICE_ACCOUNT_NAME="bigquery-test-service"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Dataset: $DATASET_ID"
echo "   Service Account: $SERVICE_ACCOUNT_EMAIL"
echo ""

# Check if user is authenticated
echo "🔐 Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "Please authenticate with Google Cloud:"
    gcloud auth login
fi

# Get current billing account
echo "💳 Checking billing account..."
BILLING_ACCOUNT=$(gcloud billing accounts list --filter=open=true --format="value(name)" | head -n 1)
if [ -z "$BILLING_ACCOUNT" ]; then
    echo "❌ No active billing account found. Please set up billing first."
    exit 1
fi
echo "   Using billing account: $BILLING_ACCOUNT"

# Create project
echo ""
echo "🏗️  Creating project: $PROJECT_ID"
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo "   Project already exists, skipping creation..."
else
    gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
    echo "   ✅ Project created"
    
    # Link billing account
    echo "   Linking billing account..."
    gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
    echo "   ✅ Billing linked"
fi

# Set project as default
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs..."
gcloud services enable bigquery.googleapis.com
gcloud services enable iam.googleapis.com
echo "   ✅ APIs enabled"

# Create BigQuery dataset
echo ""
echo "📊 Setting up BigQuery..."
if bq ls -d | grep -q "^${DATASET_ID}$"; then
    echo "   Dataset $DATASET_ID already exists"
else
    bq mk -d \
        --location=US \
        --description="H1B test data for immigrant-central-test environment" \
        $DATASET_ID
    echo "   ✅ Dataset created: $DATASET_ID"
fi

# Create service account
echo ""
echo "🔑 Creating service account..."
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
    echo "   Service account already exists"
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="BigQuery Test Service Account" \
        --description="Service account for BigQuery access in test environment"
    echo "   ✅ Service account created"
fi

# Grant permissions to service account
echo "   Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/bigquery.dataViewer" \
    --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/bigquery.jobUser" \
    --quiet

echo "   ✅ Permissions granted"

# Create service account key
echo ""
echo "📥 Generating service account key..."
KEY_FILE="serviceAccountKey-test.json"
if [ -f "$KEY_FILE" ]; then
    echo "   ⚠️  Key file already exists: $KEY_FILE"
    echo "   Delete it first if you want to regenerate"
else
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    echo "   ✅ Key saved to: $KEY_FILE"
    echo "   ⚠️  IMPORTANT: Keep this file secure and never commit it to git!"
fi

# Create sample table structure
echo ""
echo "📋 Creating table structure..."
cat > create_table.sql << 'EOF'
CREATE TABLE IF NOT EXISTS `immigrant-central-test.h1b_data_test.lca_applications` (
  case_number STRING,
  case_status STRING,
  received_date DATE,
  decision_date DATE,
  employer_name STRING,
  employer_address STRING,
  employer_city STRING,
  employer_state STRING,
  employer_postal_code STRING,
  employer_country STRING,
  employer_province STRING,
  employer_phone STRING,
  employer_phone_ext STRING,
  agent_attorney_first_name STRING,
  agent_attorney_last_name STRING,
  agent_attorney_city STRING,
  agent_attorney_state STRING,
  lawfirm_name_business_name STRING,
  job_title STRING,
  soc_code STRING,
  soc_title STRING,
  full_time_position BOOL,
  begin_date DATE,
  end_date DATE,
  total_worker_positions INT64,
  new_employment INT64,
  continued_employment INT64,
  change_previous_employment INT64,
  new_concurrent_employment INT64,
  change_employer INT64,
  amended_petition INT64,
  worksite_city STRING,
  worksite_county STRING,
  worksite_state STRING,
  worksite_postal_code STRING,
  wage_rate_of_pay_from FLOAT64,
  wage_rate_of_pay_to FLOAT64,
  wage_unit_of_pay STRING,
  prevailing_wage FLOAT64,
  pw_unit_of_pay STRING,
  pw_wage_level STRING,
  pw_source STRING,
  pw_source_year INT64,
  pw_source_other STRING,
  worksite_county_fips STRING,
  worksite_state_fips STRING,
  worksite_congress_district STRING,
  worksite_latitude FLOAT64,
  worksite_longitude FLOAT64
);
EOF

bq query --use_legacy_sql=false < create_table.sql
echo "   ✅ Table structure created"

# Summary
echo ""
echo "✅ Google Cloud test environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload test data to BigQuery (use a subset of your H1B data)"
echo "2. Create Firebase test project at: https://console.firebase.google.com"
echo "3. Configure Vercel environment variables with:"
echo "   - GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID"
echo "   - BIGQUERY_DATASET_ID=$DATASET_ID"
echo "   - Copy contents of $KEY_FILE to GOOGLE_APPLICATION_CREDENTIALS_JSON"
echo ""
echo "🔗 Useful links:"
echo "   - BigQuery Console: https://console.cloud.google.com/bigquery?project=$PROJECT_ID"
echo "   - IAM Console: https://console.cloud.google.com/iam-admin?project=$PROJECT_ID"
echo ""

# Cleanup
rm -f create_table.sql