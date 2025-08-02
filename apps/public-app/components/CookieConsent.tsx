'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@docujourney/ui';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    
    // Enable analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    
    // Disable analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
      });
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-2 border-blue-200 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Cookie Consent</h3>
              <p className="text-sm text-gray-600 mb-4">
                We use cookies and analytics to improve your experience and understand how you use our H1B platform. 
                Your privacy is important to us.
              </p>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button 
                  onClick={handleAccept}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Accept All
                </Button>
                <Button 
                  onClick={handleDecline}
                  variant="outline"
                  size="sm"
                >
                  Decline
                </Button>
              </div>
            </div>
            <button
              onClick={handleDecline}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}