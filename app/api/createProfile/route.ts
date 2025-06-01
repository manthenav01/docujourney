import { NextRequest, NextResponse } from 'next/server';
import { createProfile, fetchProfiles } from '@/lib/profileApi';

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, lastName, email, relationship } = await request.json();
    
    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, firstName, lastName' },
        { status: 400 }
      );
    }

    // Check if a profile with the same name already exists
    const existingProfiles = await fetchProfiles(userId);
    const normalizedFirstName = firstName.trim().toLowerCase();
    const normalizedLastName = lastName.trim().toLowerCase();
    
    const duplicateProfile = existingProfiles.find(profile => 
      profile.firstName.trim().toLowerCase() === normalizedFirstName &&
      profile.lastName.trim().toLowerCase() === normalizedLastName
    );

    if (duplicateProfile) {
      return NextResponse.json(
        { 
          error: 'A profile with this name already exists',
          existingProfileId: duplicateProfile.id 
        },
        { status: 409 } // Conflict status code
      );
    }

    const profileId = await createProfile(userId, {
      firstName,
      lastName,
      email: email || '',
      relationship: relationship || undefined,
    });

    return NextResponse.json({ profileId }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
