/**
 * Input validation and sanitization utilities for H1B data service
 */

import { 
  ValidatedAttorneyInput, 
  ValidatedCompanyInput, 
  ValidatedJobInput, 
  ValidatedCityInput,
  H1BServiceError,
} from './types/h1b.types';

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string = 'VALIDATION_ERROR',
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize string input by trimming, removing null bytes, and limiting length
 */
export function sanitizeString(input: string | null | undefined, maxLength: number = 100): string {
  if (!input) {return '';}
  
  return input
    .toString()
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate attorney name input
 */
export function validateAttorneyName(name: string | null | undefined): string {
  const sanitized = sanitizeString(name, 100);
  
  if (!sanitized) {
    throw new ValidationError('Attorney name is required', 'ATTORNEY_NAME_REQUIRED', 'name');
  }
  
  if (sanitized.length < 2) {
    throw new ValidationError('Attorney name must be at least 2 characters', 'ATTORNEY_NAME_TOO_SHORT', 'name');
  }
  
  // Basic pattern validation - only letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-'.]+$/.test(sanitized)) {
    throw new ValidationError('Attorney name contains invalid characters', 'ATTORNEY_NAME_INVALID_CHARS', 'name');
  }
  
  return sanitized;
}

/**
 * Validate law firm name input
 */
export function validateLawFirmName(firm: string | null | undefined): string | undefined {
  if (!firm) {return undefined;}
  
  const sanitized = sanitizeString(firm, 150);
  
  if (sanitized.length < 2) {
    throw new ValidationError('Law firm name must be at least 2 characters', 'FIRM_NAME_TOO_SHORT', 'firm');
  }
  
  // Allow more characters for firm names (alphanumeric, spaces, common business punctuation)
  if (!/^[a-zA-Z0-9\s\-'.,&()]+$/.test(sanitized)) {
    throw new ValidationError('Law firm name contains invalid characters', 'FIRM_NAME_INVALID_CHARS', 'firm');
  }
  
  return sanitized;
}

/**
 * Validate company name input
 */
export function validateCompanyName(name: string | null | undefined): string {
  const sanitized = sanitizeString(name, 150);
  
  if (!sanitized) {
    throw new ValidationError('Company name is required', 'COMPANY_NAME_REQUIRED', 'companyName');
  }
  
  if (sanitized.length < 2) {
    throw new ValidationError('Company name must be at least 2 characters', 'COMPANY_NAME_TOO_SHORT', 'companyName');
  }
  
  // Allow alphanumeric, spaces, and common business punctuation
  if (!/^[a-zA-Z0-9\s\-'.,&()]+$/.test(sanitized)) {
    throw new ValidationError('Company name contains invalid characters', 'COMPANY_NAME_INVALID_CHARS', 'companyName');
  }
  
  return sanitized;
}

/**
 * Validate job title input
 */
export function validateJobTitle(title: string | null | undefined): string {
  const sanitized = sanitizeString(title, 150);
  
  if (!sanitized) {
    throw new ValidationError('Job title is required', 'JOB_TITLE_REQUIRED', 'jobTitle');
  }
  
  if (sanitized.length < 2) {
    throw new ValidationError('Job title must be at least 2 characters', 'JOB_TITLE_TOO_SHORT', 'jobTitle');
  }
  
  // Allow alphanumeric, spaces, and common job title punctuation
  if (!/^[a-zA-Z0-9\s\-'.,()/&]+$/.test(sanitized)) {
    throw new ValidationError('Job title contains invalid characters', 'JOB_TITLE_INVALID_CHARS', 'jobTitle');
  }
  
  return sanitized;
}

/**
 * Validate city name input
 */
export function validateCityName(city: string | null | undefined): string {
  const sanitized = sanitizeString(city, 100);
  
  if (!sanitized) {
    throw new ValidationError('City name is required', 'CITY_NAME_REQUIRED', 'cityName');
  }
  
  if (sanitized.length < 2) {
    throw new ValidationError('City name must be at least 2 characters', 'CITY_NAME_TOO_SHORT', 'cityName');
  }
  
  // Only letters, spaces, hyphens, apostrophes for city names
  if (!/^[a-zA-Z\s\-'.]+$/.test(sanitized)) {
    throw new ValidationError('City name contains invalid characters', 'CITY_NAME_INVALID_CHARS', 'cityName');
  }
  
  return sanitized;
}

/**
 * Validate state name input
 */
export function validateStateName(state: string | null | undefined): string {
  const sanitized = sanitizeString(state, 50);
  
  if (!sanitized) {
    throw new ValidationError('State name is required', 'STATE_NAME_REQUIRED', 'stateName');
  }
  
  // Allow 2-letter state codes or full state names
  if (sanitized.length === 2) {
    if (!/^[A-Z]{2}$/.test(sanitized.toUpperCase())) {
      throw new ValidationError('Invalid state code format', 'STATE_CODE_INVALID', 'stateName');
    }
    return sanitized.toUpperCase();
  }
  
  if (sanitized.length < 2) {
    throw new ValidationError('State name must be at least 2 characters', 'STATE_NAME_TOO_SHORT', 'stateName');
  }
  
  // Only letters, spaces, hyphens for full state names
  if (!/^[a-zA-Z\s\-]+$/.test(sanitized)) {
    throw new ValidationError('State name contains invalid characters', 'STATE_NAME_INVALID_CHARS', 'stateName');
  }
  
  return sanitized;
}

/**
 * Validate and sanitize attorney input
 */
export function validateAttorneyInput(
  name: string | null | undefined,
  firm?: string | null | undefined,
): ValidatedAttorneyInput {
  try {
    const attorneyName = validateAttorneyName(name);
    const lawFirm = validateLawFirmName(firm);
    
    return { attorneyName, lawFirm };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid attorney input', 'ATTORNEY_INPUT_INVALID');
  }
}

/**
 * Validate and sanitize company input
 */
export function validateCompanyInput(name: string | null | undefined): ValidatedCompanyInput {
  try {
    const companyName = validateCompanyName(name);
    return { companyName };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid company input', 'COMPANY_INPUT_INVALID');
  }
}

/**
 * Validate and sanitize job input
 */
export function validateJobInput(title: string | null | undefined): ValidatedJobInput {
  try {
    const jobTitle = validateJobTitle(title);
    return { jobTitle };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid job input', 'JOB_INPUT_INVALID');
  }
}

/**
 * Validate and sanitize city input
 */
export function validateCityInput(
  city: string | null | undefined,
  state: string | null | undefined,
): ValidatedCityInput {
  try {
    const cityName = validateCityName(city);
    const stateName = validateStateName(state);
    return { cityName, stateName };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid city input', 'CITY_INPUT_INVALID');
  }
}

/**
 * Create H1B service error from validation error
 */
export function createServiceError(
  error: ValidationError | Error,
  code?: string,
): H1BServiceError {
  if (error instanceof ValidationError) {
    return {
      code: error.code,
      message: error.message,
      details: { field: error.field },
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    code: code || 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };
}