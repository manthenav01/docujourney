'use client';

import React, { useEffect, useState } from 'react';
import { User, Settings, LogOut, ChevronUp } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Separator,
import { toast } from 'sonner';
import { } from '@docujourney/ui'; } from '@docujourney/ui';

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function UserDropdown() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear the userId cookie
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    // Navigate to settings page (you can implement this later)
    console.log('Navigate to settings');
  };

  if (!user) {
    return null; // Don't render if no user is logged in
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const initials = getInitials(user.displayName, user.email);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-2 hover:bg-gray-100"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user.email}
              </div>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2" 
        align="end" 
        side="top"
        sideOffset={8}
      >
        <div className="space-y-1">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-sm"
              onClick={handleSettings}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
