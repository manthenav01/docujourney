"use client";

import React, { useEffect, useState } from "react";
import { fetchUserDocuments } from "../lib/documentsApi";
import { DocumentMetaDataModel } from "@/lib/types/document.model";

interface DocumentGroupByVisaType {
  visaType: string;
  docs: DocumentMetaDataModel[];
}

const DocumentList: React.FC<{ userId: string; profileId: string }> = ({ userId, profileId }) => {
  const [documents, setDocuments] = useState<DocumentMetaDataModel[]>([]);
  const [documentGroups, setDocumentGroups] = useState<DocumentGroupByVisaType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const docs = await fetchUserDocuments(userId, profileId);
        setDocuments(docs);
        groupDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [userId, profileId]);

  const groupDocuments = (docs: DocumentMetaDataModel[]) => {
    const groups = docs.reduce((acc, doc) => {
      const visaType = doc.extracted?.document_type || "Others";
      const list = acc[visaType] || [];
      return { ...acc, [visaType]: [...list, doc] };
    }, {} as Record<string, DocumentMetaDataModel[]>);

    const grouped = Object.entries(groups).map(([visaType, docs]) => ({ visaType, docs }));
    setDocumentGroups(grouped);
  };

  if (loading) return <p>Loading documents...</p>;

  return (
    <div>
      {documentGroups.map((group) => (
        <div key={group.visaType} className="mb-6">
          <h2 className="text-xl font-bold mb-2">{group.visaType}</h2>
          <ul>
            {group.docs.map((doc) => (
              <li key={doc.id} className="border p-4 mb-2 rounded">
                <p>Document ID: {doc.id}</p>
                {/* <p>Valid To: {doc.extracted?.valid_to || "N/A"}</p> */}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
