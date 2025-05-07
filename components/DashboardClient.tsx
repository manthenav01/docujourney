"use client";

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types/profile.model';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchUserDocuments } from '@/lib/documentsApi';
import { DocumentMetaDataModel } from '@/lib/types/document.model';

// Interface for grouped documents
interface DocumentGroup {
  documentType: string;
  docs: DocumentMetaDataModel[];
}

interface DashboardClientProps {
  userId: string;
  profiles: Profile[];
}

export default function DashboardClient({ userId, profiles }: DashboardClientProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [groupedDocuments, setGroupedDocuments] = useState<DocumentGroup[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);

  // Fetch and group documents when profile changes
  useEffect(() => {
    if (!userId || !selectedProfileId) {
      setGroupedDocuments([]); // Clear documents if no profile selected
      return;
    }

    const loadDocuments = async () => {
      setLoadingDocs(true);
      setErrorDocs(null);
      try {
        const docs = await fetchUserDocuments(userId, selectedProfileId);

        // Grouping logic (similar to trackvisionai)
        const groups = docs.reduce((acc, doc) => {
          // Use extracted.document_type for grouping, fallback to 'Others'
          const groupKey = doc.extracted?.document_type || 'Others';
          const list = acc[groupKey] || [];
          return { ...acc, [groupKey]: [...list, doc] };
        }, {} as Record<string, DocumentMetaDataModel[]>);

        const groupedArray = Object.entries(groups).map(([documentType, docs]) => ({
          documentType,
          docs,
        }));

        setGroupedDocuments(groupedArray);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
        setErrorDocs("Failed to load documents.");
        setGroupedDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    };

    loadDocuments();
  }, [userId, selectedProfileId]); // Re-run effect when userId or selectedProfileId changes

  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Title on the left */}
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="w-64"> {/* Adjust width as needed */}
          <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.firstName} {profile.lastName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document Display Area */}
      <div>
        {loadingDocs && <p>Loading documents...</p>}
        {errorDocs && <p className="text-red-500">{errorDocs}</p>}
        {!loadingDocs && !errorDocs && groupedDocuments.length === 0 && (
          <p>No documents found for this profile.</p>
        )}
        {!loadingDocs && !errorDocs && groupedDocuments.map((group) => (
          <Card key={group.documentType} className="mb-6">
            <CardHeader>
              <CardTitle>{group.documentType}</CardTitle>
            </CardHeader>
            <CardContent>
              {group.docs.length > 0 ? (
                <ul className="space-y-2">
                  {group.docs.map((doc) => (
                    <li key={doc.id} className="border p-3 rounded text-sm">
                      <p>Name: {doc.name}</p>
                      {/* Add more details as needed */}
                      {/* Example: <p>Status: {doc.status}</p> */}
                      {/* Example: <p>Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</p> */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No documents of this type.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
