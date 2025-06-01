import { Profile } from '@/lib/types/profile.model';

/**
 * Normalize names for comparison (remove extra spaces, convert to lowercase)
 */
const normalizeName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

/**
 * Check if two names match
 */
export const doNamesMatch = (
  firstName1: string, 
  lastName1: string, 
  firstName2: string, 
  lastName2: string
): boolean => {
  const normalizedFirst1 = normalizeName(firstName1 || '');
  const normalizedLast1 = normalizeName(lastName1 || '');
  const normalizedFirst2 = normalizeName(firstName2 || '');
  const normalizedLast2 = normalizeName(lastName2 || '');
  
  return normalizedFirst1 === normalizedFirst2 && normalizedLast1 === normalizedLast2;
};

/**
 * Find a profile that matches the extracted name
 */
export const findMatchingProfile = (
  extractedFirstName: string, 
  extractedLastName: string, 
  profiles: Profile[]
): Profile | null => {
  return profiles.find(profile => 
    doNamesMatch(extractedFirstName, extractedLastName, profile.firstName, profile.lastName)
  ) || null;
};
