import React from 'react';

export default function Welcome() {
  return (
    <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Welcome to DocuJourney!</h2>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        Get started by uploading your first document or selecting a profile from the sidebar. 
        DocuJourney helps you organize, track, and analyze your important documents with ease.
      </p>

    </div>
  );
}
