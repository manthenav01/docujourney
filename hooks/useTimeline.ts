'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimelineEvent } from '@/lib/types/timeline.model';
import { 
  fetchTimelineEvents, 
  getTimelineStatistics,
  subscribeToTimelineEvents,
} from '@/lib/timelineClientApi';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

export interface UseTimelineOptions {
  userId: string;
  profileId?: string;
  autoGenerate?: boolean;
}

export interface UseTimelineReturn {
  timeline: TimelineEvent[];
  stats: {
    total: number;
    completed: number;
    current: number;
    upcoming: number;
    progressPercentage: number;
  };
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  generateTimeline: (forceRegenerate?: boolean) => Promise<void>;
  clearError: () => void;
  refreshTimeline: () => Promise<void>;
}

export function useTimeline(options: UseTimelineOptions): UseTimelineReturn {
  const { userId, profileId, autoGenerate = false } = options;
  
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    current: 0,
    upcoming: 0,
    progressPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Monitor auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Wait for authenticated user with retry logic
  const waitForAuthenticatedUser = useCallback(async (maxRetries = 20, retryDelay = 250): Promise<User> => {
    return new Promise((resolve, reject) => {
      let retryCount = 0;
      
      const checkAuth = () => {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          resolve(user);
          return;
        }
        
        if (retryCount >= maxRetries) {
          reject(new Error('Authentication timeout - please refresh the page and try again'));
          return;
        }
        
        retryCount++;
        setTimeout(checkAuth, retryDelay);
      };
      
      checkAuth();
    });
  }, []);

  // Fetch timeline events from Firebase
  const fetchTimeline = useCallback(async () => {
    if (!userId || !profileId || !authReady) {return;}
    
    // If we don't have a current user, skip fetching
    if (!currentUser) {
      console.log('Skipping timeline fetch - user not authenticated');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [events, statistics] = await Promise.all([
        fetchTimelineEvents(userId, profileId),
        getTimelineStatistics(userId, profileId),
      ]);
      
      setTimeline(events);
      setStats(statistics);
    } catch (err: any) {
      console.error('Error fetching timeline:', err);
      
      // Check if it's an authentication error
      if (err?.code === 'permission-denied' || err?.code === 'unauthenticated') {
        setError('Authentication required. Please refresh the page and try again.');
      } else {
        setError('Failed to load timeline');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, profileId, authReady, currentUser]);

  // Generate timeline using LLM
  const generateTimeline = useCallback(async (forceRegenerate = false) => {
    if (!userId) {return;}
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Wait for authenticated user with retry logic
      const user = await waitForAuthenticatedUser();
      const token = await user.getIdToken();

      // Call the API endpoint to generate timeline
      const response = await fetch('/api/generateTimeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          profileId,
          forceRegenerate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate timeline: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh timeline after generation
      await fetchTimeline();
      
      console.log(`Generated ${result.events?.length || 0} timeline events`);
    } catch (err: any) {
      console.error('Error generating timeline:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('Authentication timeout') || err.message?.includes('not authenticated')) {
        setError('Authentication required. Please refresh the page and try again.');
      } else if (err.message?.includes('Failed to generate timeline')) {
        setError(err.message);
      } else {
        setError('Failed to generate timeline. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [userId, profileId, fetchTimeline, waitForAuthenticatedUser]);

  // Refresh timeline data
  const refreshTimeline = useCallback(async () => {
    await fetchTimeline();
  }, [fetchTimeline]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch timeline on mount - but only after auth is ready
  useEffect(() => {
    if (userId && authReady) {
      fetchTimeline();
    }
  }, [userId, authReady, fetchTimeline]);

  // Auto-generate timeline if enabled and no events exist - but only after auth is ready
  useEffect(() => {
    if (autoGenerate && userId && authReady && currentUser && timeline.length === 0 && !isLoading && !isGenerating && !error) {
      generateTimeline(false);
    }
  }, [autoGenerate, userId, authReady, currentUser, timeline.length, isLoading, isGenerating, error, generateTimeline]);

  return {
    timeline,
    stats,
    isLoading,
    isGenerating,
    error,
    generateTimeline,
    clearError,
    refreshTimeline,
  };
}