import { cookies } from 'next/headers';
import { fetchDocumentSchemas } from '@/lib/documentActions';
import { fetchProfiles } from '@/lib/profileApi';
import UploadPageClient from './UploadPageClient';

const UploadPage = async () => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }

    // Fetch profiles and document schemas in parallel
    const [profiles, documentSchemas] = await Promise.all([
        fetchProfiles(userId),
        fetchDocumentSchemas()
    ]);

    if (!profiles.length) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>No profiles found. Please go to the dashboard to create a profile first.</p>
            </div>
        );
    }

    return (
        <UploadPageClient
            userId={userId}
            profiles={profiles}
            documentSchemas={documentSchemas}
        />
    );
};

export default UploadPage;
