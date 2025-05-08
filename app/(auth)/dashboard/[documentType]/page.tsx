import { cookies } from 'next/headers';
import { fetchDocumentsByType } from '@/lib/documentActions';
import React from 'react';
import { fetchProfiles } from '@/lib/profileApi';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import DocumentCard from '@/components/DocumentCard';
import { sortDocumentsBySchemaOrder as sortDocumentsBySchemaOrderUtil } from '@/utils/documentUtils';
import DocumentCardBody from '@/components/DocumentCardBody';

async function fetchDocumentSchema(documentType: string) {
    const { fetchDocumentSchemas } = await import('@/lib/documentActions');
    const schemas = await fetchDocumentSchemas();
    return schemas[documentType] || null;
}

const DocumentTypePage = async ({ params, searchParams }: { params: { documentType: string }, searchParams: { profileId?: string } }) => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;
    const profileIdFromUrl = typeof searchParams.profileId === 'string' ? searchParams.profileId : undefined;
    if (!userId) {
        return <div><p>Missing user or profile information.</p></div>;
    }
    const documentType = params.documentType;
    const profiles = await fetchProfiles(userId);
    const activeProfile = profiles.find(profile => profileIdFromUrl ? profile.id === profileIdFromUrl : profile.admin) || profiles[0];
    const documentSchema = await fetchDocumentSchema(documentType);
    let documents = await fetchDocumentsByType(userId, activeProfile.id, documentType);
    documents = sortDocumentsBySchemaOrderUtil(documents, documentSchema);

    return (
        <>
            <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-medium">{documentSchema?.displayName}</h2>
                <ProfileSwitcher
                    profiles={profiles}
                    initialProfileId={activeProfile?.id}
                    userId={userId}
                />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {documents.length === 0 ? (
                    <p>No documents found for this type.</p>
                ) : (
                    documents.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} userId={userId} profileId={activeProfile.id} documentSchema={documentSchema}>
                            <DocumentCardBody doc={doc} documentSchema={documentSchema} />
                        </DocumentCard>
                    ))
                )}
            </div>
        </>
    );
};

export default DocumentTypePage;
