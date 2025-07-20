import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger, setGlobalOptions } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { analyzeVisaStatus, prepareDocumentsForAnalysis, VisaStatusResponse } from '../utils/genkit';

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
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
    logger.info('Sending document expiry notifications');
    const db = getFirestore();
    const apiKey = await getResendApiKey();
    const resend = new Resend(apiKey);

    // Get users (either specific user or all users)
    let usersSnap;
    if (userId) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            logger.warn(`User ${userId} not found`);
            return;
        }
        usersSnap = { docs: [userDoc] };
    } else {
        usersSnap = await db.collection('users').get();
    }

    for (const userDoc of usersSnap.docs) {
        const currentUserId = userDoc.id;
        const userData = userDoc.data();
        if (!userData) {continue;}
        
        const userEmail = userData.email;
        const userName = userData.firstName || userData.lastName || 'User';

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
                        .where('status', 'in', ['completed', 'verified', 'pending', 'processed'])
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
                            validFrom: docData?.extracted?.valid_from,
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
                        currentDate: new Date().toISOString(),
                        profileContext: {
                            firstEntryDate: profileData?.firstEntryDate,
                            firstEntryVisaType: profileData?.firstEntryVisaType,
                            currentlyEmployed: profileData?.currentlyEmployed,
                        },
                    });
                    
                    logger.info(`Fresh visa analysis result for profile ${profileId}:`, {
                        status: visaAnalysis.currentStatus,
                        visaType: visaAnalysis.visaType,
                        confidence: visaAnalysis.confidence,
                        expirationWarnings: visaAnalysis.expirationWarnings,
                        nextActions: visaAnalysis.nextActions,
                        statusDetails: visaAnalysis.statusDetails,
                    });
                    
                    // Still cache the result for future reference (optional)
                    try {
                        const profileDocRef = db.collection(`users/${currentUserId}/profiles`).doc(profileId);
                        const documentHash = Buffer.from(JSON.stringify(documentsForAnalysis)).toString('base64');
                        
                        await profileDocRef.update({
                            lastVisaAnalysis: {
                                result: visaAnalysis,
                                documentHash: documentHash,
                                analyzedAt: new Date(),
                            },
                        });
                        
                        logger.info(`Analysis cached for profile ${profileId}`);
                    } catch (cacheError) {
                        logger.warn(`Failed to cache analysis for profile ${profileId}:`, cacheError);
                    }
                    
                    profileAnalyses.push({
                        profileId,
                        profileName,
                        analysis: visaAnalysis,
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
            
            // Generate modern, minimalist email template
            const html = `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <title>DocuJourney Weekly Immigration Update</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: #f9fafb;
                    padding: 40px 20px;
                    margin: 0;
                    line-height: 1.6;
                    color: #374151;
                  }
                  .container {
                    background-color: #ffffff;
                    max-width: 600px;
                    margin: auto;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                  }
                  h1 {
                    font-size: 28px;
                    color: #111827;
                    margin-bottom: 30px;
                    text-align: center;
                    font-weight: 600;
                  }
                  .profile-section {
                    margin-bottom: 32px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #ffffff;
                  }
                  .profile-header {
                    background: #111827;
                    color: white;
                    padding: 20px 24px;
                    font-weight: 600;
                    font-size: 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  }
                  .status-card {
                    padding: 24px;
                    margin: 0;
                    border-bottom: 1px solid #f3f4f6;
                  }
                  .status-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #111827;
                  }
                  .visa-type {
                    font-size: 15px;
                    color: #6b7280;
                    margin: 8px 0;
                  }
                  .status-details {
                    font-size: 15px;
                    color: #4b5563;
                    margin-top: 12px;
                    line-height: 1.5;
                  }
                  .warnings-section {
                    padding: 20px 24px;
                    margin: 0;
                    border-bottom: 1px solid #f3f4f6;
                    background-color: #fef3f2;
                  }
                  .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    color: #111827;
                  }
                  .warning-item {
                    font-size: 14px;
                    margin: 8px 0;
                    padding-left: 20px;
                    position: relative;
                    color: #374151;
                  }
                  .warning-item:before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #ef4444;
                    font-weight: bold;
                  }
                  .confidence-note {
                    background-color: #f9fafb;
                    padding: 16px 24px;
                    margin: 0;
                    font-size: 13px;
                    color: #6b7280;
                    border-top: 1px solid #f3f4f6;
                  }
                  .button {
                    display: inline-block;
                    background: #111827;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin: 32px auto;
                    display: block;
                    text-align: center;
                    max-width: 280px;
                    font-size: 16px;
                  }
                  .footer {
                    font-size: 14px;
                    color: #6b7280;
                    margin-top: 40px;
                    line-height: 1.6;
                    text-align: center;
                    padding-top: 24px;
                    border-top: 1px solid #e5e7eb;
                  }
                  .signature {
                    margin-top: 16px;
                    font-weight: 600;
                    color: #374151;
                  }
                  .summary-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    background: #f3f4f6;
                    color: #374151;
                  }
                  .badge-good { background: #dcfce7; color: #166534; }
                  .badge-warning { background: #fef3c7; color: #92400e; }
                  .badge-urgent { background: #fecaca; color: #991b1b; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>📋 Weekly Immigration Update</h1>
                  
                  <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">Hi ${userName},</p>
                  
                  ${profileAnalyses.map(profileAnalysis => {
                    const { profileName, analysis } = profileAnalysis;
                    const isInStatus = analysis.currentStatus === 'In Status';
                    const hasWarnings = analysis.expirationWarnings && analysis.expirationWarnings.length > 0;
                    
                    let statusBadge;
                    if (!isInStatus) {
                      statusBadge = '<span class="summary-badge badge-urgent">Urgent</span>';
                    } else if (hasWarnings) {
                      statusBadge = '<span class="summary-badge badge-warning">Action Needed</span>';
                    } else {
                      statusBadge = '<span class="summary-badge badge-good">All Good</span>';
                    }
                    
                    return `
                    <div class="profile-section">
                      <div class="profile-header">
                        <span>${profileName}</span>
                        ${statusBadge}
                      </div>
                      
                      <div class="status-card">
                        <div class="status-title">Immigration Status</div>
                        <div class="visa-type">${analysis.visaType}</div>
                        <div class="status-details">
                          <strong>Current Status:</strong> ${analysis.currentStatus}<br>
                          ${analysis.statusDetails}
                        </div>
                      </div>
                      
                      ${hasWarnings ? `
                      <div class="warnings-section">
                        <div class="section-title">⚠️ Important Alerts</div>
                        ${analysis.expirationWarnings.map(warning => 
                          `<div class="warning-item">${warning}</div>`,
                        ).join('')}
                      </div>
                      ` : ''}
                      
                      ${analysis.confidence < 0.7 ? `
                      <div class="confidence-note">
                        <strong>Note:</strong> This analysis has moderate confidence (${Math.round(analysis.confidence * 100)}%). 
                        Please review your documents and consider consulting an immigration attorney.
                      </div>
                      ` : ''}
                    </div>
                    `;
                  }).join('')}
                  
                  <a href="${process.env.FRONTEND_URL || 'https://docujourney.app'}/dashboard" class="button">
                    View Dashboard
                  </a>
                  
                  <div class="footer">
                    <p>We're here to help make immigration less overwhelming.</p>
                    <div class="signature">Team DocuJourney</div>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 16px; line-height: 1.4;">
                      This analysis is based on your uploaded documents. For important immigration decisions, 
                      please consult with a qualified immigration attorney.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            `;

            // Determine email urgency and create user-friendly subject
            const hasUrgentIssues = profileAnalyses.some(pa => 
                pa.analysis.currentStatus === 'Out of Status',
            );
            
            const hasWarnings = profileAnalyses.some(pa => 
                pa.analysis.expirationWarnings && pa.analysis.expirationWarnings.length > 0,
            );
            
            // Create a friendly subject line
            let subject;
            if (hasUrgentIssues) {
                subject = `🚨 Urgent Immigration Status Alert - Action Required`;
            } else if (hasWarnings) {
                subject = `⚠️ DocuJourney Weekly Update - Documents Expiring Soon`;
            } else {
                subject = `✅ DocuJourney Weekly Update - All Status Good`;
            }

            await resend.emails.send({
                from: 'DocuJourney AI <onboarding@resend.dev>',
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
                    visaType: pa.analysis.visaType,
                })),
            });

            logger.info(`AI-powered email sent to ${userEmail}:`, {
                profileCount: profileAnalyses.length,
                profileSummary: profileAnalyses.map(pa => ({
                    profileId: pa.profileId,
                    status: pa.analysis.currentStatus,
                    visaType: pa.analysis.visaType,
                    confidence: pa.analysis.confidence,
                })),
                hasUrgentIssues,
            });
        } else {
            logger.warn(`No email address found for user ${currentUserId}`);
        }
    }
}

export const scheduledEmailNotifier = onSchedule(
    {
        schedule: '0 18 * * 1,3,5', // 6PM UTC on Monday, Wednesday, Friday
        timeZone: 'America/Los_Angeles', // Change to your preferred timezone
        region: 'us-central1',
        secrets: ['GOOGLE_GENAI_API_KEY'],
    },
    async (event) => {
        logger.info('AI-powered scheduled email notifier triggered');
        await sendDocumentExpiryNotifications();
    },
);