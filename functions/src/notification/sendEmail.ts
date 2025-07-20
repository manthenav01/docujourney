import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { CreateEmailResponse, Resend } from 'resend';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getResendApiKey(): Promise<string> {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
        name: 'projects/doctracker-b4528/secrets/RESEND_API_KEY/versions/latest',
    });
    return version.payload?.data?.toString() || '';
}


// Define interfaces for the expected data payload and the return payload
interface ProcessRequestData {
    to: string | string[];
    subject: string;
    html: string;
}

interface ProcessUserDataResponseData {
    success: boolean;
    message?: string;
    response: CreateEmailResponse
}

// Callable function to send email using Resend
export const sendEmail = onCall<ProcessRequestData, Promise<ProcessUserDataResponseData>>(async (request: CallableRequest<ProcessRequestData>): Promise<ProcessUserDataResponseData> => {
    if (!request.auth) {
        console.error('Function called by unauthenticated user.');
        // Throw HttpsError - automatically handled by client SDK
        throw new HttpsError(
            'unauthenticated', // Error code
            'The function must be called while authenticated.', // Error message for client
        );
    }
    const callingUid: string = request.auth.uid;
    const data: ProcessRequestData = request.data;
    const { to, subject, html } = data;

    console.log(`Function 'processUserData' called by UID: ${callingUid} with data:`, data);

    if (!to || !subject || !html) {
        throw new HttpsError(
            'invalid-argument',
            'The function must be called with a valid positive integer "age".',
        );
    }
    const apiKey = await getResendApiKey();
    const resend = new Resend(apiKey);
    console.log('Resend API Key:', apiKey);
    try {
        const response = await resend.emails.send({
            from: 'Track Vision  <onboarding@resend.dev>',
            to,
            subject,
            html,
        });
        if (response.error) {
            throw new HttpsError(
                'internal',
                response.error.message,
            );
        }
        return { success: true, response };
    } catch (error: any) {
        if (error instanceof HttpsError) {
            throw error;
        } else {
            throw new HttpsError(
                'internal', // Error code
                'An unexpected error occurred while processing your data.',

            );
        }
    }
},
);
