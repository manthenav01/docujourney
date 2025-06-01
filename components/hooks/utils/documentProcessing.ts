import { doc as firestoreDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DocumentMetaDataAPIModel } from '@/lib/types/document.model';
import { transformDocumentMetaData } from '@/utils/documentUtils';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { transformTimestampsToFormValues } from './dateTransformers';
import { Profile } from '@/lib/types/profile.model';

/**
 * Handle document completion and profile matching logic
 */
export const handleDocumentCompletion = async (
  data: DocumentMetaDataAPIModel,
  userId: string,
  profileId: string,
  docRefId: string,
  documentSchemas: Record<string, DocumentTypeSchemaModel>,
  onProfileMismatch: (firstName: string, lastName: string) => void,
  onDocumentTypeNotFound: () => void,
  onSuccess: (documentType: string, formFields: Record<string, any>) => void,
  onProfileSwitch: (newProfileId: string) => void,
  currentProfile: { firstName: string; lastName: string },
  allProfiles: Profile[],
  doNamesMatch: (fn1: string, ln1: string, fn2: string, ln2: string) => boolean,
  findMatchingProfile: (fn: string, ln: string, profiles: Profile[]) => Profile | null
) => {
  const transformedData = transformDocumentMetaData(data);
  const detectedDocumentType = transformedData?.extracted?.document_type;
  
  if (!detectedDocumentType || !documentSchemas[detectedDocumentType]) {
    console.warn(`Document type ${detectedDocumentType} not found in schemas, showing manual selection`);
    onDocumentTypeNotFound();
    return;
  }

  // Check if extracted names match current profile
  const extractedFirstName = transformedData.extracted?.first_name;
  const extractedLastName = transformedData.extracted?.last_name;
  
  if (extractedFirstName && extractedLastName) {
    const currentProfileMatches = doNamesMatch(
      extractedFirstName, 
      extractedLastName, 
      currentProfile.firstName, 
      currentProfile.lastName
    );

    if (!currentProfileMatches) {
      // Check if there's an existing profile that matches
      const matchingProfile = findMatchingProfile(extractedFirstName, extractedLastName, allProfiles);
      
      if (matchingProfile) {
        // Found existing profile, move document to that profile
        try {
          const docRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
          await updateDoc(docRef, { status: 'deleted' });
          
          const newDocRef = firestoreDoc(db, `users/${userId}/profiles/${matchingProfile.id}/documents`, docRefId);
          await setDoc(newDocRef, { 
            ...data,
            status: 'completed'
          });
          
          onProfileSwitch(matchingProfile.id);
        } catch (error) {
          console.error('Error moving document to existing profile:', error);
          throw new Error('Failed to assign document to existing profile');
        }
      } else {
        // No matching profile found, need to create new one
        onProfileMismatch(extractedFirstName, extractedLastName);
        return;
      }
    }
  }
  
  // Process the document fields
  const fields = documentSchemas[detectedDocumentType].fields.filter((f) => f.editable);
  const extractedFields = fields.reduce((acc, field) => {
    acc[field.key] = (transformedData.extracted as Record<string, any>)?.[field.key];
    return acc;
  }, {} as Record<string, any>);
  
  const formReadyFields = transformTimestampsToFormValues(extractedFields, documentSchemas[detectedDocumentType]);
  onSuccess(detectedDocumentType, formReadyFields);
};

/**
 * Setup form fields for manual document type selection
 */
export const setupFormFields = async (
  selectedDocumentType: string,
  documentSchemas: Record<string, DocumentTypeSchemaModel>,
  userId: string,
  profileId: string,
  docRefId: string
): Promise<Record<string, any>> => {
  const fields = documentSchemas[selectedDocumentType].fields.filter((f) => f.editable);
  
  try {
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
    const snap = await getDoc(docRef);
    const data = snap.data() as DocumentMetaDataAPIModel;
    
    // Update the document with the selected document type
    await updateDoc(docRef, { 
      'extracted.document_type': selectedDocumentType 
    });
    
    if (data?.extracted) {
      const transformedData = transformDocumentMetaData(data);
      const extractedFields = fields.reduce((acc, field) => {
        acc[field.key] = (transformedData.extracted as Record<string, any>)?.[field.key] || '';
        return acc;
      }, {} as Record<string, any>);
      
      return transformTimestampsToFormValues(extractedFields, documentSchemas[selectedDocumentType]);
    } else {
      // Create empty form fields
      return fields.reduce((acc, field) => {
        acc[field.key] = '';
        return acc;
      }, {} as Record<string, any>);
    }
  } catch (error) {
    console.error('Error fetching document data:', error);
    // Fallback to empty fields
    return fields.reduce((acc, field) => {
      acc[field.key] = '';
      return acc;
    }, {} as Record<string, any>);
  }
};
