import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { updateTimelineEventStatuses } from '@/lib/timelineApi';

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
    const { userId, eventId, updates } = body;

    // Verify user authorization
    if (currentUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`=== UPDATE TIMELINE EVENT ===`);
    console.log(`User: ${userId}, Event: ${eventId}`);

    // Update specific event
    if (eventId && updates) {
      const eventRef = adminDb.collection(`users/${userId}/timeline`).doc(eventId);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      // Convert date strings to Firestore timestamps if present
      if (updates.date) {
        updateData.date = new Date(updates.date);
      }

      await eventRef.update(updateData);
      console.log(`Updated timeline event ${eventId} for user ${userId}`);
    } else {
      // Update all event statuses based on current date
      await updateTimelineEventStatuses(userId);
      console.log(`Updated all timeline event statuses for user ${userId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Timeline update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
