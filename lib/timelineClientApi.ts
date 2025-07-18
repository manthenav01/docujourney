'use client';

import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { TimelineEvent } from './types/timeline.model';

/**
 * Client-side timeline API for React components
 * Uses regular Firebase SDK instead of Admin SDK
 */

/**
 * Fetch timeline events from Firebase (client-side)
 */
export async function fetchTimelineEvents(userId: string, profileId: string): Promise<TimelineEvent[]> {
  try {
    const timelineQuery = query(
      collection(db, `users/${userId}/profiles/${profileId}/timeline`),
      orderBy('date', 'asc'),
    );
    
    const snapshot = await getDocs(timelineQuery);
    
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
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    throw new Error('Failed to fetch timeline events');
  }
}

/**
 * Get timeline events by status (client-side)
 */
export async function getTimelineEventsByStatus(
  userId: string, 
  profileId: string,
  status: 'completed' | 'current' | 'upcoming',
): Promise<TimelineEvent[]> {
  try {
    const timelineQuery = query(
      collection(db, `users/${userId}/profiles/${profileId}/timeline`),
      where('status', '==', status),
      orderBy('date', 'asc'),
    );
    
    const snapshot = await getDocs(timelineQuery);
    
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
  } catch (error) {
    console.error('Error fetching timeline events by status:', error);
    throw new Error('Failed to fetch timeline events by status');
  }
}

/**
 * Get timeline statistics (client-side)
 */
export async function getTimelineStatistics(userId: string, profileId: string): Promise<{
  total: number;
  completed: number;
  current: number;
  upcoming: number;
  progressPercentage: number;
}> {
  try {
    const events = await fetchTimelineEvents(userId, profileId);
    
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
  } catch (error) {
    console.error('Error calculating timeline statistics:', error);
    return {
      total: 0,
      completed: 0,
      current: 0,
      upcoming: 0,
      progressPercentage: 0,
    };
  }
}

/**
 * Subscribe to timeline changes (real-time updates)
 */
export function subscribeToTimelineEvents(
  userId: string,
  profileId: string,
  callback: (events: TimelineEvent[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const timelineQuery = query(
    collection(db, `users/${userId}/profiles/${profileId}/timeline`),
    orderBy('date', 'asc'),
  );
  
  return onSnapshot(
    timelineQuery,
    (snapshot) => {
      try {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            date: data.date?.toDate?.()?.toISOString() || data.date,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as TimelineEvent;
        });
        
        callback(events);
      } catch (error) {
        console.error('Error processing timeline snapshot:', error);
        if (onError) {
          onError(new Error('Failed to process timeline updates'));
        }
      }
    },
    (error) => {
      console.error('Error in timeline subscription:', error);
      if (onError) {
        onError(new Error('Failed to subscribe to timeline updates'));
      }
    },
  );
}

/**
 * Get a single timeline event (client-side)
 */
export async function getTimelineEvent(userId: string, profileId: string, eventId: string): Promise<TimelineEvent | null> {
  try {
    const eventDoc = await getDoc(doc(db, `users/${userId}/profiles/${profileId}/timeline`, eventId));
    
    if (!eventDoc.exists()) {
      return null;
    }
    
    const data = eventDoc.data();
    return {
      ...data,
      id: eventDoc.id,
      date: data.date?.toDate?.()?.toISOString() || data.date,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as TimelineEvent;
  } catch (error) {
    console.error('Error fetching timeline event:', error);
    throw new Error('Failed to fetch timeline event');
  }
}
