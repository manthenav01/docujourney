/**
 * String formatting utilities for job titles and other text transformations
 */

/**
 * Transform job titles from capitalized format to readable format
 * Examples:
 * - "SOFTWARE ENGINEER" -> "Software Engineer"
 * - "SENIOR SOFTWARE ENGINEER" -> "Senior Software Engineer"
 * - "DATA SCIENTIST II" -> "Data Scientist II"
 * - "SOFTWARE ENGINEER - LEVEL 1" -> "Software Engineer - Level 1"
 * @param jobTitle - The job title to transform
 * @returns Readable job title format
 */
export function formatJobTitle(jobTitle: string): string {
  if (!jobTitle || typeof jobTitle !== 'string') {
    return jobTitle;
  }

  // Handle special cases and preserve them
  const specialCases = [
    'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'JR', 'SR', 'PHD', 'MBA', 'MS', 'BS', 'BA', 'CS', 'IT', 'AI', 'ML', 'DL',
    'AWS', 'GCP', 'AZURE', 'SQL', 'NOSQL', 'API', 'UI', 'UX', 'QA', 'QC',
    'HTML', 'CSS', 'JS', 'TS', 'C++', 'C#', 'F#', 'R', 'SAS', 'SPSS',
    'CEO', 'CTO', 'CFO', 'COO', 'VP', 'SVP', 'EVP', 'GM', 'PM', 'PO',
    'USA', 'US', 'UK', 'EU', 'APAC', 'EMEA', 'NA', 'SA', 'LATAM'
  ];

  // Split by common separators and process each part
  const parts = jobTitle.split(/(\s+|\(|\)|\[|\]|\/|\\|-)/);

  const formattedParts = parts.map(part => {
    // Skip separators and empty strings
    if (!part.trim() || /^[\s\(\)\[\]\/\\-]+$/.test(part)) {
      return part;
    }

    // Check if it's a special case that should remain uppercase
    const upperPart = part.toUpperCase();
    if (specialCases.includes(upperPart)) {
      return upperPart;
    }

    // Handle words that should be title case
    if (part.length > 1) {
      // Convert to title case: first letter uppercase, rest lowercase
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }

    // Single characters remain as-is
    return part;
  });

  return formattedParts.join('');
}

/**
 * Alternative version that handles more complex job title patterns
 * @param jobTitle - The job title to transform
 * @returns Readable job title format
 */
export function formatJobTitleAdvanced(jobTitle: string): string {
  if (!jobTitle || typeof jobTitle !== 'string') {
    return jobTitle;
  }

  let formatted = jobTitle;

  // Handle common patterns
  // 1. Convert ALL CAPS to Title Case, but preserve special abbreviations
  formatted = formatted.replace(/\b([A-Z]{2,})\b/g, (match) => {
    // Keep these abbreviations uppercase
    const keepUppercase = ['II', 'III', 'IV', 'JR', 'SR', 'PHD', 'MBA', 'AWS', 'GCP', 'AZURE', 'SQL', 'API', 'CEO', 'CTO', 'CFO', 'COO', 'VP', 'PM'];
    if (keepUppercase.includes(match)) {
      return match;
    }
    // Convert to title case
    return match.charAt(0) + match.slice(1).toLowerCase();
  });

  // 2. Handle hyphenated words
  formatted = formatted.replace(/(\w+)-(\w+)/g, (match, first, second) => {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() + '-' +
           second.charAt(0).toUpperCase() + second.slice(1).toLowerCase();
  });

  // 3. Handle parentheses content
  formatted = formatted.replace(/\((\w+)\)/g, (match, content) => {
    return '(' + content.charAt(0).toUpperCase() + content.slice(1).toLowerCase() + ')';
  });

  return formatted;
}