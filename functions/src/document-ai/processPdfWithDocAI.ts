import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { setGlobalOptions } from 'firebase-functions/v2';
import admin from '../firebase-admin';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { Timestamp } from 'firebase-admin/firestore';

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

const db = admin.firestore();
const location = 'us'; // Change to your processor's region
const processorId = '7acdd81f19827371'; // Replace with your processor ID
const projectId = '213026976072';

const client = new DocumentProcessorServiceClient();

export const processPdfWithDocAI = onObjectFinalized(
  {
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async (event) => {
    const object = event.data;
    const bucketName = object.bucket;
    const filePath = object.name;

    if (!filePath || !filePath.endsWith('.pdf')) {
        console.log('Not a PDF. Skipping.');
        return;
    }

    const userData = extractUserData(filePath);
    if (!userData) {
        console.error(`Invalid file path format: ${filePath}`);
        return;
    }
    const [userId, profileId, firestoreDocId] = userData;

    const gcsUri = `gs://${bucketName}/${filePath}`;
    console.log(`Processing file with Document AI: ${gcsUri}`);

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // const storage = new Storage();
    // const file = storage.bucket(bucketName).file(filePath);
    // const [metadata] = await file.getMetadata();
    // logger.info("File metadata:", JSON.stringify(metadata));
    // const firestoreDocId: string = (metadata.metadata?.firestoreDocId as string) || '';
    if (!firestoreDocId) {
        console.error('No firestoreDocId found in file metadata.');
        return;
    }

    const request = {
        name,
        inputDocuments: {
            gcsDocuments: {
                documents: [
                    {
                        gcsUri,
                        mimeType: 'application/pdf',
                    },
                ],
            },
        },
    };
    console.log('Batch process request:', JSON.stringify(request));
    try {
        const pdfBuffer = await getPdfBytes(bucketName, filePath);
        console.log(`PDF buffer size: ${pdfBuffer.length}`);

        const [docResult] = await client.processDocument({
            name,
            rawDocument: {
                content: pdfBuffer,
                mimeType: 'application/pdf',
            },
        });
        console.log('Document AI processing complete.', docResult.document?.entities);
        const extracted = parseFields(docResult.document?.entities || []);
        const docRef = db.collection(`users/${userId}/profiles/${profileId}/documents`).doc(firestoreDocId);

        await docRef.update({
            extracted: {
                ...extracted,
            },
            status: 'completed',
        });
        console.log('Extracted data saved to Firestore.');
    } catch (error) {
        console.error('Document AI error:', error);
    }
  },
);

// Helper: Get PDF file bytes from Cloud Storage
async function getPdfBytes(bucketName: string, filePath: string): Promise<Buffer> {
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage();
    const [contents] = await storage.bucket(bucketName).file(filePath).download();
    return contents;
}

function massageValue(entity: any): string | number | Timestamp {
    if (entity?.normalizedValue && entity?.normalizedValue?.dateValue) {
        const { year, month, day } = entity.normalizedValue.dateValue;
        const dateObj = new Date(year, month - 1, day);
        return admin.firestore.Timestamp.fromDate(dateObj);
    }
    return entity?.mentionText || '';
}

// Helper: Format key-value pairs from entities
function parseFields(entities: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const entity of entities) {
        const key = entity.type;
        let value = massageValue(entity);
        value = correctExtractedValue(key, value);
        // Use helper for normalized date
        if (!result[key]) {
            result[key] = value;
            continue;
        }
    }
    return result;
}

function extractUserData(filePath: string): string[] | null {
    const parts = filePath.split('/');
    if (parts.length < 4 || parts[0] !== 'uploads') {
        console.error(`Unexpected path format: ${filePath}`);
        return null;
    }
    const userId = parts[1];
    const profileId = parts[2];
    const fireStoreDocId = parts[3];
    console.log(`userId=${userId}, profile=${profileId}, fireStoreDocId=${fireStoreDocId}`);
    return [userId, profileId, fireStoreDocId];
}

function correctExtractedValue(key: string, value: string | number | Timestamp): string | number | Timestamp {
    // Fix common OCR mistakes for I-797
    if (typeof value === 'string') {
        if ((key.toLowerCase().includes('i-797') || key.toLowerCase().includes('1-797') || value.match(/^[I1]-797/i))) {
            value = value.replace(/^1-797/i, 'I-797').replace(/1-797/g, 'I-797');
        }
        // Fix I-797ANOTICE to I-797A
        if (value.toUpperCase().includes('I-797ANOTICE')) {
            value = value.replace(/I-797ANOTICE/gi, 'I-797A');
        }
        // Fix hIb to h1b (case-insensitive, only if it looks like a visa type)
        if (/h[Il]b/i.test(value)) {
            value = value.replace(/hIb/gi, 'h1b').replace(/hlb/gi, 'h1b');
        }
        // Fix 1-94 to I-94 (case-insensitive, at start or anywhere)
        value = value.replace(/\b1-94\b/gi, 'I-94');
    }
    return value;
}