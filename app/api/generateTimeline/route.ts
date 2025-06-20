import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { generateTimelineWithLLM } from '@/lib/timelineGeneration';
import { fetchAndGroupDocuments } from '@/lib/documentActions';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUserId = decodedToken.uid;

    const body = await request.json();
    const { userId, profileId, forceRegenerate = false } = body;

    // Verify user authorization
    if (currentUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`=== GENERATE TIMELINE API ===`);
    console.log(`User: ${userId}, Profile: ${profileId}, Force: ${forceRegenerate}`);

    // Fetch user's profile
    const profileDoc = await adminDb
      .collection('users')
      .doc(userId)
      .collection('profiles')
      .doc(profileId || 'default')
      .get();

    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = {
      id: profileDoc.id,
      ...profileDoc.data(),
      admin: profileDoc.data()?.admin || false,
      isAdmin: profileDoc.data()?.admin || false,
      firstName: profileDoc.data()?.firstName || '',
      lastName: profileDoc.data()?.lastName || '',
      email: profileDoc.data()?.email || '',
      createdAt: profileDoc.data()?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: profileDoc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
      firstEntryDate: profileDoc.data()?.firstEntryDate?.toDate?.()?.toISOString() || null,
    };

    // Fetch user's documents
    const { documentGroups } = await fetchAndGroupDocuments(userId, profileId || 'default');
    const allDocuments = documentGroups.flatMap(group => group.docs);

    console.log(`Found ${allDocuments.length} documents for timeline generation`);

    // Generate timeline using LLM
    const timelineResult = await generateTimelineWithLLM({
      userId,
      profileId,
      profile,
      documents: allDocuments,
      forceRegenerate
    });

    return NextResponse.json({
      success: true,
      ...timelineResult
    });

  } catch (error) {
    console.error('Timeline generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
