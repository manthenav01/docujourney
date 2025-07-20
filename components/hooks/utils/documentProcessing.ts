import { doc as firestoreDoc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DocumentMetaDataAPIModel } from '@/lib/types/document.model';
import { transformDocumentMetaData } from '@/utils/documentUtils';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { transformTimestampsToFormValues } from './dateTransformers';
import { Profile } from '@/lib/types/profile.model';
import { triggerTimelineRegeneration } from '@/lib/timelineClientTriggers';

/**
 * Trigger visa status analysis for a profile after document verification
 */
export const triggerVisaStatusAnalysis = async (userId: string, profileId: string) => {
  try {
    console.log(`Triggering visa status analysis for user ${userId}, profile ${profileId}`);
    
    const response = await fetch('/api/analyzeVisaStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, profileId }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Visa status analysis completed:', result.currentStatus);
      return result;
    } else {
      console.warn('Visa status analysis failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error triggering visa status analysis:', error);
    // Don't throw error to avoid breaking the document verification flow
  }
};

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
  findMatchingProfile: (fn: string, ln: string, profiles: Profile[]) => Profile | null,
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
      currentProfile.lastName,
    );

    if (!currentProfileMatches) {
      // Check if there's an existing profile that matches
      const matchingProfile = findMatchingProfile(extractedFirstName, extractedLastName, allProfiles);
      
      if (matchingProfile) {
        // Found existing profile, move document to that profile
        try {
          const oldDocRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
          const docData = await getDoc(oldDocRef);
          
          if (docData.exists()) {
            // Create the document in the new profile location
            const newDocRef = firestoreDoc(db, `users/${userId}/profiles/${matchingProfile.id}/documents`, docRefId);
            await setDoc(newDocRef, { 
              ...data,
              status: 'completed',
            });
            
            // Delete the document from the original location
            await deleteDoc(oldDocRef);
            console.log('Successfully moved document from profile', profileId, 'to profile', matchingProfile.id);
            
            // Trigger timeline regeneration for both profiles
            console.log('Triggering timeline regeneration after document move');
            triggerTimelineRegeneration(userId, profileId, 'document_upload').catch((error: any) => {
              console.warn('Timeline regeneration failed for source profile:', profileId, error);
            });
            triggerTimelineRegeneration(userId, matchingProfile.id, 'document_upload').catch((error: any) => {
              console.warn('Timeline regeneration failed for destination profile:', matchingProfile.id, error);
            });
          }
          
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
  docRefId: string,
): Promise<Record<string, any>> => {
  const fields = documentSchemas[selectedDocumentType].fields.filter((f) => f.editable);
  
  try {
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
    const snap = await getDoc(docRef);
    const data = snap.data() as DocumentMetaDataAPIModel;
    
    // Update the document with the selected document type
    await updateDoc(docRef, { 
      'extracted.document_type': selectedDocumentType, 
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
