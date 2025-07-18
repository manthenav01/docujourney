'use client';

import { useEffect, useState } from 'react';

interface Document {
  title: string;
  content: string;
}

const fetchDocument = async (slug: string): Promise<Document> => {
  const response = await fetch(`/api/docs/${slug}`);
  console.log('Response:', response);
  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }
  return response.json();
};

const DocumentPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const initializeSlug = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    
    initializeSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) {return;}
    
    const loadDocument = async () => {
      try {
        const doc = await fetchDocument(slug);
        setDocument(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    loadDocument();
  }, [slug]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!document) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{document.title}</h1>
      <div>{document.content}</div>
    </div>
  );
};

export default DocumentPage;