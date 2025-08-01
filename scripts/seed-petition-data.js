/**
 * Sample Petition Data Seeder - Updated for Jobs Collection
 * 
 * This script checks if the jobs collection has data and provides information
 * about testing the petition APIs with the existing jobs data.
 * 
 * Usage: node scripts/seed-petition-data.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin using environment credentials
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
} else {
  console.error('❌ No valid Firebase Admin credentials found.');
  console.error('Please set either:');
  console.error('  - GOOGLE_APPLICATION_CREDENTIALS environment variable, or');
  console.error('  - GOOGLE_CLOUD_PRIVATE_KEY, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PROJECT_ID environment variables');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: credential,
  });
}

const db = admin.firestore();

// Main function to check jobs data
async function checkJobsData() {
  console.log('🔍 Checking jobs collection for petition API testing...');
  
  try {
    // Check if jobs data exists
    const jobsSnapshot = await db.collection('jobs').limit(10).get();
    
    if (jobsSnapshot.empty) {
      console.log('❌ No jobs data found in the database.');
      console.log('');
      console.log('📋 To import jobs data, follow these steps:');
      console.log('1. Make sure you have CSV data files in scripts/data/h1b/2025/cleanup/');
      console.log('2. Run: node scripts/batch-import.js');
      console.log('3. This will import jobs data from the CSV files');
      console.log('');
      console.log('💡 The petition API endpoints read from the "jobs" collection,');
      console.log('   not from a separate "petitions" collection.');
      return;
    }

    // Get sample of jobs data
    const totalSnapshot = await db.collection('jobs').count().get();
    const totalJobs = totalSnapshot.data().count;
    
    console.log(`✅ Found ${totalJobs} jobs in the database`);
    console.log('');
    
    // Analyze sample data
    const sampleJobs = jobsSnapshot.docs.map(doc => doc.data());
    
    // Count by status
    const statusCounts = {};
    const visaTypeCounts = {};
    const stateCounts = {};
    
    sampleJobs.forEach(job => {
      const status = job.case_status || 'Unknown';
      const visaType = job.visa_class || 'Unknown';
      const state = job.employer_state || 'Unknown';
      
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      visaTypeCounts[visaType] = (visaTypeCounts[visaType] || 0) + 1;
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
    
    console.log('📊 Sample Data Analysis (first 10 records):');
    console.log('=====================================');
    
    console.log('\n📋 Case Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\n🛂 Visa Type Distribution:');
    Object.entries(visaTypeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n🗺️  State Distribution:');
    Object.entries(stateCounts).slice(0, 5).forEach(([state, count]) => {
      console.log(`  ${state}: ${count}`);
    });
    
    console.log('\n🧪 Testing the Petition APIs:');
    console.log('============================');
    console.log('The petition API endpoints now read from the "jobs" collection.');
    console.log('You can test the APIs using:');
    console.log('');
    console.log('1. Run the API test script:');
    console.log('   node scripts/petition-api-tests.js');
    console.log('');
    console.log('2. Or test individual endpoints:');
    console.log('   GET /api/petitions/search');
    console.log('   GET /api/petitions/aggregation');
    console.log('   GET /api/petitions/stats');
    console.log('   GET /api/petitions/employers');
    console.log('   GET /api/petitions/locations');
    console.log('   GET /api/petitions/timeseries');
    console.log('');
    console.log('3. Example queries:');
    console.log('   /api/petitions/search?visaType=H-1B&state=CA&limit=10');
    console.log('   /api/petitions/aggregation?groupBy=employer&metric=count');
    console.log('   /api/petitions/stats?visaType=H-1B');
    
    // Sample job data structure
    const sampleJob = sampleJobs[0];
    console.log('\n📝 Sample Job Data Structure:');
    console.log('=============================');
    console.log('Document ID:', jobsSnapshot.docs[0].id);
    console.log('Data fields:');
    Object.keys(sampleJob).forEach(key => {
      console.log(`  ${key}: ${typeof sampleJob[key]} (${sampleJob[key]})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking jobs data:', error);
  }
}

// Data mapping information
function showDataMapping() {
  console.log('\n🔄 Data Mapping Information:');
  console.log('============================');
  console.log('The petition APIs map jobs collection data to PetitionData format:');
  console.log('');
  console.log('Jobs Collection Field → PetitionData Field');
  console.log('------------------------------------------');
  console.log('case_number           → id, petitionNumber');
  console.log('employer_name         → employer');
  console.log('job_title            → jobTitle');
  console.log('employer_city        → location.city');
  console.log('employer_state       → location.state');
  console.log('employer_postal_code → location.zipCode');
  console.log('wage_rate_from       → wageRange.min');
  console.log('wage_rate_to         → wageRange.max');
  console.log('visa_class           → visaType');
  console.log('case_status          → visaStatus (mapped)');
  console.log('received_date        → filingDate');
  console.log('decision_date        → approvalDate');
  console.log('begin_date           → startDate');
  console.log('end_date             → endDate');
  console.log('');
  console.log('Status Mapping:');
  console.log('  "Certified" → "approved"');
  console.log('  "Denied"    → "denied"');
  console.log('  "Withdrawn" → "withdrawn"');
  console.log('  Other       → "pending"');
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'mapping') {
    showDataMapping();
  } else if (command === 'help') {
    console.log('📚 Jobs Collection Data Checker');
    console.log('===============================');
    console.log('');
    console.log('Commands:');
    console.log('  node scripts/seed-petition-data.js         - Check jobs data');
    console.log('  node scripts/seed-petition-data.js mapping - Show data mapping');
    console.log('  node scripts/seed-petition-data.js help    - Show this help');
    console.log('');
    console.log('Note: This script no longer seeds data. It checks existing');
    console.log('jobs data and provides information for testing the petition APIs.');
  } else {
    checkJobsData()
      .then(() => {
        showDataMapping();
        process.exit(0);
      })
      .catch(() => process.exit(1));
  }
}

module.exports = {
  checkJobsData,
  showDataMapping,
};

// Sample data arrays
const companies = [
  'Google LLC', 'Microsoft Corporation', 'Amazon.com Inc.', 'Apple Inc.', 'Meta Platforms Inc.',
  'Tesla Inc.', 'Netflix Inc.', 'Salesforce Inc.', 'Intel Corporation', 'IBM Corporation',
  'Oracle Corporation', 'Adobe Inc.', 'Uber Technologies Inc.', 'Airbnb Inc.', 'Twitter Inc.',
  'LinkedIn Corporation', 'Dropbox Inc.', 'Spotify Technology S.A.', 'Zoom Video Communications',
  'Palantir Technologies Inc.', 'Stripe Inc.', 'Shopify Inc.', 'Square Inc.', 'DocuSign Inc.',
  'Snowflake Inc.', 'Databricks Inc.', 'Coinbase Global Inc.', 'Robinhood Markets Inc.',
];

const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Staff Software Engineer', 'Principal Software Engineer',
  'Software Development Engineer', 'Senior Software Development Engineer', 'Principal Software Development Engineer',
  'Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist', 'Machine Learning Engineer',
  'Senior Machine Learning Engineer', 'Research Scientist', 'Senior Research Scientist',
  'Product Manager', 'Senior Product Manager', 'Principal Product Manager', 'Technical Program Manager',
  'Engineering Manager', 'Senior Engineering Manager', 'Director of Engineering',
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'Site Reliability Engineer',
  'Security Engineer', 'Cloud Architect', 'Solutions Architect', 'Data Engineer', 'Analytics Engineer',
  'Quality Assurance Engineer', 'Technical Lead', 'Architect', 'Consultant', 'Business Analyst',
];

const cities = [
  { city: 'San Francisco', state: 'CA', zipCode: '94105' },
  { city: 'Mountain View', state: 'CA', zipCode: '94041' },
  { city: 'Palo Alto', state: 'CA', zipCode: '94301' },
  { city: 'San Jose', state: 'CA', zipCode: '95113' },
  { city: 'Los Angeles', state: 'CA', zipCode: '90028' },
  { city: 'Seattle', state: 'WA', zipCode: '98101' },
  { city: 'Bellevue', state: 'WA', zipCode: '98004' },
  { city: 'Redmond', state: 'WA', zipCode: '98052' },
  { city: 'New York', state: 'NY', zipCode: '10001' },
  { city: 'Austin', state: 'TX', zipCode: '73301' },
  { city: 'Boston', state: 'MA', zipCode: '02101' },
  { city: 'Chicago', state: 'IL', zipCode: '60601' },
  { city: 'Denver', state: 'CO', zipCode: '80202' },
  { city: 'Atlanta', state: 'GA', zipCode: '30303' },
  { city: 'Raleigh', state: 'NC', zipCode: '27601' },
  { city: 'Portland', state: 'OR', zipCode: '97201' },
  { city: 'Phoenix', state: 'AZ', zipCode: '85001' },
  { city: 'Dallas', state: 'TX', zipCode: '75201' },
  { city: 'Houston', state: 'TX', zipCode: '77002' },
  { city: 'Miami', state: 'FL', zipCode: '33101' },
];

const visaTypes = ['H-1B', 'L-1A', 'L-1B', 'O-1', 'TN', 'E-3', 'H-1B1'];
const visaStatuses = ['approved', 'pending', 'denied', 'withdrawn'];
const priorities = ['regular', 'premium'];

// Utility functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica', 'Robert', 'Ashley', 'William', 'Amanda', 'Richard', 'Stephanie', 'Joseph', 'Jennifer', 'Thomas', 'Elizabeth', 'Christopher', 'Heather'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  return `${randomChoice(firstNames)} ${randomChoice(lastNames)}`;
}

function calculateApprovalDate(filingDate, status, processingTime) {
  if (status !== 'approved') {return null;}
  
  const approval = new Date(filingDate);
  approval.setDate(approval.getDate() + processingTime);
  return approval;
}

function generateWageRange(jobTitle, location) {
  // Base wage ranges by job level (annual salary)
  const baseRanges = {
    'Software Engineer': [80000, 130000],
    'Senior Software Engineer': [120000, 180000],
    'Staff Software Engineer': [160000, 220000],
    'Principal Software Engineer': [200000, 280000],
    'Data Scientist': [90000, 140000],
    'Senior Data Scientist': [130000, 190000],
    'Machine Learning Engineer': [110000, 170000],
    'Product Manager': [100000, 160000],
    'Senior Product Manager': [140000, 200000],
    'Engineering Manager': [150000, 220000],
  };
  
  // Location multipliers
  const locationMultipliers = {
    'CA': 1.3,
    'WA': 1.2,
    'NY': 1.25,
    'MA': 1.15,
    'TX': 1.0,
    'CO': 1.05,
    'default': 0.9,
  };
  
  // Find base range
  let baseRange = [80000, 130000]; // default
  for (const [title, range] of Object.entries(baseRanges)) {
    if (jobTitle.includes(title)) {
      baseRange = range;
      break;
    }
  }
  
  // Apply location multiplier
  const multiplier = locationMultipliers[location.state] || locationMultipliers.default;
  const min = Math.round(baseRange[0] * multiplier);
  const max = Math.round(baseRange[1] * multiplier);
  
  // Add some randomness
  const variance = 0.1;
  const finalMin = Math.round(min * (1 + (Math.random() - 0.5) * variance));
  const finalMax = Math.round(max * (1 + (Math.random() - 0.5) * variance));
  
  return { min: finalMin, max: finalMax, currency: 'USD' };
}

// Generate single petition record
function generatePetition(index) {
  const company = randomChoice(companies);
  const jobTitle = randomChoice(jobTitles);
  const location = randomChoice(cities);
  const visaType = randomChoice(visaTypes);
  const priority = randomChoice(priorities);
  
  // Generate filing date (last 3 years)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const filingDate = randomDate(threeYearsAgo, new Date());
  
  // Generate status with realistic distribution
  let status;
  const statusRand = Math.random();
  if (statusRand < 0.75) {status = 'approved';}
  else if (statusRand < 0.9) {status = 'pending';}
  else if (statusRand < 0.97) {status = 'denied';}
  else {status = 'withdrawn';}
  
  // Processing time varies by priority and status
  const baseProcessingTime = priority === 'premium' ? 
    randomBetween(15, 45) : randomBetween(60, 180);
  
  const approvalDate = calculateApprovalDate(filingDate, status, baseProcessingTime);
  
  // Generate start and end dates for approved cases
  let startDate = null;
  let endDate = null;
  if (status === 'approved' && approvalDate) {
    startDate = new Date(approvalDate);
    startDate.setDate(startDate.getDate() + randomBetween(30, 90));
    
    endDate = new Date(startDate);
    const duration = visaType === 'H-1B' ? 3 : (visaType.startsWith('L-1') ? 1 : 2);
    endDate.setFullYear(endDate.getFullYear() + duration);
  }
  
  const wageRange = generateWageRange(jobTitle, location);
  const now = new Date();
  
  return {
    petitionNumber: `MSC${String(202300000000 + index).slice(-10)}`,
    employer: company,
    jobTitle: jobTitle,
    beneficiaryName: generateRandomName(),
    location: location,
    wageRange: wageRange,
    visaType: visaType,
    visaStatus: status,
    filingDate: filingDate.toISOString(),
    approvalDate: approvalDate ? approvalDate.toISOString() : null,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
    caseStatus: status === 'approved' ? 'Case Approved' : 
               status === 'pending' ? 'Case Received' :
               status === 'denied' ? 'Case Denied' : 'Case Withdrawn',
    priority: priority,
    createdAt: now,
    updatedAt: now,
  };
}

// Batch upload function
async function uploadPetitions(petitions, batchSize = 500) {
  console.log(`📤 Uploading ${petitions.length} petitions in batches of ${batchSize}...`);
  
  for (let i = 0; i < petitions.length; i += batchSize) {
    const batch = db.batch();
    const currentBatch = petitions.slice(i, i + batchSize);
    
    currentBatch.forEach(petition => {
      const docRef = db.collection('petitions').doc();
      batch.set(docRef, petition);
    });
    
    try {
      await batch.commit();
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${currentBatch.length} records)`);
    } catch (error) {
      console.error(`❌ Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error);
      throw error;
    }
  }
}

// Main seeding function
async function seedPetitionData(count = 5000) {
  console.log('🌱 Starting petition data seeding...');
  console.log(`📊 Generating ${count} sample petition records...`);
  
  try {
    // Check if data already exists
    const existing = await db.collection('petitions').limit(1).get();
    if (!existing.empty) {
      console.log('⚠️  Warning: Petition data already exists.');
      console.log('🗑️  To clear existing data first, run: node scripts/clear-petition-data.js');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Continue anyway? (y/N): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled.');
        return;
      }
    }
    
    // Generate petition data
    const petitions = [];
    for (let i = 0; i < count; i++) {
      petitions.push(generatePetition(i));
      
      if ((i + 1) % 1000 === 0) {
        console.log(`📝 Generated ${i + 1}/${count} records...`);
      }
    }
    
    console.log(`✅ Generated ${petitions.length} petition records`);
    
    // Upload to Firestore
    await uploadPetitions(petitions);
    
    // Generate summary
    const summary = {
      totalRecords: petitions.length,
      byStatus: petitions.reduce((acc, p) => {
        acc[p.visaStatus] = (acc[p.visaStatus] || 0) + 1;
        return acc;
      }, {}),
      byVisaType: petitions.reduce((acc, p) => {
        acc[p.visaType] = (acc[p.visaType] || 0) + 1;
        return acc;
      }, {}),
      byCompany: Object.fromEntries(
        Object.entries(petitions.reduce((acc, p) => {
          acc[p.employer] = (acc[p.employer] || 0) + 1;
          return acc;
        }, {})).slice(0, 10),
      ),
    };
    
    console.log('\n📈 Seeding Summary:');
    console.log('='.repeat(40));
    console.log('Total Records:', summary.totalRecords);
    console.log('\nBy Status:');
    Object.entries(summary.byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log('\nBy Visa Type:');
    Object.entries(summary.byVisaType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('\nTop Companies:');
    Object.entries(summary.byCompany).forEach(([company, count]) => {
      console.log(`  ${company}: ${count}`);
    });
    
    console.log('\n✅ Petition data seeding completed successfully!');
    console.log('🧪 You can now test the API endpoints with sample data.');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Clear data function
async function clearPetitionData() {
  console.log('🗑️  Clearing existing petition data...');
  
  try {
    const petitions = await db.collection('petitions').get();
    
    if (petitions.empty) {
      console.log('ℹ️  No petition data to clear.');
      return;
    }
    
    console.log(`📊 Found ${petitions.docs.length} records to delete...`);
    
    const batchSize = 500;
    for (let i = 0; i < petitions.docs.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = petitions.docs.slice(i, i + batchSize);
      
      currentBatch.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`🗑️  Deleted batch ${Math.floor(i / batchSize) + 1}`);
    }
    
    console.log('✅ All petition data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];
  const count = parseInt(process.argv[3]) || 5000;
  
  if (command === 'clear') {
    clearPetitionData()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    seedPetitionData(count)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  seedPetitionData,
  clearPetitionData,
  generatePetition,
};
