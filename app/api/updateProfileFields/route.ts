import { NextRequest, NextResponse } from 'next/server';
import { updateProfile } from '@/lib/profileApi';
import { adminDb } from '@/lib/firebaseAdmin';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, profileId, updates } = await request.json();
    
    console.log('updateProfileFields - Received request:', { userId, profileId, updates });
    
    if (!userId || !profileId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, profileId, updates' },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated through this endpoint
    const allowedFields = ['dateOfBirth', 'countryOfCitizen'];
    const filteredUpdates: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined && value !== null) {
        // Handle date conversion for dateOfBirth
        if (key === 'dateOfBirth') {
          try {
            let dateValue = null;
            
            if (typeof value === 'string') {
              // Parse ISO string to Date
              const parsedDate = new Date(value);
              if (!isNaN(parsedDate.getTime())) {
                dateValue = parsedDate;
              }
            } else if (value instanceof Date) {
              dateValue = value;
            } else if (typeof value === 'object' && value !== null) {
              // Handle Firebase Timestamp object (serialized with seconds and nanoseconds)
              const timestampObj = value as any;
              if (timestampObj.seconds !== undefined) {
                // This is a serialized Firebase Timestamp
                dateValue = new Date(timestampObj.seconds * 1000 + (timestampObj.nanoseconds || 0) / 1000000);
              } else if (timestampObj.toDate && typeof timestampObj.toDate === 'function') {
                // Handle Firebase Timestamp object with toDate method
                dateValue = timestampObj.toDate();
              }
            }
            
            if (dateValue) {
              filteredUpdates[key] = dateValue;
            } else {
              console.warn('Could not convert dateOfBirth value:', value);
            }
          } catch (dateError) {
            console.error('Error converting date:', dateError);
            // Skip this field if conversion fails
          }
        } else {
          filteredUpdates[key] = value;
        }
      }
    }

    console.log('updateProfileFields - Filtered updates:', filteredUpdates);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await updateProfile(userId, profileId, filteredUpdates);

    console.log('updateProfileFields - Successfully updated profile');

    return NextResponse.json({ 
      success: true, 
      updatedFields: Object.keys(filteredUpdates) 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile fields:', error);
    return NextResponse.json(
      { error: 'Failed to update profile fields', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
