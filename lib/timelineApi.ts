/**
 * SERVER-SIDE ONLY TIMELINE API
 * 
 * This module uses Firebase Admin SDK and should ONLY be used in:
 * - API routes (/app/api/*)
 * - Server-side functions
 * - Backend services
 * 
 * For client-side components, use timelineClientApi.ts instead
 */

import { adminDb } from './firebaseAdmin';
import { TimelineEvent } from './types/timeline.model';

/**
 * Save timeline events to Firebase
 */
export async function saveTimelineEvents(userId: string, events: TimelineEvent[]): Promise<void> {
  const batch = adminDb.batch();
  
  for (const event of events) {
    const eventRef = adminDb.collection(`users/${userId}/timeline`).doc(event.id);
    batch.set(eventRef, {
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      date: new Date(event.date),
    });
  }
  
  await batch.commit();
  console.log(`Saved ${events.length} timeline events for user ${userId}`);
}

/**
 * Fetch timeline events from Firebase
 */
export async function fetchTimelineEvents(userId: string): Promise<TimelineEvent[]> {
  const snapshot = await adminDb
    .collection(`users/${userId}/timeline`)
    .orderBy('date', 'asc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate?.()?.toISOString() || data.date,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as TimelineEvent;
  });
}

/**
 * Update a specific timeline event
 */
export async function updateTimelineEvent(userId: string, eventId: string, updates: Partial<TimelineEvent>): Promise<void> {
  const eventRef = adminDb.collection(`users/${userId}/timeline`).doc(eventId);
  
  const updateData: any = {
    ...updates,
    updatedAt: new Date(),
  };
  
  // Convert date strings to Firestore timestamps if present
  if (updates.date) {
    updateData.date = new Date(updates.date);
  }
  
  await eventRef.update(updateData);
  console.log(`Updated timeline event ${eventId} for user ${userId}`);
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(userId: string, eventId: string): Promise<void> {
  const eventRef = adminDb.collection(`users/${userId}/timeline`).doc(eventId);
  await eventRef.delete();
  console.log(`Deleted timeline event ${eventId} for user ${userId}`);
}

/**
 * Delete all timeline events for a user (for regeneration)
 */
export async function clearTimelineEvents(userId: string): Promise<void> {
  const snapshot = await adminDb
    .collection(`users/${userId}/timeline`)
    .get();
  
  const batch = adminDb.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Cleared all timeline events for user ${userId}`);
}

/**
 * Get timeline events by status
 */
export async function getTimelineEventsByStatus(
  userId: string, 
  status: 'completed' | 'current' | 'upcoming',
): Promise<TimelineEvent[]> {
  const snapshot = await adminDb
    .collection(`users/${userId}/timeline`)
    .where('status', '==', status)
    .orderBy('date', 'asc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate?.()?.toISOString() || data.date,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as TimelineEvent;
  });
}

/**
 * Update timeline event status based on current date
 */
export async function updateTimelineEventStatuses(userId: string): Promise<void> {
  const events = await fetchTimelineEvents(userId);
  const currentDate = new Date();
  const batch = adminDb.batch();
  
  let updateCount = 0;
  
  for (const event of events) {
    const eventDate = new Date(event.date);
    const timeDiff = eventDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let newStatus: 'completed' | 'current' | 'upcoming';
    
    if (daysDiff < -7) {
      newStatus = 'completed';
    } else if (daysDiff >= -7 && daysDiff <= 30) {
      newStatus = 'current';
    } else {
      newStatus = 'upcoming';
    }
    
    if (newStatus !== event.status) {
      const eventRef = adminDb.collection(`users/${userId}/timeline`).doc(event.id);
      batch.update(eventRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      updateCount++;
    }
  }
  
  if (updateCount > 0) {
    await batch.commit();
    console.log(`Updated status for ${updateCount} timeline events for user ${userId}`);
  }
}

/**
 * Get timeline statistics
 */
export async function getTimelineStatistics(userId: string): Promise<{
  total: number;
  completed: number;
  current: number;
  upcoming: number;
  progressPercentage: number;
}> {
  const events = await fetchTimelineEvents(userId);
  
  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === 'completed').length,
    current: events.filter(e => e.status === 'current').length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    progressPercentage: 0,
  };
  
  if (stats.total > 0) {
    stats.progressPercentage = Math.round((stats.completed / stats.total) * 100);
  }
  
  return stats;
}
