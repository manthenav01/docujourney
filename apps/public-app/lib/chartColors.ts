/**
 * Professional Chart Color System for H1B Analytics Dashboard
 * Converts OKLCH colors to HSL and provides enterprise-grade color palettes
 * Following design standards from Tableau, Google Analytics, and Mixpanel
 */

// Professional Chart Color Palette (HSL format for compatibility)
export const CHART_COLORS = {
  // Primary data visualization colors
  primary: 'hsl(252, 56%, 57%)',     // Professional indigo
  secondary: 'hsl(195, 55%, 65%)',   // Clean cyan blue  
  tertiary: 'hsl(274, 44%, 52%)',    // Rich purple
  success: 'hsl(142, 52%, 58%)',     // Professional green
  warning: 'hsl(43, 89%, 55%)',      // Vibrant orange
  
  // Extended palette for complex datasets
  accent1: 'hsl(330, 48%, 60%)',     // Magenta
  accent2: 'hsl(15, 78%, 65%)',      // Coral
  accent3: 'hsl(200, 85%, 45%)',     // Deep blue
  neutral: 'hsl(220, 8%, 55%)',      // Professional gray
} as const;

// Chart color arrays for multi-series data
export const CHART_COLOR_ARRAYS = {
  // Standard 5-color palette for most charts
  standard: [
    CHART_COLORS.primary,
    CHART_COLORS.secondary, 
    CHART_COLORS.tertiary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
  ],
  
  // Extended 9-color palette for complex visualizations
  extended: [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.tertiary, 
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.accent1,
    CHART_COLORS.accent2,
    CHART_COLORS.accent3,
    CHART_COLORS.neutral,
  ],
  
  
  // Progressive color scale for salary ranges (light to dark)
  salaryRanges: [
    'hsl(252, 56%, 75%)',  // Light indigo for lower ranges
    'hsl(252, 56%, 65%)',  // Medium-light indigo
    'hsl(252, 56%, 57%)',  // Standard indigo
    'hsl(252, 56%, 47%)',  // Medium-dark indigo
    'hsl(252, 56%, 37%)',  // Dark indigo
    'hsl(252, 56%, 27%)',  // Very dark indigo for highest ranges
  ],
  
  // Geographic/state colors with good contrast
  geographic: [
    'hsl(195, 55%, 65%)',  // Cyan blue
    'hsl(142, 52%, 58%)',  // Green
    'hsl(43, 89%, 55%)',   // Orange
    'hsl(274, 44%, 52%)',  // Purple
    'hsl(330, 48%, 60%)',  // Magenta
  ],
} as const;

// Utility function to get color by index with fallback
export function getChartColor(index: number, palette: readonly string[] = CHART_COLOR_ARRAYS.standard): string {
  return palette[index % palette.length];
}


// Utility function to get progressive salary range colors
export function getSalaryRangeColor(index: number): string {
  return CHART_COLOR_ARRAYS.salaryRanges[Math.min(index, CHART_COLOR_ARRAYS.salaryRanges.length - 1)];
}

// OKLCH to HSL conversion utility (for future use)
export function oklchToHsl(l: number, c: number, h: number): string {
  // Simplified conversion - for production use, consider using a color library
  // This provides approximate HSL values from OKLCH
  const hue = h;
  const saturation = Math.round(c * 100);
  const lightness = Math.round(l * 100);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Theme integration for @nivo charts
export function createNivoTheme(isDark: boolean = false) {
  return {
    background: 'transparent',
    text: {
      fontSize: 12,
      fill: isDark ? 'hsl(210, 40%, 85%)' : 'hsl(222, 15%, 25%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 500,
    },
    axis: {
      domain: {
        line: {
          stroke: isDark ? 'hsl(217, 19%, 35%)' : 'hsl(214, 13%, 93%)',
          strokeWidth: 1,
        },
      },
      legend: {
        text: {
          fontSize: 13,
          fill: isDark ? 'hsl(210, 40%, 85%)' : 'hsl(222, 15%, 25%)',
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      },
      ticks: {
        line: {
          stroke: isDark ? 'hsl(217, 19%, 35%)' : 'hsl(214, 13%, 93%)',
          strokeWidth: 1,
        },
        text: {
          fontSize: 11,
          fill: isDark ? 'hsl(210, 40%, 65%)' : 'hsl(215, 25%, 45%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      },
    },
    grid: {
      line: {
        stroke: isDark ? 'hsl(217, 19%, 25%)' : 'hsl(214, 13%, 90%)',
        strokeWidth: 1,
        strokeDasharray: '2 4',
      },
    },
  };
}

// Accessibility helpers
export function ensureColorContrast(color: string, backgroundColor: string = '#ffffff'): string {
  // Placeholder for contrast checking - implement with a color library if needed
  return color;
}

// Export types for TypeScript
export type ChartColorPalette = keyof typeof CHART_COLOR_ARRAYS;
export type ChartColor = typeof CHART_COLORS[keyof typeof CHART_COLORS];