import { cookies } from 'next/headers';
import DashboardWithUpload from '@/components/DashboardWithUpload';
import { fetchDocumentSchemas, fetchAndGroupDocuments } from '@/lib/documentActions';

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

    // Prioritize admin profile when no specific profile is requested
    const defaultProfile = profileIdFromUrl 
        ? profiles.find(profile => profile.id === profileIdFromUrl)
        : profiles.find(profile => profile.admin) || profiles[0];
    
    const activeProfileId = defaultProfile?.id || profiles[0].id;
    const activeProfile = profiles.find(profile => profile.id === activeProfileId);
    
    if (!activeProfile) {
        return (
            <div>
                <p>Profile not found.</p>
            </div>
        );
    }
    
    let { documentGroups } = await fetchAndGroupDocuments(userId, activeProfileId, documentSchemas);
    // Sort each group using the schema order
    documentGroups = documentGroups.map(group => {
        const schema = documentSchemas[group.documentType];
        return {
            ...group,
            docs: schema ? sortDocumentsBySchemaOrderUtils(group.docs, schema) : group.docs
        };
    });
    return (
        <DashboardWithUpload
            userId={userId}
            activeProfileId={activeProfileId}
            activeProfile={activeProfile}
            profiles={profiles}
            documentGroups={documentGroups}
            documentSchemas={documentSchemas}
        />
    );
};

export default DashboardPage;