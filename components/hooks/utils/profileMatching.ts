import { Profile } from '@/lib/types/profile.model';

/**
 * Normalize names for comparison (remove extra spaces, convert to lowercase)
 */
const normalizeName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

/**
 * Create a full name from first and last name
 */
const createFullName = (firstName: string, lastName: string): string => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

/**
 * Check if two names match - supports both full name comparison and first/last name comparison
 */
export const doNamesMatch = (
  firstName1: string, 
  lastName1: string, 
  firstName2: string, 
  lastName2: string
): boolean => {
  // Normalize all names
  const normalizedFirst1 = normalizeName(firstName1 || '');
  const normalizedLast1 = normalizeName(lastName1 || '');
  const normalizedFirst2 = normalizeName(firstName2 || '');
  const normalizedLast2 = normalizeName(lastName2 || '');
  
  // Method 1: Exact first/last name match
  const exactMatch = normalizedFirst1 === normalizedFirst2 && normalizedLast1 === normalizedLast2;
  if (exactMatch) return true;
  
  // Method 2: Full name comparison (handles cases where first name includes middle name)
  const fullName1 = normalizeName(createFullName(firstName1, lastName1));
  const fullName2 = normalizeName(createFullName(firstName2, lastName2));
  const fullNameMatch = fullName1 === fullName2;
  if (fullNameMatch) return true;
  
  // Method 3: Check if one first name is contained in the other (for middle name cases)
  // e.g., "John Michael" matches "John" or "Michael John" matches "John"
  if (normalizedLast1 === normalizedLast2) {
    const containsMatch = normalizedFirst1.includes(normalizedFirst2) || 
                         normalizedFirst2.includes(normalizedFirst1);
    if (containsMatch) return true;
  }
  
  // Method 4: Check if the extracted name parts match when split differently
  // e.g., "John Michael Smith" vs firstName: "John Michael", lastName: "Smith"
  const allWords1 = fullName1.split(' ').filter(word => word.length > 0);
  const allWords2 = fullName2.split(' ').filter(word => word.length > 0);
  
  if (allWords1.length >= 2 && allWords2.length >= 2) {
    // Check if all words from the shorter name are present in the longer name
    const shorterWords = allWords1.length <= allWords2.length ? allWords1 : allWords2;
    const longerWords = allWords1.length > allWords2.length ? allWords1 : allWords2;
    
    const allWordsPresent = shorterWords.every(word => longerWords.includes(word));
    if (allWordsPresent) return true;
  }
  
  return false;
};

/**
 * Find a profile that matches the extracted name using improved name matching
 * Handles cases like:
 * - Exact matches: "John Smith" = "John Smith"
 * - Middle name variations: "John Michael Smith" matches profile "John Smith"
 * - Name order variations: "Michael John Smith" can match "John Smith"
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
