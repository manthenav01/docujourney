import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "../firebase-admin";

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: "us-central1",
});

/**
 * Cloud Function to validate and generate secure file access URLs.
 */
export const getSecureFile = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Ensure request is POST method
    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method not allowed. Use POST.' });
      return;
    }

    console.log('Request body:', req.body);

    // Check if body exists and has filePath
    if (!req.body || !req.body.filePath) {
      console.error('Missing filePath in request:', req.body);
      res.status(400).send({ error: 'Missing filePath in request' });
      return;
    }

    const { filePath } = req.body;

    try {
      // Get Firebase auth token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send({ error: 'Unauthorized. Missing or invalid auth token.' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // Validate the file path structure
      const pathParts = filePath.split("/");
      if (pathParts.length < 2 || pathParts[0] !== "uploads" || pathParts[1] !== userId) {
        res.status(403).send({ error: 'Unauthorized access attempt.' });
        return;
      }

      // Generate a signed URL for the file
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      if (!exists) {
        res.status(404).send({ error: 'The requested file does not exist' });
        return;
      }
      
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 5 * 60 * 1000, // URL valid for 5 minutes
      });
      
      console.log("Generated signed URL:", url);
      res.status(200).send({ url });
      return;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      res.status(500).send({ error: 'Unable to generate signed URL.' });
      return;
    }
  }
);