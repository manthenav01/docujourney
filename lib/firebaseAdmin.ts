import { readFileSync } from 'fs';
import path from 'path';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccount = serviceAccountPath
    ? JSON.parse(readFileSync(path.resolve(serviceAccountPath), 'utf-8'))
    : {
        // Fallback using environment variables: use correct keys for Firebase Admin SDK
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const adminDb = admin.firestore();
export { adminDb };
