import { Timestamp } from 'firebase/firestore';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';

/**
 * Transform date values to Firebase Timestamps for storage
 */
export const transformDatesToFirestore = (
  values: Record<string, any>, 
  documentSchema: DocumentTypeSchemaModel,
): Record<string, any> => {
  const transformed = { ...values };
  
  // Find date fields in the schema
  const dateFields = documentSchema.fields.filter(field => 
    field.type === 'date' || 
    field.key.toLowerCase().includes('date') || 
    field.key.toLowerCase().includes('time'),
  );
  
  dateFields.forEach(field => {
    const value = transformed[field.key];
    if (value) {
      if (typeof value === 'string') {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          transformed[field.key] = Timestamp.fromDate(parsedDate);
        }
      } else if (value instanceof Date) {
        transformed[field.key] = Timestamp.fromDate(value);
      }
      // If it's already a Timestamp, keep as is
    }
  });
  
  return transformed;
};

/**
 * Transform Firebase Timestamps back to date strings for form fields
 */
export const transformTimestampsToFormValues = (
  values: Record<string, any>, 
  documentSchema: DocumentTypeSchemaModel,
): Record<string, any> => {
  const transformed = { ...values };
  
  const dateFields = documentSchema.fields.filter(field => 
    field.type === 'date' || 
    field.key.toLowerCase().includes('date') || 
    field.key.toLowerCase().includes('time'),
  );
  
  dateFields.forEach(field => {
    const value = transformed[field.key];
    if (value && typeof value === 'object' && value.seconds !== undefined && typeof value.toDate === 'function') {
      const date = value.toDate();
      transformed[field.key] = date.toISOString().split('T')[0];
    } else if (value instanceof Date) {
      transformed[field.key] = value.toISOString().split('T')[0];
    }
  });
  
  return transformed;
};
