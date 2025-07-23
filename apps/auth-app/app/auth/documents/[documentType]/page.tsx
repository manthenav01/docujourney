import { cookies } from 'next/headers';
import { fetchDocumentsByType } from '@/lib/documentActions';
import React from 'react';
import { fetchProfiles } from '@/lib/profileApi';
import DocumentTypePageWithUpload from '@/components/DocumentTypePageWithUpload';
import { sortDocumentsBySchemaOrder as sortDocumentsBySchemaOrderUtil } from '@/utils/documentUtils';
import { sortProfilesByRelationship } from '@/utils/profileUtils';

async function fetchDocumentSchema(documentType: string) {
    const { fetchDocumentSchemas } = await import('@/lib/documentActions');
    const schemas = await fetchDocumentSchemas();
    return { schema: schemas[documentType] || null, allSchemas: schemas };
}

const DocumentTypePage = async ({ 
    params, 
    searchParams, 
}: { 
    params: Promise<{ documentType: string }>, 
    searchParams: Promise<{ profileId?: string }> 
}) => {
    const { documentType } = await params;
    const { profileId } = await searchParams;
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;
    
    if (!userId) {
        return <div><p>Missing user or profile information.</p></div>;
    }
    
    const profiles = await fetchProfiles(userId);
    const sortedProfiles = sortProfilesByRelationship(profiles);
    const activeProfile = profiles.find(profile => profileId ? profile.id === profileId : profile.admin) || sortedProfiles[0];
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
