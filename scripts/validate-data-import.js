// Validation script to check if 2024 Q3 data was imported successfully
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

const PROJECT_ID = 'doctracker-b4528';
const DATASET_ID = 'h1b_data';
const TABLE_ID = 'lca_applications';

async function validateDataImport() {
  console.log('🔍 Validating 2024 Q3 H1B data import...\n');

  // Initialize BigQuery client using environment credentials
  const bigQueryOptions = { projectId: PROJECT_ID };
  
  // Use GOOGLE_APPLICATION_CREDENTIALS if set, otherwise fall back to environment variables
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    bigQueryOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  } else if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    bigQueryOptions.credentials = {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else {
    console.error('❌ No valid Google Cloud credentials found.');
    console.error('Please set either:');
    console.error('  - GOOGLE_APPLICATION_CREDENTIALS environment variable, or');
    console.error('  - GOOGLE_CLOUD_PRIVATE_KEY and GOOGLE_CLOUD_CLIENT_EMAIL environment variables');
    process.exit(1);
  }

  const bigquery = new BigQuery(bigQueryOptions);

  try {
    // 1. Check monthly distribution for fiscal year 2024 (Oct 2023 - Sep 2024)
    const monthlyQuery = `
      SELECT 
        EXTRACT(YEAR FROM received_date) as calendar_year,
        EXTRACT(MONTH FROM received_date) as month,
        FORMAT_DATE('%Y-%m', received_date) as year_month,
        COUNT(*) as application_count
      FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE received_date >= '2023-10-01' 
        AND received_date <= '2024-09-30'
      GROUP BY calendar_year, month, year_month
      ORDER BY year_month
    `;

    console.log('📊 Monthly distribution for FY 2024 (Oct 2023 - Sep 2024):');
    const [monthlyRows] = await bigquery.query(monthlyQuery);
    
    monthlyRows.forEach(row => {
      console.log(`  ${row.year_month}: ${row.application_count.toLocaleString()} applications`);
    });

    // 2. Check for specific missing months that were identified earlier
    const missingMonthsCheck = `
      SELECT 
        FORMAT_DATE('%Y-%m', received_date) as year_month,
        COUNT(*) as count
      FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE received_date >= '2023-10-01' 
        AND received_date <= '2024-08-31'
        AND FORMAT_DATE('%Y-%m', received_date) IN (
          '2023-10', '2023-11', '2023-12',
          '2024-01', '2024-02', '2024-03', 
          '2024-04', '2024-05', '2024-06',
          '2024-07', '2024-08'
        )
      GROUP BY year_month
      ORDER BY year_month
    `;

    console.log('\n🎯 Checking previously missing months (Oct 2023 - Aug 2024):');
    const [missingRows] = await bigquery.query(missingMonthsCheck);
    
    if (missingRows.length === 0) {
      console.log('  ❌ No data found for the previously missing months');
    } else {
      missingRows.forEach(row => {
        console.log(`  ✅ ${row.year_month}: ${row.count.toLocaleString()} applications`);
      });
    }

    // 3. Check Amazon's data specifically for YoY comparison
    const amazonQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(MONTH FROM received_date) >= 10 
          THEN EXTRACT(YEAR FROM received_date) + 1
          ELSE EXTRACT(YEAR FROM received_date)
        END as fiscal_year,
        COUNT(*) as applications
      FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE UPPER(employer_name) LIKE '%AMAZON%'
        AND received_date >= '2023-10-01'
        AND received_date <= '2025-09-30'
      GROUP BY fiscal_year
      ORDER BY fiscal_year
    `;

    console.log('\n🏢 Amazon H1B applications by fiscal year:');
    const [amazonRows] = await bigquery.query(amazonQuery);
    
    amazonRows.forEach(row => {
      console.log(`  FY ${row.fiscal_year}: ${row.applications.toLocaleString()} applications`);
    });

    // Calculate YoY growth for Amazon
    if (amazonRows.length >= 2) {
      const fy2024 = amazonRows.find(row => row.fiscal_year.value === '2024');
      const fy2025 = amazonRows.find(row => row.fiscal_year.value === '2025');
      
      if (fy2024 && fy2025) {
        const growth = ((fy2025.applications - fy2024.applications) / fy2024.applications * 100);
        console.log(`  📈 YoY Growth (FY2024→FY2025): ${growth.toFixed(1)}%`);
      }
    }

    // 4. Overall data summary
    const summaryQuery = `
      SELECT 
        MIN(received_date) as earliest_date,
        MAX(received_date) as latest_date,
        COUNT(*) as total_records
      FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    `;

    console.log('\n📋 Overall data summary:');
    const [summaryRows] = await bigquery.query(summaryQuery);
    
    summaryRows.forEach(row => {
      console.log(`  📅 Date range: ${row.earliest_date.value} to ${row.latest_date.value}`);
      console.log(`  📊 Total records: ${row.total_records.toLocaleString()}`);
    });

    console.log('\n✅ Data validation completed successfully!');

  } catch (error) {
    console.error('❌ Error validating data:', error);
    process.exit(1);
  }
}

// Run validation
validateDataImport().catch(console.error);