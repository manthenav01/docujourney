import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc as firestoreDoc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { DocumentMetaDataAPIModel } from '@/lib/types/document.model';
import { Profile } from '@/lib/types/profile.model';
import { toast } from 'sonner';

// Import utility functions
import {
  transformDatesToFirestore,
  doNamesMatch,
  findMatchingProfile,
  validateFile,
  createNewProfile,
  uploadFileToStorage,
  handleDocumentCompletion,
  setupFormFields
} from './utils';

interface UseDocumentUploadProps {
  userId: string;
  profileId: string;
  currentProfile: Profile;
  allProfiles: Profile[];
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSuccess?: () => void;
  onProfileCreated?: (newProfileId: string) => void;
}

export const useDocumentUpload = ({ 
  userId, 
  profileId, 
  currentProfile, 
  allProfiles, 
  documentSchemas, 
  onSuccess, 
  onProfileCreated 
}: UseDocumentUploadProps) => {
  // State management
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [docRefId, setDocRefId] = useState<string>();
  const [formFields, setFormFields] = useState<Record<string, any> | null>(null);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [showDocumentTypeSelection, setShowDocumentTypeSelection] = useState(false);
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
  const [extractedPersonInfo, setExtractedPersonInfo] = useState<{firstName: string, lastName: string} | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileId);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Document processing effect
  useEffect(() => {
    if (!docRefId) return;
    
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
    const unsub = onSnapshot(docRef, async (snap) => {
      const data = snap.data() as DocumentMetaDataAPIModel;
      
      if (data?.status === 'completed' && data.extracted) {
        try {
          await handleDocumentCompletion(
            data,
            userId,
            selectedProfileId,
            docRefId,
            documentSchemas,
            // onProfileMismatch
            (firstName: string, lastName: string) => {
              setExtractedPersonInfo({ firstName, lastName });
              setShowNewProfileDialog(true);
            },
            // onDocumentTypeNotFound
            () => setShowDocumentTypeSelection(true),
            // onSuccess
            (detectedDocumentType: string, formReadyFields: Record<string, any>) => {
              setDocumentType(detectedDocumentType);
              setShowDocumentTypeSelection(false);
              setFormFields(formReadyFields);
            },
            // onProfileSwitch
            (newProfileId: string) => {
              setSelectedProfileId(newProfileId);
              if (onProfileCreated) {
                onProfileCreated(newProfileId);
              }
            },
            currentProfile,
            allProfiles,
            doNamesMatch,
            findMatchingProfile
          );
        } catch (error) {
          console.error('Error processing document:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    });
    
    return () => unsub();
  }, [docRefId, userId, selectedProfileId, documentSchemas, currentProfile, allProfiles, onProfileCreated]);

  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return;
      }
      
      setFile(selectedFile);
      setUploadProgress(0);
      setError(null);
    }
  };

  // Upload handler
  const startUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const documentId = await uploadFileToStorage(
        file,
        userId,
        selectedProfileId,
        setUploadProgress
      );
      
      setDocRefId(documentId);
      setIsLoading(false);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Verification submission handler
  const handleVerificationSubmit = async (values: Record<string, any>) => {
    if (!docRefId || !documentType) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const ref = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
      const documentSchema = documentSchemas[documentType];
      const transformedValues = transformDatesToFirestore(values, documentSchema);
      
      const extractedData = {
        ...transformedValues,
        document_type: documentType
      };
      
      await updateDoc(ref, { extracted: extractedData, status: 'verified' });
      resetUpload();
      toast.success('Document saved successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving verification:', error);
      const errorMessage = 'Failed to save document. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Document type selection handler
  const handleDocumentTypeSelection = async (selectedDocumentType: string) => {
    if (!documentSchemas[selectedDocumentType] || !docRefId) return;
    
    setDocumentType(selectedDocumentType);
    setShowDocumentTypeSelection(false);
    
    try {
      const formReadyFields = await setupFormFields(
        selectedDocumentType,
        documentSchemas,
        userId,
        selectedProfileId,
        docRefId
      );
      setFormFields(formReadyFields);
    } catch (error) {
      console.error('Error setting up form fields:', error);
      const errorMessage = 'Failed to setup form. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Navigation handlers
  const goBackToDocumentTypeSelection = () => {
    setDocumentType(null);
    setFormFields(null);
    setShowDocumentTypeSelection(true);
  };

  // Profile creation handlers
  const handleNewProfileConfirm = async (relationship: string, email?: string) => {
    if (!extractedPersonInfo) return;
    
    setIsLoading(true);
    try {
      const newProfileId = await createNewProfile(
        userId,
        extractedPersonInfo.firstName,
        extractedPersonInfo.lastName,
        relationship,
        email
      );
      
      // Move the document to the new profile
      if (docRefId) {
        const oldDocRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
        const docData = await getDoc(oldDocRef);
        
        if (docData.exists()) {
          const newDocRef = firestoreDoc(db, `users/${userId}/profiles/${newProfileId}/documents`, docRefId);
          await setDoc(newDocRef, docData.data());
          await updateDoc(oldDocRef, { status: 'deleted' });
        }
      }
      
      setSelectedProfileId(newProfileId);
      setShowNewProfileDialog(false);
      setExtractedPersonInfo(null);
      toast.success('New profile created successfully!');
      
      if (onProfileCreated) {
        onProfileCreated(newProfileId);
      }
    } catch (error) {
      console.error('Error creating new profile:', error);
      const errorMessage = 'Failed to create new profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProfileCancel = () => {
    setShowNewProfileDialog(false);
    setExtractedPersonInfo(null);
    resetUpload();
  };

  // Reset functionality
  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setDocRefId(undefined);
    setFormFields(null);
    setDocumentType(null);
    setShowDocumentTypeSelection(false);
    setShowNewProfileDialog(false);
    setExtractedPersonInfo(null);
    setSelectedProfileId(profileId);
    setError(null);
    setIsLoading(false);
  };

  return {
    // State
    file,
    uploadProgress,
    formFields,
    documentType,
    documentId: docRefId,
    showDocumentTypeSelection,
    showNewProfileDialog,
    extractedPersonInfo,
    selectedProfileId,
    error,
    isLoading,
    
    // Handlers
    handleFileSelect,
    startUpload,
    handleVerificationSubmit,
    handleDocumentTypeSelection,
    handleNewProfileConfirm,
    handleNewProfileCancel,
    goBackToDocumentTypeSelection,
    resetUpload
  };
};
