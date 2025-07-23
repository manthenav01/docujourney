'use client';

/**
 * Client-side timeline trigger functions
 * These functions call API endpoints instead of directly using Firebase Admin SDK
 */

/**
 * Trigger timeline regeneration via API endpoint (client-side)
 */
export async function triggerTimelineRegeneration(
  userId: string,
  profileId: string,
  reason: 'document_upload' | 'document_verification' | 'profile_update' | 'manual',
): Promise<void> {
  try {
    // Get the current user's auth token
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    // Call the API endpoint to trigger timeline regeneration
    const response = await fetch('/api/generateTimeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        profileId,
        reason,
        forceRegenerate: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Timeline regeneration failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Timeline regeneration triggered for user ${userId}, profile ${profileId}, reason: ${reason}`);
    console.log(`Generated ${result.events?.length || 0} timeline events`);
  } catch (error) {
    console.error('Error triggering timeline regeneration:', error);
    throw error;
  }
}

/**
 * Check timeline health and trigger regeneration if needed (client-side)
 */
export async function checkTimelineHealthAndRegenerate(
  userId: string,
  profileId: string,
): Promise<void> {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await fetch('/api/updateTimeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        profileId,
        action: 'health_check',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Timeline health check failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Timeline health check completed for user ${userId}, profile ${profileId}`);
  } catch (error) {
    console.error('Error checking timeline health:', error);
    throw error;
  }
}
