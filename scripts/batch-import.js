const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parse');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Batch size for Firestore (max 500 operations per batch)
const BATCH_SIZE = 500;

async function importEmployers() {
  console.log('Starting employer import...');
  
  const dataPath = path.join(__dirname, 'data', 'h1b', '2025', 'cleanup', 'cleaned_employers.csv');
  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    return;
  }

  return new Promise((resolve, reject) => {
    const employers = [];
    
    fs.createReadStream(dataPath)
      .pipe(csv.parse({ columns: true }))
      .on('data', (row) => {
        // Generate a valid document ID - use taxid if available, otherwise generate one
        let docId = row['taxid'] && row['taxid'].trim() !== '' ? row['taxid'].trim() : null;
        
        // If taxid is empty, generate an ID based on employer name and location
        if (!docId) {
          const employerName = (row['employer(petitioner)name'] || '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
          const city = (row['petitionercity'] || '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
          const state = (row['petitionerstate'] || '').replace(/[^a-zA-Z0-9]/g, '');
          const randomSuffix = Math.random().toString(36).substr(2, 8);
          docId = `${employerName}_${city}_${state}_${randomSuffix}`.toLowerCase();
        }
        
        // Clean the document ID to ensure it's valid for Firestore
        docId = docId.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
        
        employers.push({
          id: docId,
          data: {
            fiscal_year: row['fiscalyear'],
            name: row['employer(petitioner)name'],
            city: row['petitionercity'],
            state: row['petitionerstate'],
            postal_code: row['petitionerzipcode'],
            naics_code: row['industry(naics)code'],
            tax_id: row['taxid'], // Store original tax ID as data field
            initial_approvals: parseInt(row['initialapproval']) || 0,
            initial_denials: parseInt(row['initialdenial']) || 0,
            continuing_approvals: parseInt(row['continuingapproval']) || 0,
            continuing_denials: parseInt(row['continuingdenial']) || 0,
            imported_at: admin.firestore.FieldValue.serverTimestamp(),
          },
        });
      })
      .on('end', async () => {
        try {
          await batchWrite('employers', employers);
          console.log(`Imported ${employers.length} employers`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function importJobs() {
  console.log('Starting jobs import...');
  
  const dataPath = path.join(__dirname, 'data', 'h1b', '2025', 'cleanup', 'cleaned_lca.csv');
  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    return;
  }

  return new Promise((resolve, reject) => {
    const jobs = [];
    
    fs.createReadStream(dataPath)
      .pipe(csv.parse({ columns: true }))
      .on('data', (row) => {
        jobs.push({
          id: row['case_number'],
          data: {
            case_status: row['case_status'],
            received_date: row['received_date'] ? admin.firestore.Timestamp.fromDate(new Date(row['received_date'])) : null,
            decision_date: row['decision_date'] ? admin.firestore.Timestamp.fromDate(new Date(row['decision_date'])) : null,
            visa_class: row['visa_class'],
            job_title: row['job_title'],
            soc_code: row['soc_code'],
            soc_title: row['soc_title'],
            full_time_position: row['full_time_position'],
            begin_date: row['begin_date'] ? admin.firestore.Timestamp.fromDate(new Date(row['begin_date'])) : null,
            end_date: row['end_date'] ? admin.firestore.Timestamp.fromDate(new Date(row['end_date'])) : null,
            total_worker_positions: parseInt(row['total_worker_positions']) || 1,
            employer_name: row['employer_name'],
            employer_city: row['employer_city'],
            employer_state: row['employer_state'],
            employer_postal_code: row['employer_postal_code'],
            employer_fein: row['employer_fein'],
            naics_code: row['naics_code'],
            wage_rate_from: parseFloat(row['wage_rate_of_pay_from']) || 0,
            wage_rate_to: parseFloat(row['wage_rate_of_pay_to']) || 0,
            wage_unit: row['wage_unit_of_pay'],
            prevailing_wage: parseFloat(row['prevailing_wage']) || 0,
            pw_unit: row['pw_unit_of_pay'],
            pw_oes_year: parseInt(row['pw_oes_year']) || null,
            h1b_dependent: row['h_1b_dependent'],
            willful_violator: row['willful_violator'],
            imported_at: admin.firestore.FieldValue.serverTimestamp(),
          },
        });
      })
      .on('end', async () => {
        try {
          await batchWrite('jobs', jobs);
          console.log(`Imported ${jobs.length} jobs`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function importWorksites() {
  console.log('Starting worksites import...');
  
  const dataPath = path.join(__dirname, 'data', 'h1b', '2025', 'cleanup', 'cleaned_worksites.csv');
  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    return;
  }

  return new Promise((resolve, reject) => {
    const worksites = [];
    
    fs.createReadStream(dataPath)
      .pipe(csv.parse({ columns: true }))
      .on('data', (row) => {
        const worksiteId = `${row['worksite_city']}_${row['worksite_postal_code']}_${Math.random().toString(36).substr(2, 9)}`;
        
        worksites.push({
          id: worksiteId,
          data: {
            case_number: row['case_number'],
            workers: parseInt(row['worksite_workers']) || 1,
            secondary_entity: row['secondary_entity'],
            secondary_entity_name: row['secondary_entity_business_name'],
            address1: row['worksite_address1'],
            city: row['worksite_city'],
            state: row['worksite_state'],
            postal_code: row['worksite_postal_code'],
            wage_rate_from: parseFloat(row['wage_rate_of_pay_from']) || 0,
            wage_rate_to: parseFloat(row['wage_rate_of_pay_to']) || 0,
            wage_unit: row['wage_unit_of_pay'],
            prevailing_wage: parseFloat(row['prevailing_wage']) || 0,
            pw_unit: row['pw_unit_of_pay'],
            pw_oes_year: parseInt(row['pw_oes_year']) || null,
            imported_at: admin.firestore.FieldValue.serverTimestamp(),
          },
        });
      })
      .on('end', async () => {
        try {
          await batchWrite('worksites', worksites);
          console.log(`Imported ${worksites.length} worksites`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function batchWrite(collectionName, documents) {
  const collection = db.collection(collectionName);
  
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = documents.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(doc => {
      const docRef = collection.doc(doc.id);
      batch.set(docRef, doc.data);
    });
    
    await batch.commit();
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} committed for ${collectionName} (${chunk.length} documents)`);
    
    // Add a small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function importData() {
  try {
    console.log('Starting batch import process...');
    console.log('This process will import data from CSV files into Firestore.');
    console.log('Make sure your CSV files are in the scripts/data directory.');
    console.log('');
    
    // Import in sequence to avoid overwhelming Firestore
    await importEmployers();
    console.log('✓ Employers import completed\n');
    
    await importJobs();
    console.log('✓ Jobs import completed\n');
    
    await importWorksites();
    console.log('✓ Worksites import completed\n');
    
    console.log('🎉 All data imported successfully!');
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    // Cleanup
    admin.app().delete();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'employers':
    importEmployers().then(() => {
      console.log('Employers import completed');
      admin.app().delete();
    }).catch(console.error);
    break;
  case 'jobs':
    importJobs().then(() => {
      console.log('Jobs import completed');
      admin.app().delete();
    }).catch(console.error);
    break;
  case 'worksites':
    importWorksites().then(() => {
      console.log('Worksites import completed');
      admin.app().delete();
    }).catch(console.error);
    break;
  case 'all':
  default:
    importData();
    break;
}
