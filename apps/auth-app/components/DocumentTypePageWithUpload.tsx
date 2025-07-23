'use client';

import React from 'react';
import DocumentCard from './DocumentCard';
import DocumentCardBody from './DocumentCardBody';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { DocumentMetaDataTransformedModel } from '@/lib/types/document.model';
import { Profile } from '@/lib/types/profile.model';

interface DocumentTypePageWithUploadProps {
  userId: string;
  activeProfile: Profile;
  documents: DocumentMetaDataTransformedModel[];
  documentSchema: DocumentTypeSchemaModel;
}

export default function DocumentTypePageWithUpload({
  userId,
  activeProfile,
  documents,
  documentSchema,
}: DocumentTypePageWithUploadProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">{documentSchema?.displayName}</h2>
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
}
