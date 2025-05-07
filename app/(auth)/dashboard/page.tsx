import { cookies } from 'next/headers';
import DashboardDisplay from '@/components/DashboardDisplay';
import { fetchDocumentSchemas, fetchAndGroupDocuments, sortDocumentsBySchemaOrder } from '@/lib/documentActions';
import ProfileSwitcher from '@/components/ProfileSwitcher';

import { fetchProfiles } from '@/lib/profileApi';


// Add searchParams as props - Next.js automatically provides this for pages
const DashboardPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;
    // Get profile ID from search params (built into Next.js page props)
    const profileIdFromUrl = typeof searchParams.profileId === 'string' ? searchParams.profileId : undefined;
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
            docs: schema ? sortDocumentsBySchemaOrder(group.docs, schema) : group.docs
        };
    });
    console.log("Document Groups:", documentGroups);
    return (
        <>
            <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-medium">Welcome, {activeProfile?.firstName} {activeProfile?.lastName}</h2>
                <ProfileSwitcher
                    profiles={profiles}
                    initialProfileId={activeProfileId}
                    userId={userId}
                />
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