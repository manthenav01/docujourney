const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

async function testBigQuery() {
  const bigquery = new BigQuery({
    projectId: 'doctracker-b4528',
    keyFilename: path.join(__dirname, 'serviceAccountKey.json'),
  });

  try {
    console.log('Testing BigQuery connection...');
    
    // Test 1: Check if lca_applications table has data
    const lcaQuery = `
      SELECT COUNT(*) as count 
      FROM \`doctracker-b4528.h1b_data.lca_applications\` 
      LIMIT 1
    `;
    
    const [lcaResult] = await bigquery.query(lcaQuery);
    console.log('LCA Applications count:', lcaResult[0]?.count || 0);
    
    // Test 2: Check if employers table has data
    const empQuery = `
      SELECT COUNT(*) as count 
      FROM \`doctracker-b4528.h1b_data.employers\` 
      LIMIT 1
    `;
    
    const [empResult] = await bigquery.query(empQuery);
    console.log('Employers count:', empResult[0]?.count || 0);
    
    // Test 3: Sample a few records from lca_applications
    const sampleQuery = `
      SELECT 
        case_number,
        employer_name,
        case_status,
        wage_rate_of_pay_from,
        worksite_state
      FROM \`doctracker-b4528.h1b_data.lca_applications\` 
      WHERE case_status = 'Certified'
      LIMIT 5
    `;
    
    const [sampleResult] = await bigquery.query(sampleQuery);
    console.log('Sample LCA records:', sampleResult.length);
    if (sampleResult.length > 0) {
      console.log('First record:', sampleResult[0]);
    }
    
    // Test 4: Check JOIN condition
    const joinQuery = `
      SELECT COUNT(*) as count
      FROM \`doctracker-b4528.h1b_data.lca_applications\` lca
      LEFT JOIN \`doctracker-b4528.h1b_data.employers\` emp
      ON LOWER(TRIM(lca.employer_name)) = LOWER(TRIM(emp.employerpetitionername))
      WHERE lca.case_status = 'Certified'
      AND emp.fiscalyear IS NOT NULL
      LIMIT 1
    `;
    
    const [joinResult] = await bigquery.query(joinQuery);
    console.log('Records with successful JOIN:', joinResult[0]?.count || 0);
    
  } catch (error) {
    console.error('BigQuery test error:', error);
  }
}

testBigQuery();
