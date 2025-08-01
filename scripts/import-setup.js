const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Test script to verify Firebase connection and create sample data
async function testFirebaseConnection() {
  try {
    // Initialize Firebase Admin SDK using environment credentials
    let credential;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account key file
      credential = admin.credential.applicationDefault();
    } else if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      // Use environment variables
      credential = admin.credential.cert({
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Fallback to legacy path method (deprecated)
      console.warn('⚠️  Using deprecated FIREBASE_SERVICE_ACCOUNT_PATH. Please migrate to GOOGLE_APPLICATION_CREDENTIALS.');
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      
      if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ Service account key file not found at:', serviceAccountPath);
        return;
      }
      
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      credential = admin.credential.cert(serviceAccount);
    } else {
      console.error('❌ No valid Firebase Admin credentials found.');
      console.error('Please set either:');
      console.error('  - GOOGLE_APPLICATION_CREDENTIALS environment variable, or');
      console.error('  - GOOGLE_CLOUD_PRIVATE_KEY, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PROJECT_ID environment variables');
      return;
    }

    admin.initializeApp({
      credential: credential,
    });

    const db = admin.firestore();
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Test writing a sample document
    const testDoc = {
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Test connection successful',
    };
    
    await db.collection('test').doc('connection-test').set(testDoc);
    console.log('✅ Successfully wrote test document to Firestore');
    
    // Read it back
    const doc = await db.collection('test').doc('connection-test').get();
    if (doc.exists) {
      console.log('✅ Successfully read test document from Firestore');
      console.log('Document data:', doc.data());
    }
    
    // Clean up test document
    await db.collection('test').doc('connection-test').delete();
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 Firebase connection test completed successfully!');
    console.log('You can now run the batch import script.');
    
  } catch (error) {
    console.error('❌ Error testing Firebase connection:', error.message);
    if (error.code === 'auth/invalid-credential') {
      console.log('Please check your service account key file');
    }
  } finally {
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
  }
}

// Create sample CSV files for testing
function createSampleCSVFiles() {
  const dataDir = path.join(__dirname, 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }
  
  // Sample employers CSV
  const employersCSV = `Tax ID,Employer (Petitioner) Name,Petitioner City,Petitioner State,Petitioner Zip Code,Industry (NAICS) Code,Initial Approval,Initial Denial,Continuing Approval,Continuing Denial
123456789,Tech Corp Inc,San Francisco,CA,94105,541511,100,5,150,10
987654321,Data Systems LLC,New York,NY,10001,541512,75,3,200,8`;

  fs.writeFileSync(path.join(dataDir, 'cleaned_employers.csv'), employersCSV);
  console.log('✅ Created sample cleaned_employers.csv');
  
  // Sample jobs CSV
  const jobsCSV = `CASE_NUMBER,EMPLOYER_FEIN,EMPLOYER_NAME,VISA_CLASS,JOB_TITLE,SOC_CODE,SOC_TITLE,FULL_TIME_POSITION,CASE_STATUS,RECEIVED_DATE,DECISION_DATE,BEGIN_DATE,END_DATE,TOTAL_WORKER_POSITIONS,WAGE_RATE_OF_PAY_FROM,WAGE_RATE_OF_PAY_TO,WAGE_UNIT_OF_PAY,PREVAILING_WAGE,PW_UNIT_OF_PAY,PW_OES_YEAR,H_1B_DEPENDENT,WILLFUL_VIOLATOR
I-200-12345,123456789,Tech Corp Inc,H-1B,Software Engineer,15-1132,Software Developers,Y,Certified,2024-01-15,2024-03-15,2024-10-01,2027-09-30,1,120000,130000,Year,115000,Year,2023,N,N
I-200-54321,987654321,Data Systems LLC,H-1B,Data Scientist,15-2051,Data Scientists,Y,Certified,2024-02-01,2024-04-01,2024-10-01,2027-09-30,2,110000,125000,Year,108000,Year,2023,N,N`;

  fs.writeFileSync(path.join(dataDir, 'cleaned_lca.csv'), jobsCSV);
  console.log('✅ Created sample cleaned_lca.csv');
  
  // Sample worksites CSV
  const worksitesCSV = `CASE_NUMBER,WORKSITE_WORKERS,SECONDARY_ENTITY,SECONDARY_ENTITY_BUSINESS_NAME,WORKSITE_ADDRESS1,WORKSITE_CITY,WORKSITE_STATE,WORKSITE_POSTAL_CODE,WAGE_RATE_OF_PAY_FROM,WAGE_RATE_OF_PAY_TO,WAGE_UNIT_OF_PAY,PREVAILING_WAGE,PW_UNIT_OF_PAY,PW_OES_YEAR
I-200-12345,1,N,,123 Tech Street,San Francisco,CA,94105,120000,130000,Year,115000,Year,2023
I-200-54321,2,N,,456 Data Avenue,New York,NY,10001,110000,125000,Year,108000,Year,2023`;

  fs.writeFileSync(path.join(dataDir, 'cleaned_worksites.csv'), worksitesCSV);
  console.log('✅ Created sample cleaned_worksites.csv');
  
  console.log('🎉 Sample CSV files created in scripts/data/');
  console.log('You can now test the import script with: npm run import:data');
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'test':
    testFirebaseConnection();
    break;
  case 'sample':
    createSampleCSVFiles();
    break;
  case 'setup':
    createSampleCSVFiles();
    setTimeout(() => {
      testFirebaseConnection();
    }, 1000);
    break;
  default:
    console.log('Import Setup Helper');
    console.log('');
    console.log('Available commands:');
    console.log('  node scripts/import-setup.js test    - Test Firebase connection');
    console.log('  node scripts/import-setup.js sample  - Create sample CSV files');
    console.log('  node scripts/import-setup.js setup   - Create samples and test connection');
    break;
}
