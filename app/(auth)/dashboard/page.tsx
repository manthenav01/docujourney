import { cookies } from 'next/headers';
import { fetchDocumentSchemas } from '@/lib/documentActions';
import { fetchProfiles, createAdminProfileForNewUser } from '@/lib/profileApi';
import { DocumentMetaDataAPIModel, DocumentMetaDataTransformedModel } from '@/lib/types/document.model';
import DashboardPageClient from './DashboardPageClient';

interface DashboardDocument extends DocumentMetaDataTransformedModel {
    profileId: string;
    profileName: string;
    profileRelationship: string;
}

// Function to fetch documents across all profiles
async function fetchAllDocuments(userId: string, profiles: any[]): Promise<DashboardDocument[]> {
    const { adminDb } = await import('@/lib/firebaseAdmin');
    const { transformDocumentMetaData } = await import('@/utils/documentUtils');
    
    try {
        const allDocuments: DashboardDocument[] = [];
        
        for (const profile of profiles) {
            const documentsRef = adminDb.collection(`users/${userId}/profiles/${profile.id}/documents`);
            const querySnapshot = await documentsRef.get();
            
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as Omit<DocumentMetaDataAPIModel, 'id'>;
                const transformedDoc = transformDocumentMetaData({
                    id: doc.id,
                    ...docData,
                } as DocumentMetaDataAPIModel);
                
                allDocuments.push({
                    ...transformedDoc,
                    profileId: profile.id,
                    profileName: `${profile.firstName} ${profile.lastName}`,
                    profileRelationship: profile.relationship || 'self',
                });
            });
        }
        
        // Sort by upload date, most recent first
        return allDocuments.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.uploadedAt || 0).getTime();
            const dateB = new Date(b.createdAt || b.uploadedAt || 0).getTime();
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching all documents:', error);
        return [];
    }
}

const DashboardPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;
    const resolvedSearchParams = await searchParams;
    const profileIdFromUrl = typeof resolvedSearchParams.profileId === 'string' ? resolvedSearchParams.profileId : undefined;
    
    if (!userId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }

    // Fetch profiles and document schemas in parallel
    const [profiles, documentSchemas] = await Promise.all([
        fetchProfiles(userId),
        fetchDocumentSchemas()
    ]);

    // If no profiles exist, create an admin profile for the user
    let finalProfiles = profiles;
    if (!profiles.length) {
        try {
            const adminProfileId = await createAdminProfileForNewUser(userId);
            finalProfiles = await fetchProfiles(userId);
            console.log(`Created admin profile for new user ${userId}: ${adminProfileId}`);
        } catch (error) {
            console.error('Failed to create admin profile for new user:', error);
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p>Failed to create your profile. Please try refreshing the page or contact support.</p>
                </div>
            );
        }
    }

    if (!finalProfiles.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>No profiles found. Please create a profile to continue.</p>
            </div>
        );
    }

    // Prioritize admin profile when no specific profile is requested
    const defaultProfile = profileIdFromUrl 
        ? finalProfiles.find(profile => profile.id === profileIdFromUrl)
        : finalProfiles.find(profile => profile.admin) || finalProfiles[0];
    
    const activeProfileId = defaultProfile?.id || finalProfiles[0].id;
    const activeProfile = finalProfiles.find(profile => profile.id === activeProfileId);
    
    if (!activeProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Profile not found.</p>
            </div>
        );
    }

    // Fetch all documents across all profiles
    const allDocuments = await fetchAllDocuments(userId, finalProfiles);
    
    return (
        <DashboardPageClient
            userId={userId}
            activeProfileId={activeProfileId}
            activeProfile={activeProfile}
            profiles={finalProfiles}
            documentSchemas={documentSchemas}
            allDocuments={allDocuments}
        />
    );
};

export default DashboardPage;
