import { DocumentMetaDataAPIModel, DocumentMetaDataTransformedModel, DocumentExtractedResponseAPIData } from './types/document.model';


import { adminDb } from './firebaseAdmin';
import { transformDocumentMetaData } from '../utils/documentUtils';


export interface DocumentTypeFieldsSchemaModel {
    receipt_number: string;
    valid_from: string;
    valid_to: string;
    first_name?: string;
    last_name?: string;
    petitioner: string;
    key: string;
    type: string;
    label: string;
    confidence: number;
    required: boolean;
    description: string;
    editable: boolean;
    displayInOverview: boolean;
}


export interface DocumentTypeSchemaModel {
    documentType: string;
    displayName: string;
    sortByKeyOrder: DocumentTypeSchemaKeys[];
    showCardStatusTag: boolean;
    fields: DocumentTypeFieldsSchemaModel[];
}

export type DocumentTypeSchemaKeys = (keyof DocumentTypeFieldsSchemaModel);

// Function to fetch document schemas from Firestore
export async function fetchDocumentSchemas(): Promise<Record<string, DocumentTypeSchemaModel>> {
    try {
        const schemaSnapshot = await adminDb.collection('document_type_fields_schema').get();
        const schemas: Record<string, DocumentTypeSchemaModel> = {};

        schemaSnapshot.forEach((doc) => {
            const data = doc.data() as DocumentTypeSchemaModel;
            schemas[data.documentType] = {
                ...data,
            };
        });

        return schemas;
    } catch (error) {
        console.error("Failed to fetch document schemas:", error);
        return {};
    }
}

// Function to fetch documents and group by type
export async function fetchAndGroupDocuments(userId: string, profileId: string): Promise<{
    documentGroups: { documentType: string; docs: DocumentMetaDataTransformedModel[] }[];
}> {
    try {
        // Fetch documents
        const documentsRef = adminDb.collection(`users/${userId}/profiles/${profileId}/documents`);
        const querySnapshot = await documentsRef.get();
        const documents: DocumentMetaDataTransformedModel[] = [];
        if (querySnapshot.empty) {
            return { documentGroups: [] };
        }

        querySnapshot.forEach((doc) => {
            documents.push(transformDocumentMetaData({
                id: doc.id,
                ...(doc.data() as Omit<DocumentMetaDataAPIModel, 'id'>),
            }));
        });

        // Group documents by type
        const groups = documents.reduce((acc, doc) => {
            const documentType = doc.extracted?.document_type || 'Others';
            const list = acc[documentType] || [];
            return { ...acc, [documentType]: [...list, doc] };
        }, {} as Record<string, DocumentMetaDataTransformedModel[]>);

        const documentGroups = Object.entries(groups).map(([documentType, docs]) => ({
            documentType,
            docs,
        }));

        return { documentGroups };
    } catch (error) {
        console.error("Failed to fetch and group documents:", error);
        return { documentGroups: [] };
    }
}


// Update fetchDocumentsByType to use the transformed model
export async function fetchDocumentsByType(
    userId: string,
    profileId: string,
    documentType: string
): Promise<DocumentMetaDataTransformedModel[]> {
    const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles')
        .doc(profileId)
        .collection('documents')
        .get();

    const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DocumentMetaDataAPIModel, 'id'>),
    }));

    return docs
        .filter((doc) => doc.extracted?.document_type === documentType)
        .map(transformDocumentMetaData);
}




// Utility to sort documents by schema order
export function sortDocumentsBySchemaOrder(
    documents: DocumentMetaDataTransformedModel[],
    documentSchema: DocumentTypeSchemaModel
): DocumentMetaDataTransformedModel[] {
    if (!documentSchema?.sortByKeyOrder || documentSchema.sortByKeyOrder.length === 0) return documents;

    // Only sort by keys that exist in DocumentExtractedResponseAPIData
    const validSortKey = documentSchema.sortByKeyOrder.find(key =>
        documents[0]?.extracted && (key as keyof DocumentExtractedResponseAPIData) in documents[0].extracted!
    );
    if (!validSortKey) return documents;

    const isFirestoreTimestamp = (value: any): value is FirebaseFirestore.Timestamp =>
        value && typeof value.seconds === 'number';

    return documents.slice().sort((a, b) => {
        const aExtracted = a.extracted as DocumentExtractedResponseAPIData | null;
        const bExtracted = b.extracted as DocumentExtractedResponseAPIData | null;
        const aVal = aExtracted ? aExtracted[validSortKey as keyof DocumentExtractedResponseAPIData] : undefined;
        const bVal = bExtracted ? bExtracted[validSortKey as keyof DocumentExtractedResponseAPIData] : undefined;

        // Handle Timestamp (from Firestore)
        if (isFirestoreTimestamp(aVal) && isFirestoreTimestamp(bVal)) {
            return bVal.seconds - aVal.seconds;
        }

        // Handle string/number
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return bVal - aVal;
        }

        // Fallback: keep original order
        return 0;
    });
}

// Function to delete a document by ID
export async function deleteDocument(userId: string, profileId: string, documentId: string): Promise<void> {
    try {
        const documentRef = adminDb.collection('users').doc(userId).collection('profiles').doc(profileId).collection('documents').doc(documentId);
        await documentRef.delete();
        console.log(`Document with ID ${documentId} deleted successfully.`);
    } catch (error) {
        console.error(`Failed to delete document with ID ${documentId}:`, error);
        throw new Error('Failed to delete document.');
    }
}