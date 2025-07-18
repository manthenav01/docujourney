/**
 * SERVER-SIDE ONLY TIMELINE TRIGGERS
 * 
 * This module uses Firebase Admin SDK and should ONLY be used in:
 * - API routes (/app/api/*)
 * - Server-side functions
 * - Backend services
 * 
 * For client-side components, use timelineClientTriggers.ts instead
 */

import { adminDb } from './firebaseAdmin';
import { generateTimelineWithLLM } from './timelineGeneration';
import { fetchAndGroupDocuments } from './documentActions';

/**
 * Trigger timeline regeneration when documents are uploaded or updated
 */
export async function triggerTimelineRegeneration(
  userId: string,
  profileId: string,
  reason: 'document_upload' | 'document_verification' | 'profile_update' | 'manual',
) {
  console.log(`=== TIMELINE TRIGGER ===`);
  console.log(`User: ${userId}, Profile: ${profileId}, Reason: ${reason}`);

  try {
    // Get user's profile
    const profileDoc = await adminDb
      .collection('users')
      .doc(userId)
      .collection('profiles')
      .doc(profileId)
      .get();

    if (!profileDoc.exists) {
      console.error('Profile not found for timeline regeneration');
      return;
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

    // Get user's documents
    const { documentGroups } = await fetchAndGroupDocuments(userId, profileId);
    const allDocuments = documentGroups.flatMap(group => group.docs);

    // Only regenerate if there are documents or this is a manual request
    if (allDocuments.length === 0 && reason !== 'manual') {
      console.log('No documents found, skipping timeline regeneration');
      return;
    }

    // Check if we should auto-regenerate based on the reason
    const shouldAutoRegenerate = reason === 'document_verification' || reason === 'manual';

    // Generate timeline
    await generateTimelineWithLLM({
      userId,
      profileId,
      profile,
      documents: allDocuments,
      forceRegenerate: shouldAutoRegenerate,
    });

    console.log(`Timeline regeneration completed for reason: ${reason}`);
  } catch (error) {
    console.error('Error triggering timeline regeneration:', error);
  }
}

/**
 * Check if timeline needs regeneration based on recent changes
 */
export async function checkTimelineHealthAndRegenerate(userId: string, profileId: string) {
  try {
    // Get last timeline generation date
    const timelineSnapshot = await adminDb
      .collection(`users/${userId}/timeline`)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const lastTimelineDate = timelineSnapshot.docs[0]?.data()?.createdAt?.toDate();
    
    if (!lastTimelineDate) {
      // No timeline exists, trigger generation
      await triggerTimelineRegeneration(userId, profileId, 'manual');
      return;
    }

    // Check for recent document updates
    const recentDocuments = await adminDb
      .collection(`users/${userId}/profiles/${profileId}/documents`)
      .where('updatedAt', '>', lastTimelineDate)
      .get();

    if (recentDocuments.size > 0) {
      console.log(`Found ${recentDocuments.size} documents updated since last timeline generation`);
      await triggerTimelineRegeneration(userId, profileId, 'document_upload');
    }

    // Check for profile updates
    const profileDoc = await adminDb
      .collection(`users/${userId}/profiles`)
      .doc(profileId)
      .get();

    const profileUpdateDate = profileDoc.data()?.updatedAt?.toDate();
    if (profileUpdateDate && profileUpdateDate > lastTimelineDate) {
      console.log('Profile updated since last timeline generation');
      await triggerTimelineRegeneration(userId, profileId, 'profile_update');
    }

  } catch (error) {
    console.error('Error checking timeline health:', error);
  }
}

/**
 * Schedule timeline updates for all users (could be run as a cron job)
 */
export async function scheduleTimelineUpdates() {
  try {
    console.log('=== SCHEDULED TIMELINE UPDATES ===');
    
    // Get all users with profiles
    const usersSnapshot = await adminDb.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get user's profiles
      const profilesSnapshot = await adminDb
        .collection(`users/${userId}/profiles`)
        .get();
      
      for (const profileDoc of profilesSnapshot.docs) {
        const profileId = profileDoc.id;
        
        // Check timeline health for each profile
        await checkTimelineHealthAndRegenerate(userId, profileId);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Scheduled timeline updates completed');
  } catch (error) {
    console.error('Error in scheduled timeline updates:', error);
  }
}
