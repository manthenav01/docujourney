import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc as firestoreDoc, onSnapshot, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
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
  fetchProfileById,
  uploadFileToStorage,
  handleDocumentCompletion,
  setupFormFields,
  triggerVisaStatusAnalysis,
  updateProfileFromDocumentData
} from './utils';

interface UseDocumentUploadProps {
  userId: string;
  profileId: string;
  currentProfile: Profile;
  allProfiles: Profile[];
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSuccess?: (finalProfileId: string) => void;
  onProfileCreated?: (newProfileId: string, newProfile?: Profile) => void;
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
  const [showFirstEntryDateSelection, setShowFirstEntryDateSelection] = useState(false);
  const [firstEntryDateCollected, setFirstEntryDateCollected] = useState(false);
  const [pendingVerificationData, setPendingVerificationData] = useState<Record<string, any> | null>(null);
  const [extractedPersonInfo, setExtractedPersonInfo] = useState<{firstName: string, lastName: string} | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileId);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localAllProfiles, setLocalAllProfiles] = useState<Profile[]>(allProfiles);
  const [currentExtractedData, setCurrentExtractedData] = useState<Record<string, any> | null>(null);

  // Sync local profiles with prop changes
  useEffect(() => {
    setLocalAllProfiles(allProfiles);
  }, [allProfiles]);

  // Document processing effect
  useEffect(() => {
    if (!docRefId) return;
    
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
    const unsub = onSnapshot(docRef, async (snap) => {
      // Check if document exists (it might have been moved/deleted)
      if (!snap.exists()) {
        console.log('Document no longer exists at this location:', snap.ref.path);
        return;
      }
      
      const data = snap.data() as DocumentMetaDataAPIModel;
      
      if (data?.status === 'completed' && data.extracted) {
        // Store the current extracted data for later use
        setCurrentExtractedData(data.extracted);
        
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
            localAllProfiles,
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
    
    // Check if profile has firstEntryDate, if not, show selection screen
    if (!currentProfile.firstEntryDate) {
      setPendingVerificationData(values);
      setShowFirstEntryDateSelection(true);
      return;
    }
    
    // Process the verification
    await processVerification(values);
  };

  // Process verification (separated for reuse)
  const processVerification = async (values: Record<string, any>) => {
    if (!docRefId || !documentType) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const ref = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
      const documentSchema = documentSchemas[documentType];
      const transformedValues = transformDatesToFirestore(values, documentSchema);
      
      // Use the stored extracted data instead of fetching again
      const existingExtracted = currentExtractedData || {};
      
      // Merge existing extracted data with new transformed values
      const extractedData = {
        ...existingExtracted, // Keep any existing fields
        ...transformedValues, // Add/update with new values
        document_type: documentType // Ensure document_type is set
      };
      
      await updateDoc(ref, { extracted: extractedData, status: 'verified' });
      
      // Update profile with document data if profile is missing that information
      try {
        await updateProfileFromDocumentData(userId, selectedProfileId, extractedData, currentProfile);
      } catch (error) {
        console.warn('Failed to update profile from document data, but document was saved:', error);
      }
      
      // Trigger visa status analysis after successful document verification
      triggerVisaStatusAnalysis(userId, selectedProfileId).catch(error => {
        console.warn('Visa status analysis failed, but document was saved:', error);
      });
      
      await resetUpload();
      toast.success('Document saved successfully!');
      
      if (onSuccess) {
        onSuccess(selectedProfileId);
      }
    } catch (error) {
      console.error('Error saving verification:', error);
      const errorMessage = 'Failed to save document. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle first entry date submission
  const handleFirstEntryDateSubmit = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update profile with first entry date
      const profileRef = firestoreDoc(db, `users/${userId}/profiles`, selectedProfileId);
      await updateDoc(profileRef, {
        firstEntryDate: date.toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Update local profile data
      const updatedProfile = {
        ...currentProfile,
        firstEntryDate: date.toISOString()
      };
      
      // Continue with verification process
      setShowFirstEntryDateSelection(false);
      setFirstEntryDateCollected(true);
      setPendingVerificationData(null);
      
      // Process the pending verification with updated profile
      if (pendingVerificationData) {
        await processVerification(pendingVerificationData);
      }
    } catch (error) {
      console.error('Error saving first entry date:', error);
      const errorMessage = 'Failed to save entry date. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle first entry date selection cancel
  const handleFirstEntryDateCancel = () => {
    setShowFirstEntryDateSelection(false);
    setPendingVerificationData(null);
    setIsLoading(false);
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

      // Fetch the newly created profile to get complete data
      const newProfile = await fetchProfileById(userId, newProfileId);
      
      // Add the new profile to our local profiles array
      if (newProfile) {
        setLocalAllProfiles(prev => [...prev, newProfile]);
      }
      
      // Move the document to the new profile
      if (docRefId) {
        const oldDocRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
        const docData = await getDoc(oldDocRef);
        
        if (docData.exists()) {
          const newDocRef = firestoreDoc(db, `users/${userId}/profiles/${newProfileId}/documents`, docRefId);
          await setDoc(newDocRef, docData.data());
          
          // Delete the old document completely
          try {
            console.log('Attempting to delete document from:', oldDocRef.path);
            await deleteDoc(oldDocRef);
            console.log('Successfully deleted old document from profile:', selectedProfileId);
            
            // Verify deletion
            const checkDoc = await getDoc(oldDocRef);
            if (checkDoc.exists()) {
              console.error('Document still exists after deletion attempt');
            } else {
              console.log('Confirmed: Document has been deleted');
            }
          } catch (deleteError) {
            console.error('Error deleting old document:', deleteError);
            throw new Error('Failed to delete old document');
          }
          
          // After moving the document, check if it's ready for verification
          const documentData = docData.data() as DocumentMetaDataAPIModel;
          if (documentData.status === 'completed' && documentData.extracted) {
            // Continue with the document processing flow
            try {
              await handleDocumentCompletion(
                documentData,
                userId,
                newProfileId,
                docRefId,
                documentSchemas,
                // onProfileMismatch - shouldn't happen since we just created the profile
                () => {},
                // onDocumentTypeNotFound
                () => setShowDocumentTypeSelection(true),
                // onSuccess
                (detectedDocumentType: string, formReadyFields: Record<string, any>) => {
                  setDocumentType(detectedDocumentType);
                  setShowDocumentTypeSelection(false);
                  setFormFields(formReadyFields);
                },
                // onProfileSwitch - shouldn't happen
                () => {},
                // Use the fetched profile or create a temporary one as fallback
                newProfile || {
                  id: newProfileId,
                  firstName: extractedPersonInfo.firstName,
                  lastName: extractedPersonInfo.lastName,
                  relationship,
                  email: email || '',
                  admin: false,
                  isAdmin: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as Profile,
                localAllProfiles,
                doNamesMatch,
                findMatchingProfile
              );
            } catch (error) {
              console.error('Error processing document after profile creation:', error);
              setError('Document processing failed. Please try uploading again.');
            }
          }
        }
      }
      
      setSelectedProfileId(newProfileId);
      setShowNewProfileDialog(false);
      setExtractedPersonInfo(null);
      toast.success('New profile created successfully!');
      
      if (onProfileCreated) {
        onProfileCreated(newProfileId, newProfile || undefined);
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

  const handleNewProfileCancel = async () => {
    setShowNewProfileDialog(false);
    setExtractedPersonInfo(null);
    await resetUpload();
  };

  // Document deletion helper
  const deleteCurrentDocument = async () => {
    if (!docRefId) return;
    
    try {
      const docRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
      await deleteDoc(docRef);
      console.log('Successfully deleted document:', docRefId);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  };

  // Reset functionality
  const resetUpload = async (deleteDocument = false) => {
    // Delete the document if requested and if there's one to delete
    if (deleteDocument && docRefId) {
      try {
        await deleteCurrentDocument();
      } catch (error) {
        console.error('Error deleting document during reset:', error);
        // Continue with reset even if deletion fails
      }
    }
    
    setFile(null);
    setUploadProgress(0);
    setDocRefId(undefined);
    setFormFields(null);
    setDocumentType(null);
    setShowDocumentTypeSelection(false);
    setShowNewProfileDialog(false);
    setShowFirstEntryDateSelection(false);
    setFirstEntryDateCollected(false);
    setPendingVerificationData(null);
    setExtractedPersonInfo(null);
    setSelectedProfileId(profileId);
    setError(null);
    setIsLoading(false);
    setCurrentExtractedData(null);
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
    showFirstEntryDateSelection,
    firstEntryDateCollected,
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
    handleFirstEntryDateSubmit,
    handleFirstEntryDateCancel,
    goBackToDocumentTypeSelection,
    resetUpload,
    deleteCurrentDocument
  };
};
