export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string | null; // ISO string for transfer to client components
  // Dates converted to ISO strings for transfer to client components
  createdAt: string | null;
  updatedAt: string | null;
  admin: boolean;
  isAdmin: boolean; // Alias for admin for easier use in components
  relationship?: string; // Relationship to the main profile
}
  