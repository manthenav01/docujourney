const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

async function checkFiscalYears() {
  const bigquery = new BigQuery({
    projectId: 'doctracker-b4528',
    keyFilename: path.join(__dirname, 'serviceAccountKey.json'),
  });

  try {
    console.log('Checking available fiscal years...');
    
    const query = `
      SELECT DISTINCT emp.fiscalyear
      FROM \`doctracker-b4528.h1b_data.lca_applications\` lca
      LEFT JOIN \`doctracker-b4528.h1b_data.employers\` emp
      ON LOWER(TRIM(lca.employer_name)) = LOWER(TRIM(emp.employerpetitionername))
      WHERE lca.case_status = 'Certified'
      AND emp.fiscalyear IS NOT NULL
      ORDER BY emp.fiscalyear DESC
    `;
    
    const [result] = await bigquery.query(query);
    console.log('Available fiscal years:', result.map(row => row.fiscalyear));
    
    // Check current fiscal year calculation
    const now = new Date();
    const currentYear = now.getFullYear();
    const fiscalYear = now.getMonth() >= 9 ? currentYear + 1 : currentYear;
    console.log('Current calculated fiscal year:', fiscalYear);
    
    // Test query with 2025
    const testQuery2025 = `
      SELECT COUNT(*) as count
      FROM \`doctracker-b4528.h1b_data.lca_applications\` lca
      LEFT JOIN \`doctracker-b4528.h1b_data.employers\` emp
      ON LOWER(TRIM(lca.employer_name)) = LOWER(TRIM(emp.employerpetitionername))
      WHERE lca.case_status = 'Certified'
      AND emp.fiscalyear = 2025
    `;
    
    const [result2025] = await bigquery.query(testQuery2025);
    console.log('Records for fiscal year 2025:', result2025[0]?.count || 0);
    
    // Test query with most recent year
    if (result.length > 0) {
      const latestYear = result[0].fiscalyear;
      const testQueryLatest = `
        SELECT COUNT(*) as count
        FROM \`doctracker-b4528.h1b_data.lca_applications\` lca
        LEFT JOIN \`doctracker-b4528.h1b_data.employers\` emp
        ON LOWER(TRIM(lca.employer_name)) = LOWER(TRIM(emp.employerpetitionername))
        WHERE lca.case_status = 'Certified'
        AND emp.fiscalyear = ${latestYear}
      `;
      
      const [resultLatest] = await bigquery.query(testQueryLatest);
      console.log(`Records for fiscal year ${latestYear}:`, resultLatest[0]?.count || 0);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFiscalYears();
