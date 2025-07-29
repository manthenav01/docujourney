#!/bin/bash

# Import test data to BigQuery test environment
# This script imports a subset of H1B data for testing

set -e

echo "📊 Importing test data to BigQuery..."

# Variables
PROJECT_ID="immigrant-central-test"
DATASET_ID="h1b_data_test"
TABLE_ID="lca_applications"
SOURCE_PROJECT="doctracker-b4528"  # Your current project
SOURCE_DATASET="h1b_data"
SOURCE_TABLE="lca_applications"

# Set project
gcloud config set project $PROJECT_ID

echo "📋 Configuration:"
echo "   Source: $SOURCE_PROJECT.$SOURCE_DATASET.$SOURCE_TABLE"
echo "   Target: $PROJECT_ID.$DATASET_ID.$TABLE_ID"
echo ""

# Option 1: Copy recent data (last 2 years) for testing
echo "🔄 Copying recent H1B data for testing..."
echo "   This will copy data from fiscal years 2024-2025"

QUERY="
SELECT *
FROM \`${SOURCE_PROJECT}.${SOURCE_DATASET}.${SOURCE_TABLE}\`
WHERE EXTRACT(YEAR FROM received_date) >= 2023
  OR (EXTRACT(YEAR FROM received_date) = 2022 AND EXTRACT(MONTH FROM received_date) >= 10)
LIMIT 100000
"

# Create destination table with query results
bq query \
  --use_legacy_sql=false \
  --destination_table="${PROJECT_ID}:${DATASET_ID}.${TABLE_ID}" \
  --replace \
  --allow_large_results \
  "$QUERY"

echo "   ✅ Test data imported"

# Get row count
ROW_COUNT=$(bq query --use_legacy_sql=false --format=csv "SELECT COUNT(*) as count FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`" | tail -n 1)
echo ""
echo "📊 Import complete!"
echo "   Total rows imported: $ROW_COUNT"
echo ""

# Create some useful views for testing
echo "🔨 Creating test views..."

# Top employers view
bq query --use_legacy_sql=false "
CREATE OR REPLACE VIEW \`${PROJECT_ID}.${DATASET_ID}.top_employers_test\` AS
SELECT 
  employer_name,
  COUNT(*) as applications,
  AVG(wage_rate_of_pay_from) as avg_salary,
  COUNT(CASE WHEN case_status = 'Certified' THEN 1 END) as certified_count
FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
WHERE employer_name IS NOT NULL
GROUP BY employer_name
ORDER BY applications DESC
LIMIT 100
"

echo "   ✅ Views created"
echo ""
echo "✅ Test data setup complete!"
echo ""
echo "You can now test your application with the test dataset."
echo "BigQuery Console: https://console.cloud.google.com/bigquery?project=$PROJECT_ID"