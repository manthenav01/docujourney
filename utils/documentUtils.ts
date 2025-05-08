import { DocumentExtractedTransformedData, DocumentMetaDataTransformedModel } from '@/lib/types/document.model';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';

export function sortDocumentsBySchemaOrder(documents: DocumentMetaDataTransformedModel[], documentSchema: DocumentTypeSchemaModel): DocumentMetaDataTransformedModel[] {
    if (!documentSchema?.sortByKeyOrder || documentSchema.sortByKeyOrder.length === 0) return documents;

    // Only sort by keys that exist in DocumentExtractedResponseData
    const validSortKey = documentSchema.sortByKeyOrder.find(key =>
        documents[0]?.extracted && (key as keyof DocumentExtractedTransformedData) in documents[0].extracted!
    );
    if (!validSortKey) return documents;

    return documents.slice().sort((a, b) => {
        const aExtracted = a.extracted as DocumentExtractedTransformedData | null;
        const bExtracted = b.extracted as DocumentExtractedTransformedData | null;
        const aVal = aExtracted ? aExtracted[validSortKey as keyof DocumentExtractedTransformedData] : undefined;
        const bVal = bExtracted ? bExtracted[validSortKey as keyof DocumentExtractedTransformedData] : undefined;

        // Handle string/number
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            // Check if the string is a date
            const aDate = new Date(aVal);
            const bDate = new Date(bVal);
            if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                return bDate.getTime() - aDate.getTime();
            }
            return bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return bVal - aVal;
        }

        // Fallback: keep original order
        return 0;
    });
}

// export function formatDate(value: any): string {
//     const dateValue = new Date(value);
//     if (!isNaN(dateValue.getTime())) {
//         return dateValue.toLocaleDateString('en-US', {
//             month: 'long',
//             day: 'numeric',
//             year: 'numeric'
//         });
//     }
//     return 'N/A';
// }

export function formatValue(value: any, fieldType?: string): string {
    // Handle null or undefined
    if (value === undefined || value === null) return 'N/A';

    // Handle date strings if field type is date
    if (fieldType === 'date' && typeof value === 'string') {
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
            return dateValue.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    // Return string representation for everything else
    return String(value);
} 