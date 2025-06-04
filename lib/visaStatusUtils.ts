import { CheckCircle, AlertCircle, Clock, AlertTriangle, User } from 'lucide-react';

export type VisaStatusVariant = 'active' | 'expiring' | 'expired' | 'unknown' | 'pending';
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'active' | 'expiring' | 'expired';

/**
 * Determines the status variant based on visa status text
 */
export function getVisaStatusVariant(status: string): VisaStatusVariant {
  if (!status) return 'unknown';
  
  const lowerStatus = status.toLowerCase();
  
  // Handle AI-generated status descriptions
  if (lowerStatus.includes('in status') && !lowerStatus.includes('expiring')) {
    return 'active';
  }
  if (lowerStatus.includes('out of status') || lowerStatus.includes('expired')) {
    return 'expired';
  }
  if (lowerStatus.includes('expiring') || lowerStatus.includes('expires')) {
    return 'expiring';
  }
  if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
    return 'pending';
  }
  
  // Handle simple status values
  if (lowerStatus.includes('active') || lowerStatus.includes('valid')) {
    return 'active';
  }
  if (lowerStatus.includes('green card') || lowerStatus.includes('citizen')) {
    return 'active';
  }
  
  return 'unknown';
}

/**
 * Maps visa status variant to badge variant for UI components
 */
export function getVisaStatusBadgeVariant(status: string): BadgeVariant {
  const variant = getVisaStatusVariant(status);
  
  switch (variant) {
    case 'active': return 'active';
    case 'expiring': return 'expiring';
    case 'expired': return 'expired';
    case 'pending': return 'outline';
    case 'unknown': 
    default: return 'secondary';
  }
}

/**
 * Gets Tailwind CSS classes for visa status color coding
 */
export function getVisaStatusColorClasses(status: string): string {
  const variant = getVisaStatusVariant(status);
  
  switch (variant) {
    case 'active': 
      return 'bg-green-100 text-green-800 border-green-200';
    case 'expiring': 
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'expired': 
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending': 
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'unknown':
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Gets the appropriate icon component for visa status
 */
export function getVisaStatusIcon(status: string) {
  const variant = getVisaStatusVariant(status);
  
  switch (variant) {
    case 'active': 
      return CheckCircle;
    case 'expiring': 
      return Clock;
    case 'expired': 
      return AlertCircle;
    case 'pending': 
      return AlertTriangle;
    case 'unknown':
    default: 
      return User;
  }
}

/**
 * Gets a user-friendly display text for visa status
 */
export function getVisaStatusDisplayText(status: string): string {
  if (!status) return 'Unknown';
  
  const variant = getVisaStatusVariant(status);
  
  // If it's a simple AI-generated status, clean it up
  if (status.length < 50) {
    return status;
  }
  
  // For longer AI descriptions, use simplified text
  switch (variant) {
    case 'active': 
      return 'In Status';
    case 'expiring': 
      return 'Expiring Soon';
    case 'expired': 
      return 'Out of Status';
    case 'pending': 
      return 'Pending';
    case 'unknown':
    default: 
      return 'Status Unknown';
  }
}

/**
 * Determines priority level for sorting (higher number = higher priority)
 */
export function getVisaStatusPriority(status: string): number {
  const variant = getVisaStatusVariant(status);
  
  switch (variant) {
    case 'expired': return 4;      // Highest priority
    case 'expiring': return 3;     // High priority
    case 'pending': return 2;      // Medium priority
    case 'unknown': return 1;      // Low priority
    case 'active': return 0;       // Lowest priority (good status)
    default: return 1;
  }
}
