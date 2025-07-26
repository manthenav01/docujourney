/**
 * Chart Color System for Modern Gradient Area Charts
 * Provides dynamic color generation and gradient definitions
 */

export interface GradientColor {
  id: string;
  startColor: string;
  endColor: string;
  opacity?: number;
}

/**
 * Generate HSL color with adjustable lightness and saturation
 */
export const generateHSLColor = (
  hue: number, 
  saturation: number = 70, 
  lightness: number = 50,
): string => {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Create gradient definition for area charts
 */
export const createGradient = (
  baseHue: number = 220, 
  id: string = 'areaGradient',
): GradientColor => ({
  id,
  startColor: generateHSLColor(baseHue, 80, 60),
  endColor: generateHSLColor(baseHue, 90, 25),
  opacity: 0.8,
});

/**
 * Professional color palettes for different chart types
 */
export const chartColorPalettes = {
  primary: {
    gradient: createGradient(220, 'primaryGradient'), // Blue gradient
    line: generateHSLColor(220, 90, 45),
    accent: generateHSLColor(220, 80, 65),
  },
  secondary: {
    gradient: createGradient(260, 'secondaryGradient'), // Purple gradient  
    line: generateHSLColor(260, 85, 50),
    accent: generateHSLColor(260, 75, 70),
  },
  success: {
    gradient: createGradient(140, 'successGradient'), // Green gradient
    line: generateHSLColor(140, 80, 45),
    accent: generateHSLColor(140, 70, 65),
  },
  warning: {
    gradient: createGradient(45, 'warningGradient'), // Orange gradient
    line: generateHSLColor(45, 90, 50),
    accent: generateHSLColor(45, 80, 70),
  },
};

/**
 * Generate color series for multi-data area charts
 */
export const generateColorSeries = (count: number, baseHue: number = 220): string[] => {
  const colors: string[] = [];
  const hueStep = 360 / count;
  
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i * hueStep)) % 360;
    colors.push(generateHSLColor(hue, 75, 55));
  }
  
  return colors;
};

/**
 * Theme-aware color system
 */
export const getThemeColors = (isDark: boolean = false) => ({
  background: isDark ? 'hsl(222, 84%, 5%)' : 'hsl(0, 0%, 100%)',
  foreground: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 84%, 5%)',
  muted: isDark ? 'hsl(217, 32%, 17%)' : 'hsl(210, 40%, 96%)',
  border: isDark ? 'hsl(217, 32%, 17%)' : 'hsl(214, 32%, 91%)',
  primary: isDark ? generateHSLColor(220, 80, 70) : generateHSLColor(220, 90, 45),
});

/**
 * Salary distribution specific color scheme
 */
export const salaryDistributionColors = {
  gradient: createGradient(220, 'salaryGradient'),
  line: generateHSLColor(220, 90, 45),
  grid: generateHSLColor(220, 20, 90),
  text: generateHSLColor(220, 15, 35),
  tooltip: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: generateHSLColor(220, 30, 80),
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};

/**
 * Standard color arrays for different chart types
 */
export const CHART_COLOR_ARRAYS = {
  standard: [
    generateHSLColor(220, 90, 45), // Blue
    generateHSLColor(260, 85, 50), // Purple
    generateHSLColor(140, 80, 45), // Green
    generateHSLColor(45, 90, 50),  // Orange
    generateHSLColor(0, 75, 55),   // Red
    generateHSLColor(190, 80, 50), // Cyan
    generateHSLColor(300, 70, 55), // Magenta
    generateHSLColor(60, 85, 50),  // Yellow-green
    generateHSLColor(15, 80, 55),  // Red-orange
    generateHSLColor(280, 75, 60), // Violet
  ],
  geographic: [
    generateHSLColor(220, 75, 50), // Ocean blue
    generateHSLColor(140, 70, 45), // Forest green
    generateHSLColor(35, 85, 55),  // Earth orange
    generateHSLColor(260, 70, 55), // Mountain purple
    generateHSLColor(190, 75, 50), // Sky cyan
    generateHSLColor(15, 75, 50),  // Desert red
    generateHSLColor(60, 80, 50),  // Grassland yellow
    generateHSLColor(300, 65, 55), // Sunset magenta
    generateHSLColor(100, 70, 45), // Moss green
    generateHSLColor(45, 80, 60),  // Sand beige
  ],
  salary: [
    generateHSLColor(0, 70, 55),   // Low salary - Red
    generateHSLColor(30, 80, 55),  // Below average - Orange
    generateHSLColor(60, 75, 50),  // Average - Yellow
    generateHSLColor(120, 70, 45), // Above average - Light green
    generateHSLColor(140, 80, 40), // High salary - Green
    generateHSLColor(160, 85, 35), // Very high - Dark green
  ],
};

/**
 * Get a color from a color array by index
 */
export const getChartColor = (index: number, colorArray: string[] = CHART_COLOR_ARRAYS.standard): string => {
  if (!colorArray || colorArray.length === 0) {
    return generateHSLColor(220, 70, 50); // Default blue
  }
  return colorArray[index % colorArray.length];
};

/**
 * Get salary range specific color based on index
 */
export const getSalaryRangeColor = (index: number): string => {
  return getChartColor(index, CHART_COLOR_ARRAYS.salary);
};

/**
 * Create Nivo theme configuration
 */
export const createNivoTheme = (isDark: boolean = false) => {
  const colors = getThemeColors(isDark);
  
  return {
    // Remove background to keep chart background transparent
    text: {
      fontSize: 12,
      fill: colors.foreground,
      outlineWidth: 0,
      outlineColor: 'transparent',
    },
    axis: {
      domain: {
        line: {
          stroke: colors.border,
          strokeWidth: 1,
        },
      },
      legend: {
        text: {
          fontSize: 12,
          fill: colors.foreground,
          outlineWidth: 0,
          outlineColor: 'transparent',
        },
      },
      ticks: {
        line: {
          stroke: colors.border,
          strokeWidth: 1,
        },
        text: {
          fontSize: 11,
          fill: colors.foreground,
          outlineWidth: 0,
          outlineColor: 'transparent',
        },
      },
    },
    grid: {
      line: {
        stroke: colors.border,
        strokeWidth: 1,
      },
    },
    legends: {
      title: {
        text: {
          fontSize: 11,
          fill: colors.foreground,
          outlineWidth: 0,
          outlineColor: 'transparent',
        },
      },
      text: {
        fontSize: 11,
        fill: colors.foreground,
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
      ticks: {
        line: {},
        text: {
          fontSize: 10,
          fill: colors.foreground,
          outlineWidth: 0,
          outlineColor: 'transparent',
        },
      },
    },
    annotations: {
      text: {
        fontSize: 13,
        fill: colors.foreground,
        outlineWidth: 2,
        outlineColor: colors.background,
        outlineOpacity: 1,
      },
      link: {
        stroke: colors.primary,
        strokeWidth: 1,
        outlineWidth: 2,
        outlineColor: colors.background,
        outlineOpacity: 1,
      },
      outline: {
        stroke: colors.primary,
        strokeWidth: 2,
        outlineWidth: 2,
        outlineColor: colors.background,
        outlineOpacity: 1,
      },
      symbol: {
        fill: colors.primary,
        outlineWidth: 2,
        outlineColor: colors.background,
        outlineOpacity: 1,
      },
    },
    tooltip: {
      container: {
        background: colors.background,
        color: colors.foreground,
        fontSize: 12,
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${colors.border}`,
      },
    },
  };
};