import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { Resend } from "resend";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { analyzeVisaStatus, prepareDocumentsForAnalysis, VisaStatusResponse } from "../utils/genkit";

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: "us-central1",
});

async function getResendApiKey(): Promise<string> {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
        name: 'projects/doctracker-b4528/secrets/RESEND_API_KEY/versions/latest',
    });
    return version.payload?.data?.toString() || '';
}


// Extract the email notification logic into a reusable function
export async function sendDocumentExpiryNotifications(userId?: string): Promise<void> {
    logger.info("Sending document expiry notifications");
    const db = getFirestore();
    const apiKey = await getResendApiKey();
    const resend = new Resend(apiKey);

    // Get users (either specific user or all users)
    let usersSnap;
    if (userId) {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            logger.warn(`User ${userId} not found`);
            return;
        }
        usersSnap = { docs: [userDoc] };
    } else {
        usersSnap = await db.collection("users").get();
    }

    for (const userDoc of usersSnap.docs) {
        const currentUserId = userDoc.id;
        const userData = userDoc.data();
        if (!userData) continue;
        
        const userEmail = userData.email;
        const userName = userData.firstName || userData.lastName || "User";

        const profilesSnap = await db.collection(`users/${currentUserId}/profiles`).get();

        // Send email for all users (AI will determine if action is needed per profile)
        if (userEmail) {
            const profileAnalyses: Array<{
                profileId: string;
                profileName: string;
                analysis: VisaStatusResponse;
            }> = [];
            
            // Analyze each profile separately
            for (const profileDoc of profilesSnap.docs) {
                const profileId = profileDoc.id;
                const profileData = profileDoc.data();
                const profileName = profileData?.lastName || `Profile ${profileId}`;
                
                try {
                    // Get documents for this specific profile (check all statuses for debugging)
                    const allDocsSnap = await db.collection(`users/${currentUserId}/profiles/${profileId}/documents`).get();
                    logger.info(`Total documents in profile ${profileId}: ${allDocsSnap.docs.length}`);
                    
                    // Log all document statuses for debugging
                    allDocsSnap.docs.forEach(doc => {
                        const docData = doc.data();
                        logger.info(`Document ${doc.id} status: ${docData?.status}, hasExtracted: ${!!docData?.extracted}`);
                    });
                    
                    // Get documents for this specific profile (only completed/verified)
                    const docsSnap = await db.collection(`users/${currentUserId}/profiles/${profileId}/documents`)
                        .where("status", "in", ["completed", "verified", "pending", "processed"])
                        .get();
                    
                    logger.info(`Found ${docsSnap.docs.length} completed/verified documents for profile ${profileId}`);
                    
                    const profileDocs: any[] = [];
                    for (const doc of docsSnap.docs) {
                        const docData = doc.data();
                        logger.info(`Document ${doc.id} data:`, {
                            status: docData?.status,
                            hasExtracted: !!docData?.extracted,
                            documentType: docData?.extracted?.document_type,
                            validTo: docData?.extracted?.valid_to,
                            validFrom: docData?.extracted?.valid_from
                        });
                        if (docData && docData.extracted) {
                            profileDocs.push(docData);
                        }
                    }
                    
                    logger.info(`Profile ${profileId} has ${profileDocs.length} documents with extracted data`);
                    
                    if (profileDocs.length === 0) {
                        logger.info(`No documents found for profile ${profileId}, skipping analysis`);
                        continue;
                    }
                    
                    // Prepare documents for analysis
                    const documentsForAnalysis = prepareDocumentsForAnalysis(profileDocs);
                    logger.info(`Prepared ${documentsForAnalysis.length} documents for analysis:`, documentsForAnalysis);
                    
                    // Always run fresh analysis (skipping cache for debugging)
                    logger.info(`Running fresh analysis for profile ${profileId} with documents:`, documentsForAnalysis);
                    const visaAnalysis: VisaStatusResponse = await analyzeVisaStatus({
                        documents: documentsForAnalysis,
                        currentDate: new Date().toISOString()
                    });
                    
                    logger.info(`Fresh visa analysis result for profile ${profileId}:`, {
                        status: visaAnalysis.currentStatus,
                        visaType: visaAnalysis.visaType,
                        confidence: visaAnalysis.confidence,
                        expirationWarnings: visaAnalysis.expirationWarnings,
                        nextActions: visaAnalysis.nextActions,
                        statusDetails: visaAnalysis.statusDetails
                    });
                    
                    // Still cache the result for future reference (optional)
                    try {
                        const profileDocRef = db.collection(`users/${currentUserId}/profiles`).doc(profileId);
                        const documentHash = Buffer.from(JSON.stringify(documentsForAnalysis)).toString('base64');
                        
                        await profileDocRef.update({
                            lastVisaAnalysis: {
                                result: visaAnalysis,
                                documentHash: documentHash,
                                analyzedAt: new Date()
                            }
                        });
                        
                        logger.info(`Analysis cached for profile ${profileId}`);
                    } catch (cacheError) {
                        logger.warn(`Failed to cache analysis for profile ${profileId}:`, cacheError);
                    }
                    
                    profileAnalyses.push({
                        profileId,
                        profileName,
                        analysis: visaAnalysis
                    });
                    
                } catch (error) {
                    logger.error(`Error analyzing visa status for profile ${profileId}:`, error);
                    // Continue with other profiles
                    continue;
                }
            }
            
            // Skip email if no profiles were analyzed
            if (profileAnalyses.length === 0) {
                logger.info(`No profiles analyzed for user ${currentUserId}, skipping email`);
                continue;
            }
            
            // Generate email content based on per-profile AI analysis
            let html = `<p>Dear ${userName},</p>`;
            html += `<p>Here's your immigration status summary across all your profiles:</p>`;
            
            // Add profile-specific visa status summaries
            for (const profileAnalysis of profileAnalyses) {
                const { profileName, analysis } = profileAnalysis;
                
                html += `<div style="border: 2px solid #e0e0e0; margin: 20px 0; padding: 20px; border-radius: 8px;">`;
                html += `<h3 style="margin: 0 0 15px 0; color: #333;">👤 ${profileName}</h3>`;
                
                // Add visa status summary for this profile
                html += `<div style="background-color: ${analysis.currentStatus === 'In Status' ? '#d4edda' : '#f8d7da'}; padding: 15px; border-radius: 5px; margin: 15px 0;">`;
                html += `<h4 style="margin: 0; color: ${analysis.currentStatus === 'In Status' ? '#155724' : '#721c24'};">`;
                html += `📋 Immigration Status: ${analysis.currentStatus}</h4>`;
                html += `<p style="margin: 5px 0; font-weight: bold;">Visa Type: ${analysis.visaType}</p>`;
                html += `<p style="margin: 5px 0;">${analysis.statusDetails}</p>`;
                html += `</div>`;
                
                // Add AI-generated recommendations if available
                if (analysis.nextActions && analysis.nextActions.length > 0) {
                    html += `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">`;
                    html += `<h5 style="margin: 0 0 10px 0; color: #856404;">🤖 AI Recommendations:</h5>`;
                    html += `<ul style="margin: 0; padding-left: 20px;">`;
                    analysis.nextActions.forEach(action => {
                        html += `<li style="margin: 5px 0;">${action}</li>`;
                    });
                    html += `</ul></div>`;
                }
                
                // Add expiration warnings if available
                if (analysis.expirationWarnings && analysis.expirationWarnings.length > 0) {
                    html += `<div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">`;
                    html += `<h5 style="margin: 0 0 10px 0; color: #721c24;">⚠️ Important Warnings:</h5>`;
                    html += `<ul style="margin: 0; padding-left: 20px;">`;
                    analysis.expirationWarnings.forEach(warning => {
                        html += `<li style="margin: 5px 0;">${warning}</li>`;
                    });
                    html += `</ul></div>`;
                }
                
                // Add confidence indicator if low
                if (analysis.confidence < 0.7) {
                    html += `<div style="background-color: #e7f3ff; padding: 10px; border-radius: 5px; margin: 15px 0;">`;
                    html += `<p style="margin: 0; color: #0056b3; font-size: 14px;">`;
                    html += `<strong>Note:</strong> This analysis has moderate confidence (${Math.round(analysis.confidence * 100)}%). `;
                    html += `Please review your documents carefully.`;
                    html += `</p></div>`;
                }
                
                html += `</div>`; // Close profile container
            }
            
            // Add footer
            html += `<p style="margin-top: 20px;">`;
            html += `This analysis is based on your uploaded documents and current immigration law. `;
            html += `For important immigration decisions, please consult with a qualified immigration attorney.`;
            html += `</p>`;
            html += `<p><em>Best regards,<br>DocuJourney AI Team</em></p>`;

            // Determine if this is an urgent notification based on any profile having issues
            const hasUrgentIssues = profileAnalyses.some(pa => 
                pa.analysis.currentStatus === 'Out of Status' || 
                (pa.analysis.expirationWarnings && pa.analysis.expirationWarnings.length > 0)
            );
            
            // Create subject line that includes all profile statuses
            const statusSummary = profileAnalyses.map(pa => pa.analysis.currentStatus).join(', ');
            const subject = `Immigration Status Update - ${statusSummary}${hasUrgentIssues ? ' ⚠️ URGENT' : ''}`;

            await resend.emails.send({
                from: "DocuJourney AI <onboarding@resend.dev>",
                to: userEmail,
                subject,
                html,
            });

            // Update user document to track notification
            await db.collection('users').doc(currentUserId).update({
                lastEmailNotification: new Date(),
                lastNotificationProfiles: profileAnalyses.map(pa => ({
                    profileId: pa.profileId,
                    profileName: pa.profileName,
                    status: pa.analysis.currentStatus,
                    visaType: pa.analysis.visaType
                }))
            });

            logger.info(`AI-powered email sent to ${userEmail}:`, {
                profileCount: profileAnalyses.length,
                profileSummary: profileAnalyses.map(pa => ({
                    profileId: pa.profileId,
                    status: pa.analysis.currentStatus,
                    visaType: pa.analysis.visaType,
                    confidence: pa.analysis.confidence
                })),
                hasUrgentIssues
            });
        } else {
            logger.warn(`No email address found for user ${currentUserId}`);
        }
    }
}

export const scheduledEmailNotifier = onSchedule(
    {
        schedule: "0 18 * * 1,3,5", // 6PM UTC on Monday, Wednesday, Friday
        timeZone: "America/Los_Angeles", // Change to your preferred timezone
        region: "us-central1",
        secrets: ["GOOGLE_GENAI_API_KEY"]
    },
    async (event) => {
        logger.info("AI-powered scheduled email notifier triggered");
        await sendDocumentExpiryNotifications();
    }
);