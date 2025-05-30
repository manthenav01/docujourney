import { cookies } from 'next/headers';
import { fetchDocumentsByType } from '@/lib/documentActions';
import React from 'react';
import { fetchProfiles } from '@/lib/profileApi';
import DocumentTypePageWithUpload from '@/components/DocumentTypePageWithUpload';
import { sortDocumentsBySchemaOrder as sortDocumentsBySchemaOrderUtil } from '@/utils/documentUtils';

async function fetchDocumentSchema(documentType: string) {
    const { fetchDocumentSchemas } = await import('@/lib/documentActions');
    const schemas = await fetchDocumentSchemas();
    return { schema: schemas[documentType] || null, allSchemas: schemas };
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
    const { schema: documentSchema, allSchemas: documentSchemas } = await fetchDocumentSchema(documentType);
    let documents = await fetchDocumentsByType(userId, activeProfile.id, documentType);
    documents = sortDocumentsBySchemaOrderUtil(documents, documentSchema);

    return (
        <DocumentTypePageWithUpload
            userId={userId}
            activeProfile={activeProfile}
            documents={documents}
            documentSchema={documentSchema}
        />
    );
};

export default DocumentTypePage;
