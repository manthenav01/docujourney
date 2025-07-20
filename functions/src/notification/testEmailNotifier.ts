import { onRequest } from 'firebase-functions/v2/https';
import { logger, setGlobalOptions } from 'firebase-functions/v2';
import { sendDocumentExpiryNotifications } from './scheduledEmailNotifier';

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

export const testEmailNotifier = onRequest(
    {
        cors: true,
        region: 'us-central1',
        secrets: ['GOOGLE_GENAI_API_KEY'],
    },
    async (req, res) => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        try {
            logger.info('Test email function triggered');
            logger.info('Request body:', req.body);
            
            // Get userId from request body
            const { userId } = req.body;
            
            logger.info('Extracted userId:', userId);
            logger.info('UserId type:', typeof userId);
            
            if (!userId) {
                res.status(400).json({ error: 'userId is required' });
                return;
            }

            // Call the email notification function for the specific user
            await sendDocumentExpiryNotifications(userId);

            logger.info(`Test email sent successfully for user: ${userId}`);
            res.status(200).json({ 
                success: true, 
                message: 'Test email sent successfully!', 
            });
        } catch (error) {
            logger.error('Error sending test email:', error);
            res.status(500).json({
                error: 'Failed to send test email',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
);
