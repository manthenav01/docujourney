const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkJobsData() {
  try {
    console.log('Checking jobs collection...');
    const snapshot = await db.collection('jobs').limit(5).get();
    console.log('Total jobs documents found:', snapshot.size);
    
    if (snapshot.size > 0) {
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Document ${index + 1} ---`);
        console.log('ID:', doc.id);
        console.log('Data keys:', Object.keys(data));
        
        // Show some key fields
        if (data.employer_name || data.EMPLOYER_NAME) {
          console.log('Employer:', data.employer_name || data.EMPLOYER_NAME);
        }
        if (data.visa_class || data.VISA_CLASS) {
          console.log('Visa class:', data.visa_class || data.VISA_CLASS);
        }
        if (data.case_status || data.CASE_STATUS) {
          console.log('Status:', data.case_status || data.CASE_STATUS);
        }
        
        // Show first few keys and their values
        const keys = Object.keys(data).slice(0, 10);
        console.log('Sample fields:');
        keys.forEach(key => {
          console.log(`  ${key}:`, data[key]);
        });
      });
    } else {
      console.log('No documents found in jobs collection');
      
      // Check if there are any other collections
      console.log('\nChecking other collections...');
      const collections = await db.listCollections();
      console.log('Available collections:', collections.map(c => c.id));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkJobsData();
