import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 },
      );
    }

    // Get user information from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    
    return NextResponse.json({
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      providerData: userRecord.providerData,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 },
    );
  }
}
