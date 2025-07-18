// Debug script to check document structure for a specific user
// Run this with: node debug-documents.js

const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
  });
}

const db = getFirestore();

async function debugUserDocuments(userId) {
  console.log(`\n=== DEBUG: User ${userId} Documents ===`);
  
  try {
    // Get user profiles
    const profilesSnap = await db.collection(`users/${userId}/profiles`).get();
    console.log(`Found ${profilesSnap.docs.length} profiles for user ${userId}`);
    
    for (const profileDoc of profilesSnap.docs) {
      const profileId = profileDoc.id;
      const profileData = profileDoc.data();
      
      console.log(`\n--- Profile: ${profileId} (${profileData?.name || 'Unnamed'}) ---`);
      
      // Get all documents for this profile
      const docsSnap = await db.collection(`users/${userId}/profiles/${profileId}/documents`).get();
      console.log(`Total documents: ${docsSnap.docs.length}`);
      
      for (const doc of docsSnap.docs) {
        const docData = doc.data();
        console.log(`\nDocument ID: ${doc.id}`);
        console.log(`  Status: ${docData?.status}`);
        console.log(`  Has extracted: ${!!docData?.extracted}`);
        console.log(`  Document type: ${docData?.extracted?.document_type || 'N/A'}`);
        console.log(`  Valid from: ${docData?.extracted?.valid_from || 'N/A'}`);
        console.log(`  Valid to: ${docData?.extracted?.valid_to || 'N/A'}`);
        console.log(`  Notice date: ${docData?.extracted?.notice_date || 'N/A'}`);
        console.log(`  Class of admission: ${docData?.extracted?.class_of_admission || 'N/A'}`);
        
        // Check if dates are expired
        if (docData?.extracted?.valid_to) {
          const validTo = new Date(docData.extracted.valid_to);
          const now = new Date();
          const isExpired = validTo < now;
          console.log(`  Is expired: ${isExpired} (Valid to: ${validTo.toISOString()})`);
        }
      }
    }
  } catch (error) {
    console.error('Error debugging documents:', error);
  }
}

// Replace with the actual user ID you want to debug
const USER_ID = 'YOUR_USER_ID_HERE';

if (USER_ID === 'YOUR_USER_ID_HERE') {
  console.log('Please replace USER_ID with the actual user ID you want to debug');
} else {
  debugUserDocuments(USER_ID);
}
