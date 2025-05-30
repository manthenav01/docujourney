import { useState, useEffect } from 'react';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc as firestoreDoc, onSnapshot, getDoc, Timestamp } from 'firebase/firestore';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { DocumentMetaDataAPIModel } from '@/lib/types/document.model';
import { transformDocumentMetaData } from '@/utils/documentUtils';

interface UseDocumentUploadProps {
  userId: string;
  profileId: string;
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSuccess?: () => void;
}

// Helper function to transform date values to Firebase Timestamps
const transformDatesToFirestore = (values: Record<string, any>, documentSchema: DocumentTypeSchemaModel): Record<string, any> => {
  const transformed = { ...values };
  
  // Find date fields in the schema
  const dateFields = documentSchema.fields.filter(field => 
    field.type === 'date' || field.key.toLowerCase().includes('date') || field.key.toLowerCase().includes('time')
  );
  
  dateFields.forEach(field => {
    const value = transformed[field.key];
    if (value) {
      // Handle different date formats
      if (typeof value === 'string') {
        // Try to parse the string as a date
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          transformed[field.key] = Timestamp.fromDate(parsedDate);
        }
      } else if (value instanceof Date) {
        // Convert Date object to Timestamp
        transformed[field.key] = Timestamp.fromDate(value);
      } else if (value && typeof value === 'object' && value.seconds !== undefined) {
        // Already a Timestamp, keep as is
        // Do nothing
      }
    }
  });
  
  return transformed;
};

// Helper function to transform Firebase Timestamps back to date strings for form fields
const transformTimestampsToFormValues = (values: Record<string, any>, documentSchema: DocumentTypeSchemaModel): Record<string, any> => {
  const transformed = { ...values };
  
  // Find date fields in the schema
  const dateFields = documentSchema.fields.filter(field => 
    field.type === 'date' || field.key.toLowerCase().includes('date') || field.key.toLowerCase().includes('time')
  );
  
  dateFields.forEach(field => {
    const value = transformed[field.key];
    if (value && typeof value === 'object' && value.seconds !== undefined) {
      // Convert Firebase Timestamp to date string for form input
      const date = value.toDate();
      // Format as YYYY-MM-DD for date inputs
      transformed[field.key] = date.toISOString().split('T')[0];
    } else if (value instanceof Date) {
      // Convert Date to string
      transformed[field.key] = value.toISOString().split('T')[0];
    }
  });
  
  return transformed;
};

export const useDocumentUpload = ({ userId, profileId, documentSchemas, onSuccess }: UseDocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [docRefId, setDocRefId] = useState<string>();
  const [formFields, setFormFields] = useState<Record<string, any> | null>(null);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [showDocumentTypeSelection, setShowDocumentTypeSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for document status to become 'completed', then load extracted fields
  useEffect(() => {
    if (!docRefId) return;
    
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
    const unsub = onSnapshot(docRef, (snap) => {
      const data = snap.data() as DocumentMetaDataAPIModel;
      
      if (data?.status === 'completed' && data.extracted) {
        const transformedData = transformDocumentMetaData(data);
        const detectedDocumentType = transformedData?.extracted?.document_type;
        
        if (!detectedDocumentType || !documentSchemas[detectedDocumentType]) {
          console.warn(`Document type ${detectedDocumentType} not found in schemas, showing manual selection`);
          setShowDocumentTypeSelection(true);
          return;
        }
        
        setDocumentType(detectedDocumentType);
        setShowDocumentTypeSelection(false);
        
        const fields = documentSchemas[detectedDocumentType].fields.filter((f) => f.editable);
        const extractedFields = fields.reduce((acc, field) => {
          acc[field.key] = (transformedData.extracted as Record<string, any>)?.[field.key];
          return acc;
        }, {} as Record<string, any>);
        
        // Transform Firebase Timestamps to form-friendly values
        const formReadyFields = transformTimestampsToFormValues(extractedFields, documentSchemas[detectedDocumentType]);
        setFormFields(formReadyFields);
      }
    });
    
    return () => unsub();
  }, [docRefId, userId, profileId, documentSchemas]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid file type (PDF, DOC, DOCX, JPG, PNG, TXT)');
        return;
      }
      
      setFile(selectedFile);
      setUploadProgress(0);
      setError(null);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1) Create Firestore stub record
      const docCollection = collection(db, `users/${userId}/profiles/${profileId}/documents`);
      const stub = await addDoc(docCollection, {
        status: 'uploaded',
        name: file.name,
        extracted: null,
        url: '',
        filePath: '',
        uploadedAt: new Date().toISOString()
      });
      
      setDocRefId(stub.id);
      
      // 2) Upload to Storage under a folder matching Firestore doc path
      const storage = getStorage();
      const path = `uploads/${userId}/${profileId}/${stub.id}/${file.name}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, file);
      
      uploadTask.on(
        'state_changed',
        (snap) => {
          const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
          updateDoc(stub, { filePath: path });
        },
        (err) => {
          console.error('Upload error:', err);
          setError('Failed to upload file. Please try again.');
          setIsLoading(false);
        },
        async () => {
          try {
            const url = await getDownloadURL(sRef);
            await updateDoc(stub, { url, status: 'processing' });
            setIsLoading(false);
          } catch (err) {
            console.error('Error getting download URL:', err);
            setError('Failed to complete upload. Please try again.');
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      setError('Failed to start upload. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (values: Record<string, any>) => {
    if (!docRefId || !documentType) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const ref = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
      
      // Transform dates to Firebase Timestamps before saving
      const documentSchema = documentSchemas[documentType];
      const transformedValues = transformDatesToFirestore(values, documentSchema);
      
      // Include the document type in the extracted data
      const extractedData = {
        ...transformedValues,
        document_type: documentType
      };
      
      await updateDoc(ref, { extracted: extractedData, status: 'verified' });
      resetUpload();
      
      // Call the success callback to close the dialog
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving verification:', error);
      setError('Failed to save document. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDocumentTypeSelection = async (selectedDocumentType: string) => {
    if (!documentSchemas[selectedDocumentType] || !docRefId) return;
    
    setDocumentType(selectedDocumentType);
    setShowDocumentTypeSelection(false);
    
    // Get the schema fields
    const fields = documentSchemas[selectedDocumentType].fields.filter((f) => f.editable);
    
    try {
      // Check if we have extracted data from the document
      const docRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
      const snap = await getDoc(docRef);
      const data = snap.data() as DocumentMetaDataAPIModel;
      
      // Update the document with the selected document type
      await updateDoc(docRef, { 
        'extracted.document_type': selectedDocumentType 
      });
      
      if (data?.extracted) {
        // If we have extracted data, use it to populate form fields
        const transformedData = transformDocumentMetaData(data);
        const extractedFields = fields.reduce((acc, field) => {
          acc[field.key] = (transformedData.extracted as Record<string, any>)?.[field.key] || '';
          return acc;
        }, {} as Record<string, any>);
        
        // Transform Firebase Timestamps to form-friendly values
        const formReadyFields = transformTimestampsToFormValues(extractedFields, documentSchemas[selectedDocumentType]);
        setFormFields(formReadyFields);
      } else {
        // If no extracted data, create empty form fields
        const emptyFields = fields.reduce((acc, field) => {
          acc[field.key] = '';
          return acc;
        }, {} as Record<string, any>);
        
        setFormFields(emptyFields);
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
      // Fallback to empty fields if there's an error
      const emptyFields = fields.reduce((acc, field) => {
        acc[field.key] = '';
        return acc;
      }, {} as Record<string, any>);
      
      setFormFields(emptyFields);
    }
  };

  const goBackToDocumentTypeSelection = () => {
    setDocumentType(null);
    setFormFields(null);
    setShowDocumentTypeSelection(true);
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setDocRefId(undefined);
    setFormFields(null);
    setDocumentType(null);
    setShowDocumentTypeSelection(false);
    setError(null);
    setIsLoading(false);
  };

  return {
    file,
    uploadProgress,
    formFields,
    documentType,
    documentId: docRefId,
    showDocumentTypeSelection,
    error,
    isLoading,
    handleFileSelect,
    startUpload,
    handleVerificationSubmit,
    handleDocumentTypeSelection,
    goBackToDocumentTypeSelection,
    resetUpload
  };
};
