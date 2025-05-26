import { cookies } from 'next/headers';
import DashboardDisplay from '@/components/DashboardDisplay';
import { fetchDocumentSchemas, fetchAndGroupDocuments } from '@/lib/documentActions';
import ProfileSwitcher from '@/components/ProfileSwitcher';

import UploadDocumentDialog from '@/components/UploadDocumentDialog';

import { fetchProfiles } from '@/lib/profileApi';
import { sortDocumentsBySchemaOrder as sortDocumentsBySchemaOrderUtils } from '@/utils/documentUtils';


// Add searchParams as props - Next.js automatically provides this for pages
const DashboardPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;
    // Get profile ID from search params (built into Next.js page props)
    const resolvedSearchParams = await searchParams;
    const profileIdFromUrl = typeof resolvedSearchParams.profileId === 'string' ? resolvedSearchParams.profileId : undefined;
    if (!userId) {
        return (
            <div>
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
            <div>
                <p>No profiles found. Please create a profile to continue.</p>
            </div>
        );
    }

    const activeProfileId = profileIdFromUrl || profiles[0].id;
    const activeProfile = profiles.find(profile => profile.id === activeProfileId);
    let { documentGroups } = await fetchAndGroupDocuments(userId, activeProfileId);
    // Sort each group using the schema order
    documentGroups = documentGroups.map(group => {
        const schema = documentSchemas[group.documentType];
        return {
            ...group,
            docs: schema ? sortDocumentsBySchemaOrderUtils(group.docs, schema) : group.docs
        };
    });
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium"> 🚀 Welcome back, {activeProfile?.firstName}!</h2>
                <div className="flex items-center gap-2">
                    <ProfileSwitcher
                        profiles={profiles}
                        initialProfileId={activeProfileId}
                        userId={userId}
                    />
                    {/* Upload button triggers the upload dialog */}
                    <UploadDocumentDialog
                        userId={userId}
                        profileId={activeProfileId}
                        documentSchemas={documentSchemas}
                    />
                </div>
            </div>
            <DashboardDisplay
                userId={userId}
                initialProfileId={activeProfileId}
                documentGroups={documentGroups}
                documentSchemas={documentSchemas}
            />
        </>
    );
};

export default DashboardPage;