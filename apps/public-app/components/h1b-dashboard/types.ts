// H1B Dashboard Types
export interface FilterState {
  searchQuery: string;
  fiscalYear: string;
  salaryRange?: [number, number];
  states?: string[];
  cities?: string[];
  jobCategories?: string[];
  skillLevels?: string[];
  companySizes?: string[];
  companyTypes?: string[];
}

export interface H1BData {
  employer: string;
  jobTitle: string;
  location: string;
  salary: number;
  fiscalYear: string;
  status: string;
  state: string;
  city: string;
  category: string;
  skillLevel: string;
  companySize: string;
  companyType: string;
}

export type TabType = 'salary' | 'map';
