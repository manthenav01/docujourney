import { DocumentMetaDataAPIModel, DocumentMetaDataTransformedModel, DocumentExtractedResponseAPIData } from './types/document.model';


import { adminDb } from './firebaseAdmin';


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


// Define a transformed model for DocumentMetaDataModel


// Utility function to transform DocumentMetaDataModel
export function transformDocumentMetaData(
    doc: DocumentMetaDataAPIModel
): DocumentMetaDataTransformedModel {
    const isFirestoreTimestamp = (value: any): value is FirebaseFirestore.Timestamp =>
        value && typeof value.toDate === 'function';

    return {
        ...doc,
        uploadedAt: isFirestoreTimestamp(doc.uploadedAt)
            ? doc.uploadedAt.toDate().toISOString()
            : doc.uploadedAt,
        createdAt: isFirestoreTimestamp(doc.createdAt)
            ? doc.createdAt.toDate().toISOString()
            : doc.createdAt,
        extracted: doc.extracted
            ? {
                ...doc.extracted,
                notice_date: isFirestoreTimestamp(doc.extracted.notice_date)
                    ? doc.extracted.notice_date.toDate().toISOString()
                    : doc.extracted.notice_date,
                valid_from: isFirestoreTimestamp(doc.extracted.valid_from)
                    ? doc.extracted.valid_from.toDate().toISOString()
                    : doc.extracted.valid_from,
                valid_to: isFirestoreTimestamp(doc.extracted.valid_to)
                    ? doc.extracted.valid_to.toDate().toISOString()
                    : doc.extracted.valid_to,
                date_of_birth: isFirestoreTimestamp(doc.extracted.date_of_birth)
                    ? doc.extracted.date_of_birth.toDate().toISOString()
                    : doc.extracted.date_of_birth,
                date_of_entry: isFirestoreTimestamp(doc.extracted.date_of_entry)
                    ? doc.extracted.date_of_entry.toDate().toISOString()
                    : doc.extracted.date_of_entry,
                date_of_adjustment: isFirestoreTimestamp(doc.extracted.date_of_adjustment)
                    ? doc.extracted.date_of_adjustment.toDate().toISOString()
                    : doc.extracted.date_of_adjustment,
            }
            : null,
    };
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