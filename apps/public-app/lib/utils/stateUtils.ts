/**
 * US State utilities for handling state names, abbreviations, and data
 */

// Simple state data mapping - more reliable than external library
const STATE_DATA = [
  { AL: 'Alabama' }, { AK: 'Alaska' }, { AZ: 'Arizona' }, { AR: 'Arkansas' },
  { CA: 'California' }, { CO: 'Colorado' }, { CT: 'Connecticut' }, { DE: 'Delaware' },
  { FL: 'Florida' }, { GA: 'Georgia' }, { HI: 'Hawaii' }, { ID: 'Idaho' },
  { IL: 'Illinois' }, { IN: 'Indiana' }, { IA: 'Iowa' }, { KS: 'Kansas' },
  { KY: 'Kentucky' }, { LA: 'Louisiana' }, { ME: 'Maine' }, { MD: 'Maryland' },
  { MA: 'Massachusetts' }, { MI: 'Michigan' }, { MN: 'Minnesota' }, { MS: 'Mississippi' },
  { MO: 'Missouri' }, { MT: 'Montana' }, { NE: 'Nebraska' }, { NV: 'Nevada' },
  { NH: 'New Hampshire' }, { NJ: 'New Jersey' }, { NM: 'New Mexico' }, { NY: 'New York' },
  { NC: 'North Carolina' }, { ND: 'North Dakota' }, { OH: 'Ohio' }, { OK: 'Oklahoma' },
  { OR: 'Oregon' }, { PA: 'Pennsylvania' }, { RI: 'Rhode Island' }, { SC: 'South Carolina' },
  { SD: 'South Dakota' }, { TN: 'Tennessee' }, { TX: 'Texas' }, { UT: 'Utah' },
  { VT: 'Vermont' }, { VA: 'Virginia' }, { WA: 'Washington' }, { WV: 'West Virginia' },
  { WI: 'Wisconsin' }, { WY: 'Wyoming' }, { DC: 'District of Columbia' },
];

const statesData = STATE_DATA;

/**
 * Convert state abbreviation to full state name
 * @param abbreviation - Two-letter state abbreviation (e.g., 'TN', 'CA')
 * @returns Full state name (e.g., 'Tennessee', 'California')
 */
export function getFullStateName(abbreviation: string): string {
  const abbrev = abbreviation.toUpperCase();
  const stateObj = statesData.find(state => Object.keys(state)[0] === abbrev);
  return stateObj ? Object.values(stateObj)[0] as string : abbreviation;
}

/**
 * Get complete state data by abbreviation
 * @param code - Two-letter state abbreviation
 * @returns State object with abbreviation and name
 */
export function getStateByCode(code: string) {
  const abbrev = code.toUpperCase();
  const stateObj = statesData.find(state => Object.keys(state)[0] === abbrev);
  if (stateObj) {
    const [abbreviation] = Object.keys(stateObj);
    const [name] = Object.values(stateObj);
    return { abbreviation, name };
  }
  return null;
}

/**
 * Get state abbreviation from full name
 * @param stateName - Full state name (e.g., 'Tennessee')
 * @returns State abbreviation (e.g., 'TN')
 */
export function getStateAbbreviation(stateName: string): string {
  const normalizedName = stateName.toLowerCase();
  const stateObj = statesData.find(state => 
    (Object.values(state)[0] as string).toLowerCase() === normalizedName,
  );
  return stateObj ? Object.keys(stateObj)[0] : stateName;
}

/**
 * Check if a string is a state abbreviation (2 characters)
 * @param input - String to check
 * @returns True if it's a valid state abbreviation
 */
export function isStateAbbreviation(input: string): boolean {
  if (input.length !== 2) {
    return false;
  }
  const abbrev = input.toUpperCase();
  return statesData.some(state => Object.keys(state)[0] === abbrev);
}

/**
 * Format state display with both name and abbreviation
 * @param input - State name or abbreviation
 * @returns Formatted string like "Tennessee (TN)"
 */
export function formatStateDisplay(input: string): string {
  if (isStateAbbreviation(input)) {
    const fullName = getFullStateName(input);
    return `${fullName} (${input.toUpperCase()})`;
  } else {
    const abbreviation = getStateAbbreviation(input);
    if (abbreviation !== input) {
      return `${input} (${abbreviation})`;
    }
    return input;
  }
}

/**
 * Get state icon/emoji for display purposes
 * @param code - State abbreviation
 * @returns State icon (for now, using a general government building icon)
 */
export function getStateIcon(code: string): string {
  // US states don't have standard emoji flags
  // Using a government building icon as a placeholder
  return '🏛️';
}

/**
 * All available US states data
 */
export { statesData };