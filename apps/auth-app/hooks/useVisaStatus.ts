import { useState, useEffect } from 'react';
import { VisaStatusResponse } from '@/lib/genkit';

interface UseVisaStatusProps {
  userId: string;
  profileId: string;
  autoAnalyze?: boolean; // Whether to auto-analyze on mount
}

export const useVisaStatus = ({ userId, profileId, autoAnalyze = false }: UseVisaStatusProps) => {
  const [visaStatus, setVisaStatus] = useState<VisaStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const analyzeStatus = async () => {
    if (!userId || !profileId) {
      setError('Missing userId or profileId');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyzeVisaStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, profileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze visa status');
      }

      const result: VisaStatusResponse = await response.json();
      setVisaStatus(result);
      setLastAnalyzed(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Visa status analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-analyze on mount if requested
  useEffect(() => {
    if (autoAnalyze && userId && profileId) {
      analyzeStatus();
    }
  }, [userId, profileId]); // Removed autoAnalyze from dependencies

  return {
    visaStatus,
    isLoading,
    error,
    lastAnalyzed,
    analyzeStatus,
    clearError: () => setError(null),
    clearStatus: () => setVisaStatus(null),
  };
};
