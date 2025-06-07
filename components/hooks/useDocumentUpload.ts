import { useState, useEffect, useCallback, useMemo } from 'react';
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

// Upload flow phases for better state management
type UploadPhase = 
  | 'idle'           // No file selected
  | 'file-selected'  // File selected, ready to upload
  | 'uploading'      // File uploading to storage
  | 'processing'     // Document being processed by AI
  | 'type-selection' // User needs to select document type
  | 'verification'   // User verifying extracted data
  | 'saving'         // Saving verified document
  | 'profile-dialog' // Creating new profile for name mismatch
  | 'profile-info'   // Collecting missing profile info (first entry date/visa)
  | 'completed'      // Flow completed successfully
  | 'error';         // Error state

// Loading states for specific operations
interface LoadingStates {
  upload: boolean;
  verification: boolean;
  profileCreation: boolean;
  profileUpdate: boolean;
  documentMove: boolean;
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
  // Core state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [docRefId, setDocRefId] = useState<string>();
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    upload: false,
    verification: false,
    profileCreation: false,
    profileUpdate: false,
    documentMove: false
  });
  
  // Document processing state
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Record<string, any> | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  
  // Profile management state
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileId);
  const [localAllProfiles, setLocalAllProfiles] = useState<Profile[]>(allProfiles);
  const [extractedPersonInfo, setExtractedPersonInfo] = useState<{firstName: string, lastName: string} | null>(null);
  
  // Dialog states
  const [showDocumentTypeSelection, setShowDocumentTypeSelection] = useState(false);
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
  const [showFirstEntryDateSelection, setShowFirstEntryDateSelection] = useState(false);

  // Computed loading flags for UI
  const isAnyLoading = useMemo(() => 
    Object.values(loadingStates).some(loading => loading), 
    [loadingStates]
  );
  
  const isFormDisabled = useMemo(() => 
    isAnyLoading || phase === 'saving' || phase === 'profile-dialog' || phase === 'completed',
    [isAnyLoading, phase]
  );

  // Helper function to update loading states
  const setLoading = useCallback((operation: keyof LoadingStates, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [operation]: loading }));
  }, []);

  // Helper function to clear all errors and loading states
  const clearErrorAndLoading = useCallback(() => {
    setError(null);
    setLoadingStates({
      upload: false,
      verification: false,
      profileCreation: false,
      profileUpdate: false,
      documentMove: false
    });
  }, []);

  // Helper function to handle errors consistently
  const handleError = useCallback((error: unknown, operation: keyof LoadingStates, defaultMessage: string) => {
    console.error(`Error in ${operation}:`, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
    setLoading(operation, false);
    return errorMessage;
  }, [setLoading]);

  // Sync local profiles with prop changes
  useEffect(() => {
    setLocalAllProfiles(allProfiles);
  }, [allProfiles]);

  // Document processing effect
  useEffect(() => {
    // Don't set up listener if no document or during profile creation
    if (!docRefId || phase === 'profile-dialog' || loadingStates.documentMove) {
      return;
    }
    
    console.log('Setting up document listener for:', {
      docRefId,
      selectedProfileId,
      phase,
      path: `users/${userId}/profiles/${selectedProfileId}/documents/${docRefId}`
    });
    
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
    const unsub = onSnapshot(docRef, async (snap) => {
      console.log('Document snapshot update:', {
        exists: snap.exists(),
        path: snap.ref.path,
        phase,
        data: snap.exists() ? snap.data() : null
      });
      
      // Handle document not found (could be moved or deleted)
      if (!snap.exists()) {
        console.log('Document no longer exists at this location:', snap.ref.path);
        
        // If we're moving a document, don't search for it yet
        if (loadingStates.documentMove) {
          console.log('Document move in progress, skipping search');
          return;
        }
        
        // Try to find the document in other profiles
        const foundProfileId = await findDocumentInProfiles();
        if (foundProfileId) {
          setSelectedProfileId(foundProfileId);
          return; // Effect will re-run with correct profile ID
        }
        
        console.log('Document not found in any profile - may have been deleted');
        setPhase('error');
        setError('Document was deleted or moved. Please try uploading again.');
        return;
      }
      
      const data = snap.data() as DocumentMetaDataAPIModel;
      
      // Handle completed document processing
      if (data?.status === 'completed' && data.extracted) {
        setExtractedData(data.extracted);
        
        // Only process if we're not already in verification or other advanced phases
        if (phase === 'processing' || phase === 'uploading') {
          setPhase('processing');
          
          try {
            await processCompletedDocument(data);
          } catch (error) {
            handleError(error, 'verification', 'Failed to process document');
            setPhase('error');
          }
        } else {
          console.log('Document updated but already in phase:', phase, '- skipping processing');
        }
      }
    });
    
    return () => unsub();
  }, [docRefId, userId, selectedProfileId, phase, loadingStates.documentMove]);

  // Helper function to find document in all profiles
  const findDocumentInProfiles = useCallback(async (): Promise<string | null> => {
    if (!docRefId) return null;
    
    console.log('Searching for document in all profiles...');
    for (const profile of localAllProfiles) {
      if (profile.id === selectedProfileId) continue; // Skip current profile
      
      const altRef = firestoreDoc(db, `users/${userId}/profiles/${profile.id}/documents`, docRefId);
      try {
        const altSnap = await getDoc(altRef);
        if (altSnap.exists()) {
          console.log(`Found document in profile: ${profile.id} (${profile.firstName} ${profile.lastName})`);
          return profile.id;
        }
      } catch (error) {
        console.error(`Error checking profile ${profile.id}:`, error);
      }
    }
    return null;
  }, [docRefId, localAllProfiles, selectedProfileId, userId]);

  // Helper function to process completed document
  const processCompletedDocument = useCallback(async (data: DocumentMetaDataAPIModel) => {
    if (!docRefId) return;
    
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
          setPhase('profile-dialog');
          setShowNewProfileDialog(true);
        },
        // onDocumentTypeNotFound
        () => {
          setPhase('type-selection');
          setShowDocumentTypeSelection(true);
        },
        // onSuccess
        (detectedDocumentType: string, formReadyFields: Record<string, any>) => {
          setDocumentType(detectedDocumentType);
          setFormFields(formReadyFields);
          setShowDocumentTypeSelection(false);
          setPhase('verification');
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
      throw error; // Re-throw to be handled by caller
    }
  }, [docRefId, userId, selectedProfileId, documentSchemas, currentProfile, localAllProfiles, onProfileCreated]);

  // File selection handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      clearErrorAndLoading();
      setPhase('file-selected');
    }
  }, [clearErrorAndLoading]);

  // Upload handler
  const startUpload = useCallback(async () => {
    if (!file || phase !== 'file-selected') return;
    
    setPhase('uploading');
    setLoading('upload', true);
    clearErrorAndLoading();
    
    try {
      const documentId = await uploadFileToStorage(
        file,
        userId,
        selectedProfileId,
        setUploadProgress
      );
      
      setDocRefId(documentId);
      setPhase('processing');
      setLoading('upload', false);
    } catch (error) {
      handleError(error, 'upload', 'Upload failed');
      setPhase('error');
    }
  }, [file, phase, userId, selectedProfileId, setLoading, clearErrorAndLoading, handleError]);

  // Verification submission handler
  const handleVerificationSubmit = useCallback(async (values: Record<string, any>) => {
    if (!docRefId || !documentType || phase !== 'verification') return;
    
    setPhase('saving');
    setLoading('verification', true);
    
    try {
      const finalProfileId = await saveVerifiedDocument(values);
      
      if (!finalProfileId) {
        throw new Error('Failed to get profile ID after document verification');
      }
      
      // Check if we need to collect missing profile information
      const profile = localAllProfiles.find(p => p.id === finalProfileId) || currentProfile;
      const needsFirstEntryInfo = !profile.firstEntryDate || !profile.firstEntryVisaType;
      
      if (needsFirstEntryInfo) {
        setPhase('profile-info');
        setShowFirstEntryDateSelection(true);
        setSelectedProfileId(finalProfileId);
        setLoading('verification', false);
      } else {
        // Complete the flow immediately
        await completeUploadFlow(finalProfileId);
      }
    } catch (error) {
      handleError(error, 'verification', 'Failed to save document');
      setPhase('error');
    }
  }, [docRefId, documentType, phase, localAllProfiles, currentProfile, setLoading, handleError]);

  // Save verified document data
  const saveVerifiedDocument = useCallback(async (values: Record<string, any>): Promise<string | undefined> => {
    if (!docRefId || !documentType) return;
    
    // Find the actual document location
    let documentRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
    let docSnapshot = await getDoc(documentRef);
    
    console.log(`Verifying document at: users/${userId}/profiles/${selectedProfileId}/documents/${docRefId} - exists: ${docSnapshot.exists()}`);
    
    // If document doesn't exist at expected location, search for it
    if (!docSnapshot.exists()) {
      const foundProfileId = await findDocumentInProfiles();
      if (!foundProfileId) {
        throw new Error('Document not found. It may have been deleted or moved. Please try uploading again.');
      }
      
      documentRef = firestoreDoc(db, `users/${userId}/profiles/${foundProfileId}/documents`, docRefId);
      docSnapshot = await getDoc(documentRef);
      setSelectedProfileId(foundProfileId);
    }
    
    const documentSchema = documentSchemas[documentType];
    const transformedValues = transformDatesToFirestore(values, documentSchema);
    
    // Merge with existing extracted data
    const mergedData = {
      ...extractedData,
      ...transformedValues,
      document_type: documentType
    };
    
    console.log('Updating document with verified data:', mergedData);
    await updateDoc(documentRef, { 
      extracted: mergedData, 
      status: 'verified' 
    });
    
    // Update profile with document data if needed
    try {
      const profile = localAllProfiles.find(p => p.id === selectedProfileId) || currentProfile;
      await updateProfileFromDocumentData(userId, selectedProfileId, mergedData, profile);
    } catch (error) {
      console.warn('Failed to update profile from document data, but document was saved:', error);
    }
    
    // Trigger visa status analysis
    triggerVisaStatusAnalysis(userId, selectedProfileId).catch(error => {
      console.warn('Visa status analysis failed, but document was saved:', error);
    });
    
    toast.success('Document saved successfully!');
    return selectedProfileId;
  }, [docRefId, documentType, userId, selectedProfileId, documentSchemas, extractedData, findDocumentInProfiles, localAllProfiles, currentProfile]);

  // Handle first entry date submission
  const handleFirstEntryDateSubmit = useCallback(async (data: { date?: Date; visaType?: string }) => {
    if (phase !== 'profile-info') return;
    
    setLoading('profileUpdate', true);
    
    try {
      const updateData: { [key: string]: any } = {
        updatedAt: new Date().toISOString()
      };
      
      if (data.date) {
        updateData.firstEntryDate = data.date.toISOString();
      }
      
      if (data.visaType) {
        updateData.firstEntryVisaType = data.visaType;
      }
      
      const profileRef = firestoreDoc(db, `users/${userId}/profiles`, selectedProfileId);
      await updateDoc(profileRef, updateData);
      
      setShowFirstEntryDateSelection(false);
      toast.success('Profile information updated successfully!');
      
      await completeUploadFlow(selectedProfileId);
    } catch (error) {
      handleError(error, 'profileUpdate', 'Failed to save entry date. Please try again.');
    }
  }, [phase, userId, selectedProfileId, setLoading, handleError]);

  // Handle first entry date selection cancel
  const handleFirstEntryDateCancel = useCallback(async () => {
    setShowFirstEntryDateSelection(false);
    // Document is already saved, just complete the flow
    await completeUploadFlow(selectedProfileId);
  }, [selectedProfileId]);

  // Complete the upload flow
  const completeUploadFlow = useCallback(async (finalProfileId: string) => {
    setPhase('completed');
    await resetUpload();
    if (onSuccess) {
      onSuccess(finalProfileId);
    }
  }, [onSuccess]);

  // Document type selection handler
  const handleDocumentTypeSelection = useCallback(async (selectedDocumentType: string) => {
    if (!documentSchemas[selectedDocumentType] || !docRefId || phase !== 'type-selection') return;
    
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
      setPhase('verification');
    } catch (error) {
      handleError(error, 'verification', 'Failed to setup form. Please try again.');
      setPhase('error');
    }
  }, [documentSchemas, docRefId, phase, userId, selectedProfileId, handleError]);

  // Navigation handlers
  const goBackToDocumentTypeSelection = useCallback(() => {
    setDocumentType(null);
    setFormFields(null);
    setPhase('type-selection');
    setShowDocumentTypeSelection(true);
  }, []);

  // Profile creation handlers
  const handleNewProfileConfirm = useCallback(async (relationship: string, email?: string) => {
    if (!extractedPersonInfo || phase !== 'profile-dialog') return;
    
    setLoading('profileCreation', true);
    setLoading('documentMove', true);
    
    try {
      const newProfileId = await createNewProfile(
        userId,
        extractedPersonInfo.firstName,
        extractedPersonInfo.lastName,
        relationship,
        email
      );

      // Verify profile creation
      let newProfile = null;
      for (let attempts = 0; attempts < 10; attempts++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        newProfile = await fetchProfileById(userId, newProfileId);
        if (newProfile) break;
      }
      
      if (!newProfile) {
        throw new Error('Profile was created but could not be verified. Please try again.');
      }
      
      // Add to local profiles
      setLocalAllProfiles(prev => [...prev, newProfile]);
      
      // Move document to new profile
      if (docRefId) {
        await moveDocumentToProfile(newProfileId);
        setSelectedProfileId(newProfileId);
        
        // Get the document data from the new location
        const documentRef = firestoreDoc(db, `users/${userId}/profiles/${newProfileId}/documents`, docRefId);
        const docSnap = await getDoc(documentRef);
        
        if (docSnap.exists()) {
          const documentData = docSnap.data() as DocumentMetaDataAPIModel;
          console.log('Document data after profile creation:', {
            status: documentData.status,
            hasExtracted: !!documentData.extracted,
            extractedDocType: documentData.extracted?.document_type
          });
          
          if (documentData.status === 'completed' && documentData.extracted) {
            setExtractedData(documentData.extracted);
            
            // Try to detect document type automatically
            const detectedType = documentData.extracted?.document_type;
            
            if (detectedType && documentSchemas[detectedType]) {
              // Document type detected, set up form directly
              console.log('Document type detected after profile creation:', detectedType);
              setDocumentType(detectedType);
              
              try {
                const formReadyFields = await setupFormFields(
                  detectedType,
                  documentSchemas,
                  userId,
                  newProfileId,
                  docRefId
                );
                setFormFields(formReadyFields);
                setPhase('verification');
                setShowDocumentTypeSelection(false);
                console.log('Successfully set up verification form after profile creation');
              } catch (error) {
                console.error('Error setting up form fields after profile creation:', error);
                // Fallback to manual document type selection
                setPhase('type-selection');
                setShowDocumentTypeSelection(true);
              }
            } else {
              // No document type detected, show selection dialog
              console.log('No document type detected after profile creation, showing selection');
              setPhase('type-selection');
              setShowDocumentTypeSelection(true);
            }
          } else {
            // Document not ready yet, wait for processing
            console.log('Document not ready after profile creation, waiting for processing');
            setPhase('processing');
          }
        } else {
          throw new Error('Document not found after move operation');
        }
      }
      
      setShowNewProfileDialog(false);
      setExtractedPersonInfo(null);
      toast.success('New profile created successfully!');
      
      if (onProfileCreated) {
        onProfileCreated(newProfileId, newProfile);
      }
      
    } catch (error) {
      handleError(error, 'profileCreation', 'Failed to create new profile. Please try again.');
      setPhase('error');
    } finally {
      setLoading('profileCreation', false);
      setLoading('documentMove', false);
    }
  }, [extractedPersonInfo, phase, userId, docRefId, documentSchemas, setLoading, handleError, onProfileCreated]);

  // Move document to a different profile
  const moveDocumentToProfile = useCallback(async (targetProfileId: string) => {
    if (!docRefId) return;
    
    console.log(`Moving document ${docRefId} from profile ${selectedProfileId} to profile ${targetProfileId}`);
    
    const oldDocRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
    const newDocRef = firestoreDoc(db, `users/${userId}/profiles/${targetProfileId}/documents`, docRefId);
    
    const docData = await getDoc(oldDocRef);
    if (!docData.exists()) {
      throw new Error('Source document not found');
    }
    
    await setDoc(newDocRef, docData.data());
    
    // Verify the move
    const verifyNewDoc = await getDoc(newDocRef);
    if (!verifyNewDoc.exists()) {
      throw new Error('Failed to create document in new profile location');
    }
    
    await deleteDoc(oldDocRef);
    console.log('Document moved successfully');
  }, [docRefId, selectedProfileId, userId]);

  const handleNewProfileCancel = useCallback(async () => {
    setShowNewProfileDialog(false);
    setExtractedPersonInfo(null);
    await resetUpload();
  }, []);

  // Debug helper function to check document locations
  const debugDocumentLocation = useCallback(async () => {
    if (!docRefId) {
      console.log('No document ID to debug');
      return;
    }
    
    console.log('=== DOCUMENT LOCATION DEBUG ===');
    console.log('Document ID:', docRefId);
    console.log('Selected Profile ID:', selectedProfileId);
    console.log('Current Phase:', phase);
    console.log('All Profiles:', localAllProfiles.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` })));
    
    for (const profile of localAllProfiles) {
      const docRef = firestoreDoc(db, `users/${userId}/profiles/${profile.id}/documents`, docRefId);
      try {
        const docSnap = await getDoc(docRef);
        console.log(`Profile ${profile.id} (${profile.firstName} ${profile.lastName}):`, {
          exists: docSnap.exists(),
          path: docRef.path,
          data: docSnap.exists() ? docSnap.data() : null
        });
      } catch (error) {
        console.error(`Error checking profile ${profile.id}:`, error);
      }
    }
    console.log('=== END DEBUG ===');
  }, [docRefId, selectedProfileId, phase, localAllProfiles, userId]);

  // Document deletion helper
  const deleteCurrentDocument = useCallback(async () => {
    if (!docRefId) return;
    
    try {
      const docRef = firestoreDoc(db, `users/${userId}/profiles/${selectedProfileId}/documents`, docRefId);
      console.log(`Deleting document ${docRefId} from profile ${selectedProfileId}`);
      
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        console.warn(`Document ${docRefId} not found at ${docRef.path}, may already be deleted`);
        return;
      }
      
      await deleteDoc(docRef);
      console.log('Successfully deleted document:', docRefId);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }, [docRefId, userId, selectedProfileId]);

  // Reset functionality
  const resetUpload = useCallback(async (deleteDocument = false) => {
    // Delete the document if requested and if there's one to delete
    if (deleteDocument && docRefId) {
      try {
        await deleteCurrentDocument();
      } catch (error) {
        console.error('Error deleting document during reset:', error);
      }
    }
    
    setFile(null);
    setUploadProgress(0);
    setDocRefId(undefined);
    setFormFields(null);
    setDocumentType(null);
    setExtractedData(null);
    setShowDocumentTypeSelection(false);
    setShowNewProfileDialog(false);
    setShowFirstEntryDateSelection(false);
    setExtractedPersonInfo(null);
    
    // Only reset selectedProfileId to original if we haven't moved to a new profile
    if (selectedProfileId === profileId || deleteDocument) {
      setSelectedProfileId(profileId);
    }
    
    clearErrorAndLoading();
    setPhase('idle');
  }, [docRefId, deleteCurrentDocument, selectedProfileId, profileId, clearErrorAndLoading]);

  return {
    // State
    file,
    uploadProgress,
    formFields,
    documentType,
    documentId: docRefId,
    selectedProfileId,
    error,
    phase,
    
    // Loading states
    isLoading: isAnyLoading,
    isFormDisabled,
    loadingStates,
    
    // Dialog states
    showDocumentTypeSelection,
    showNewProfileDialog,
    showFirstEntryDateSelection,
    extractedPersonInfo,
    
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
    deleteCurrentDocument,
    debugDocumentLocation
  };
};
