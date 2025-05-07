import { DocumentExtractedResponseData } from './types/document.model';


import { adminDb } from './firebaseAdmin';
import { DocumentMetaDataModel } from './types/document.model';


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
    documentGroups: { documentType: string; docs: DocumentMetaDataModel[] }[];
}> {
    try {
        // Fetch documents
        const documentsRef = adminDb.collection(`users/${userId}/profiles/${profileId}/documents`);
        const querySnapshot = await documentsRef.get();
        const documents: DocumentMetaDataModel[] = [];

        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamps to strings if needed
                uploadedAt: doc.data().uploadedAt?.toDate?.() ? doc.data().uploadedAt.toDate().toISOString() : doc.data().uploadedAt,
            } as DocumentMetaDataModel);
        });

        // Group documents by type
        const groups = documents.reduce((acc, doc) => {
            const documentType = doc.extracted?.document_type || 'Others';
            const list = acc[documentType] || [];
            return { ...acc, [documentType]: [...list, doc] };
        }, {} as Record<string, DocumentMetaDataModel[]>);

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


// Fetch all documents for a user/profile filtered by documentType
export async function fetchDocumentsByType(userId: string, profileId: string, documentType: string): Promise<DocumentMetaDataModel[]> {
    const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles')
        .doc(profileId)
        .collection('documents')
        .get();
    const docs = snapshot.docs.map((doc) => doc.data() as DocumentMetaDataModel);
    return docs.filter((doc) => doc.extracted?.document_type === documentType);
}




// Utility to sort documents by schema order
export function sortDocumentsBySchemaOrder(
  documents: DocumentMetaDataModel[],
  documentSchema: DocumentTypeSchemaModel
): DocumentMetaDataModel[] {
  if (!documentSchema?.sortByKeyOrder || documentSchema.sortByKeyOrder.length === 0) return documents;

  // Only sort by keys that exist in DocumentExtractedResponseData
  const validSortKey = documentSchema.sortByKeyOrder.find(key =>
    documents[0]?.extracted && (key as keyof DocumentExtractedResponseData) in documents[0].extracted!
  );
  if (!validSortKey) return documents;

  return documents.slice().sort((a, b) => {
    const aExtracted = a.extracted as DocumentExtractedResponseData | null;
    const bExtracted = b.extracted as DocumentExtractedResponseData | null;
    const aVal = aExtracted ? aExtracted[validSortKey as keyof DocumentExtractedResponseData] : undefined;
    const bVal = bExtracted ? bExtracted[validSortKey as keyof DocumentExtractedResponseData] : undefined;
    // Handle Timestamp (from Firestore)
    if (aVal && typeof aVal === 'object' && 'seconds' in aVal && bVal && typeof bVal === 'object' && 'seconds' in bVal) {
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