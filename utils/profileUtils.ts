import { Profile } from '@/lib/types/profile.model';

/**
 * Defines the priority order for profile relationships
 * Lower numbers = higher priority (displayed first)
 */
const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'self': 1,
  'spouse': 2,
  'child': 3,
  'parent': 4,
  'sibling': 5,
  'relative': 6,
  'grandparent': 7,
  'other': 8,
};

/**
 * Sorts profiles in a specific order:
 * 1. Admin/Self profiles first
 * 2. Spouse
 * 3. Children
 * 4. Any other relations (parent, sibling, relative, etc.)
 * 
 * Within each category, profiles are sorted alphabetically by first name.
 */
export function sortProfilesByRelationship(profiles: Profile[]): Profile[] {
  return [...profiles].sort((a, b) => {
    // First, prioritize admin profiles
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;

    // Get relationship priorities
    const aRelationship = a.relationship || 'other';
    const bRelationship = b.relationship || 'other';
    
    const aPriority = RELATIONSHIP_PRIORITY[aRelationship] || RELATIONSHIP_PRIORITY['other'];
    const bPriority = RELATIONSHIP_PRIORITY[bRelationship] || RELATIONSHIP_PRIORITY['other'];

    // Sort by relationship priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Within the same relationship category, sort alphabetically by first name
    return a.firstName.localeCompare(b.firstName);
  });
}
