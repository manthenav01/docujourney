export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Dates converted to ISO strings for transfer to client components
  createdAt: string | null;
  updatedAt: string | null;
  admin: boolean;
  relationship?: string; // Relationship to the main profile
}
  