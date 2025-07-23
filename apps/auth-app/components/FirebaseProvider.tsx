import React, { useEffect, useState } from 'react';
import { getApps } from 'firebase/app';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    // Check if Firebase is initialized
    const checkFirebase = () => {
      const apps = getApps();
      if (apps.length > 0) {
        setIsFirebaseReady(true);
      } else {
        // Try to import Firebase config to initialize it
        import('@/lib/firebase').then(() => {
          setIsFirebaseReady(true);
        }).catch((error) => {
          console.error('Failed to initialize Firebase:', error);
        });
      }
    };

    checkFirebase();
  }, []);

  if (!isFirebaseReady) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};
