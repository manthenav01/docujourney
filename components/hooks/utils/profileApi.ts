import { Profile } from '@/lib/types/profile.model';
import { db } from '@/lib/firebase';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';

/**
 * Create a new profile via API
 */
export const createNewProfile = async (
  userId: string, 
  firstName: string, 
  lastName: string, 
  relationship: string, 
  email?: string
): Promise<string> => {
  try {
    const response = await fetch('/api/createProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        firstName,
        lastName,
        email: email || '',
        relationship
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Handle case where profile already exists
      if (response.status === 409 && errorData.existingProfileId) {
        console.log('Profile already exists, using existing profile:', errorData.existingProfileId);
        return errorData.existingProfileId;
      }
      
      console.error('Failed to create profile:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to create profile: ${errorData.error || response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Profile created successfully:', responseData);
    const { profileId } = responseData;
    return profileId;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

/**
 * Fetch a profile by ID from Firestore
 */
export const fetchProfileById = async (userId: string, profileId: string): Promise<Profile | null> => {
  try {
    const profileRef = firestoreDoc(db, `users/${userId}/profiles`, profileId);
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      console.warn('Profile not found:', profileId);
      return null;
    }
    
    const data = profileDoc.data();
    
    // Handle lastVisaStatusAnalysis conversion
    let lastVisaStatusAnalysis = null;
    if (data.lastVisaStatusAnalysis) {
      lastVisaStatusAnalysis = {
        ...data.lastVisaStatusAnalysis,
        analyzedAt: data.lastVisaStatusAnalysis.analyzedAt?.toDate?.()?.toISOString() || 
                   (typeof data.lastVisaStatusAnalysis.analyzedAt === 'string' ? data.lastVisaStatusAnalysis.analyzedAt : null)
      };
    }
    
    return {
      id: profileDoc.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || '',
      phone: data.phone || '',
      dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString() || 
                  (typeof data.dateOfBirth === 'string' ? data.dateOfBirth : null),
      firstEntryDate: data.firstEntryDate?.toDate?.()?.toISOString() || 
                     (typeof data.firstEntryDate === 'string' ? data.firstEntryDate : null),
      firstEntryVisaType: data.firstEntryVisaType || null,
      countryOfCitizen: data.countryOfCitizen || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      admin: data.admin || false,
      isAdmin: data.admin || false,
      relationship: data.relationship || '',
      currentlyEmployed: data.currentlyEmployed || false,
      lastVisaStatusAnalysis
    } as Profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};
