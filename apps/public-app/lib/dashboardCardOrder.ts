/**
 * Standardized Dashboard Card Ordering Configuration
 * 
 * Defines consistent card ordering across all H1B dashboard routes
 * for better user experience and predictable information architecture
 */

export const DASHBOARD_CARD_ORDER = {
  /**
   * Tier 1: Key Metrics (Always first row, same order)
   * Order: Applications → Approval Rate → Salary → Context-Specific
   */
  METRICS: {
    APPLICATIONS: 1,
    APPROVAL_RATE: 2, 
    SALARY: 3,
    CONTEXT_SPECIFIC: 4, // Employers/Locations/Cities etc.
  },

  /**
   * Tier 2: Market Intelligence (Row 1 - Strategic Overview)
   * LEFT: Market Trends (temporal analysis)
   * RIGHT: Most relevant contextual entity
   */
  ROW_1: {
    LEFT: 'MARKET_TRENDS',
    RIGHT: 'PRIMARY_CONTEXT_CARD',
  },

  /**
   * Tier 3: Deep Analysis (Row 2 - Detailed Insights) 
   * LEFT: Geographic/Entity Distribution
   * RIGHT: Salary Distribution (always consistent position)
   */
  ROW_2: {
    LEFT: 'DISTRIBUTION_ANALYSIS',
    RIGHT: 'SALARY_DISTRIBUTION',
  },

  /**
   * Tier 4: Specialized Analysis (Additional full-width rows)
   * Full-width specialized cards like WageLevelAnalysis, etc.
   */
  SPECIALIZED: 'FULL_WIDTH_SPECIALIZED',
} as const;

/**
 * Route-specific card configurations
 * Defines which cards appear in each position for different dashboard types
 */
export const ROUTE_CARD_CONFIGS = {
  MAIN_DASHBOARD: {
    ROW_1: {
      LEFT: 'SalaryDistributionChart',
      RIGHT: 'HighestSalaryByStateChart', 
    },
    ROW_2: {
      LEFT: 'TopJobTitlesCard',
      RIGHT: 'TopAttorneysCard',
    },
    ADDITIONAL: ['TopEmployersTable'],
  },

  COMPANY_DASHBOARD: {
    ROW_1: {
      LEFT: 'MarketTrendsCard',
      RIGHT: 'TopJobTitlesCard',
    },
    ROW_2: {
      LEFT: 'GeographicDistribution',
      RIGHT: 'SalaryDistribution',
    },
  },

  JOB_DASHBOARD: {
    HERO: ['WageInsightSummary'],
    ROW_1: {
      LEFT: 'MarketTrendsCard',
      RIGHT: 'TopEmployersCard',
    },
    ROW_2: {
      LEFT: 'GeographicDistribution', 
      RIGHT: 'SalaryDistribution',
    },
    SPECIALIZED: ['WageLevelAnalysis'],
  },

  STATE_DASHBOARD: {
    ROW_1: {
      LEFT: 'MarketTrendsCard',
      RIGHT: 'TopCitiesCard',
    },
    ROW_2: {
      LEFT: 'TopEmployersCard',
      RIGHT: 'TopJobTitlesCard',
    },
    FULL_WIDTH: ['SalaryDistribution'],
  },

  CITY_DASHBOARD: {
    ROW_1: {
      LEFT: 'MarketTrendsCard',
      RIGHT: 'TopJobTitlesCard',
    },
    ROW_2: {
      LEFT: 'TopEmployersCard',
      RIGHT: 'SalaryDistribution',
    },
  },

  ATTORNEY_DASHBOARD: {
    ROW_1: {
      LEFT: 'TopEmployersCard',
      RIGHT: 'TopStatesCard',
    },
    ROW_2: {
      LEFT: 'MarketTrendsCard',
      RIGHT: 'SalaryDistribution',
    },
    SPECIALIZED: ['TopJobCategoriesCard'],
  },
} as const;

/**
 * Card priority levels for consistent ordering
 */
export const CARD_PRIORITIES = {
  ESSENTIAL: 1,     // Metrics cards - always shown
  PRIMARY: 2,       // Core analysis cards
  SECONDARY: 3,     // Supporting analysis
  SPECIALIZED: 4,   // Context-specific deep analysis
} as const;

/**
 * Responsive grid configurations for consistent layouts
 */
export const GRID_LAYOUTS = {
  METRICS: 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  TWO_COLUMN: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  FULL_WIDTH: 'w-full',
  THREE_COLUMN: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
} as const;

/**
 * Helper function to get standardized card order for a specific route
 */
export function getCardOrderForRoute(routeType: keyof typeof ROUTE_CARD_CONFIGS) {
  return ROUTE_CARD_CONFIGS[routeType];
}

/**
 * Helper function to get grid layout class for card section
 */
export function getGridLayoutClass(layoutType: keyof typeof GRID_LAYOUTS) {
  return GRID_LAYOUTS[layoutType];
}