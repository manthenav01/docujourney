import { NextRequest, NextResponse } from 'next/server';
import { createProfile, fetchProfiles, updateProfile } from '@/lib/profileApi';

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, lastName, email, phone, dateOfBirth, firstEntryDate, firstEntryVisaType, countryOfCitizen, relationship, isAdmin, currentlyEmployed } = await request.json();
    
    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, firstName, lastName' },
        { status: 400 },
      );
    }

    // Check if a profile with the same name already exists
    const existingProfiles = await fetchProfiles(userId);
    const normalizedFirstName = firstName.trim().toLowerCase();
    const normalizedLastName = lastName.trim().toLowerCase();
    
    const duplicateProfile = existingProfiles.find(profile => 
      profile.firstName.trim().toLowerCase() === normalizedFirstName &&
      profile.lastName.trim().toLowerCase() === normalizedLastName,
    );

    if (duplicateProfile) {
      return NextResponse.json(
        { 
          error: 'A profile with this name already exists',
          existingProfileId: duplicateProfile.id, 
        },
        { status: 409 }, // Conflict status code
      );
    }

    const profileId = await createProfile(userId, {
      firstName,
      lastName,
      email: email || '',
      phone: phone || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      firstEntryDate: firstEntryDate ? new Date(firstEntryDate) : null,
      firstEntryVisaType: firstEntryVisaType || null,
      countryOfCitizen: countryOfCitizen || null,
      relationship: relationship || undefined,
      isAdmin: isAdmin || false,
      currentlyEmployed: currentlyEmployed || false,
    });

    return NextResponse.json({ profileId }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, userId, firstName, lastName, email, phone, dateOfBirth, firstEntryDate, firstEntryVisaType, countryOfCitizen, relationship, isAdmin, currentlyEmployed } = await request.json();
    
    if (!id || !userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: id, userId, firstName, lastName' },
        { status: 400 },
      );
    }

    // Check if another profile with the same name already exists (excluding current profile)
    const existingProfiles = await fetchProfiles(userId);
    const normalizedFirstName = firstName.trim().toLowerCase();
    const normalizedLastName = lastName.trim().toLowerCase();
    
    const duplicateProfile = existingProfiles.find(profile => 
      profile.id !== id &&
      profile.firstName.trim().toLowerCase() === normalizedFirstName &&
      profile.lastName.trim().toLowerCase() === normalizedLastName,
    );

    if (duplicateProfile) {
      return NextResponse.json(
        { 
          error: 'A profile with this name already exists',
          existingProfileId: duplicateProfile.id, 
        },
        { status: 409 }, // Conflict status code
      );
    }

    await updateProfile(userId, id, {
      firstName,
      lastName,
      email: email || '',
      phone: phone || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      firstEntryDate: firstEntryDate ? new Date(firstEntryDate) : null,
      firstEntryVisaType: firstEntryVisaType || null,
      countryOfCitizen: countryOfCitizen || null,
      relationship: relationship || undefined,
      isAdmin: isAdmin || false,
      currentlyEmployed: currentlyEmployed || false,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
