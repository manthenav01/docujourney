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

const DocumentPage = ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await fetchDocument(slug);
        setDocument(doc);
      } catch (err) {
        setError(err.message);
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