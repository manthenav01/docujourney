import { Profile } from '@/lib/types/profile.model';
import { Timestamp } from 'firebase/firestore';

/**
 * Update profile with extracted document data if the profile is missing that information
 * Updates dateOfBirth and countryOfCitizen if they're not already set in the profile
 */
export const updateProfileFromDocumentData = async (
  userId: string,
  profileId: string,
  extractedData: Record<string, any>,
  currentProfile: Profile
): Promise<void> => {
  try {
    // Check if profile already has the information we want to update
    const hasDateOfBirth = currentProfile.dateOfBirth && currentProfile.dateOfBirth.trim() !== '';
    const hasCountryOfCitizen = currentProfile.countryOfCitizen && currentProfile.countryOfCitizen.trim() !== '';
    
    // Extract relevant fields from document
    const dateOfBirth = extractedData.date_of_birth;
    const countryOfCitizen = extractedData.country_of_citizen;
    
    console.log('Checking document data for profile update:', {
      hasDateOfBirth,
      hasCountryOfCitizen,
      documentDateOfBirth: dateOfBirth,
      documentCountryOfCitizen: countryOfCitizen
    });
    
    // Prepare update data - only include fields that need updating
    const updateData: Record<string, any> = {};
    
    // Add date of birth if profile doesn't have it and document does
    if (!hasDateOfBirth && dateOfBirth) {
      // Convert date to Firebase Timestamp for proper storage
      let firestoreTimestamp = null;
      
      try {
        if (typeof dateOfBirth === 'string') {
          const parsedDate = new Date(dateOfBirth);
          if (!isNaN(parsedDate.getTime())) {
            firestoreTimestamp = Timestamp.fromDate(parsedDate);
          }
        } else if (dateOfBirth instanceof Date) {
          firestoreTimestamp = Timestamp.fromDate(dateOfBirth);
        } else if (dateOfBirth && typeof dateOfBirth === 'object' && typeof dateOfBirth.toDate === 'function') {
          // Already a Firebase Timestamp
          firestoreTimestamp = dateOfBirth;
        }
        
        if (firestoreTimestamp) {
          updateData.dateOfBirth = firestoreTimestamp;
          console.log('Will update profile dateOfBirth with Firebase Timestamp:', firestoreTimestamp);
        } else {
          console.warn('Could not convert dateOfBirth to Firebase Timestamp:', dateOfBirth);
        }
      } catch (error) {
        console.error('Error converting dateOfBirth to Firebase Timestamp:', error);
      }
    }
    
    // Add country of citizenship if profile doesn't have it and document does
    if (!hasCountryOfCitizen && countryOfCitizen) {
      updateData.countryOfCitizen = countryOfCitizen;
      console.log('Will update profile countryOfCitizen with:', countryOfCitizen);
    }
    
    // Only make API call if there's something to update
    if (Object.keys(updateData).length > 0) {
      console.log('Updating profile with extracted data:', updateData);
      
      const response = await fetch('/api/updateProfileFields', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          profileId: profileId,
          updates: updateData
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Successfully updated profile fields:', result.updatedFields);
    } else {
      console.log('No profile updates needed - profile already has required information');
    }
  } catch (error) {
    console.error('Error updating profile from document data:', error);
    // Don't throw error to avoid breaking the document flow
  }
};
