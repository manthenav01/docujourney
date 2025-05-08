import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { Badge } from './badge';

interface DocumentStatusBadgeProps {
  validTo?:  string | null;
}

const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ validTo }) => {
  // Define custom classes for each status
  let variants: 'default' | 'expired' | 'expiring' | 'active' | 'secondary' | 'destructive' | 'outline' | null | undefined = 'default';
  let statusText = '';

  if (!validTo) {
    statusText = 'Unknown';
  } else {
    // Normalize validTo into a Date object
    let validDate: Date | null = null;
    if (typeof validTo === 'string') {
      validDate = new Date(validTo);
    }
    const now = new Date();
    const diffDays = validDate
      ? Math.ceil((validDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : NaN;

    if (!validDate || isNaN(diffDays)) {
      statusText = 'Unknown';
      variants = 'default';
    } else if (diffDays < 0) {
      statusText = 'Expired';
      variants = 'expired';
    } else if (diffDays <= 30) {
      statusText = 'Expiring';
      variants = 'expiring';
    } else {
      statusText = 'Active';
      variants = 'active';
    }
  }

  return (
    <Badge  variant={variants}>
      {statusText}
    </Badge>
  );
};

export default DocumentStatusBadge;
