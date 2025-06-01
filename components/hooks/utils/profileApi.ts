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
