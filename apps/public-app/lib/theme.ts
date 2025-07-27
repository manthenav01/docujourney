// Modern Theme Configuration
// Inspired by Mixpanel, Amplitude, and modern analytics platforms

export const theme = {
  colors: {
    // Primary palette - Professional blues
    primary: {
      50: '#f0f4ff',
      100: '#e0e7ff', 
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      900: '#312e81',
    },
    
    // Neutral palette - Clean grays
    neutral: {
      25: '#fcfcfd',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Success palette
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    
    // Warning palette  
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    
    // Error palette
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  typography: {
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

// CSS Custom Properties for easy theme switching
export const cssVariables = `
  :root {
    /* Colors */
    --color-primary-50: 240 245 255;
    --color-primary-100: 224 231 255;
    --color-primary-500: 99 102 241;
    --color-primary-600: 79 70 229;
    --color-primary-700: 67 56 202;
    --color-primary-900: 49 46 129;
    
    --color-neutral-25: 252 252 253;
    --color-neutral-50: 249 250 251;
    --color-neutral-100: 243 244 246;
    --color-neutral-200: 229 231 235;
    --color-neutral-300: 209 213 219;
    --color-neutral-400: 156 163 175;
    --color-neutral-500: 107 114 128;
    --color-neutral-600: 75 85 99;
    --color-neutral-700: 55 65 81;
    --color-neutral-800: 31 41 55;
    --color-neutral-900: 17 24 39;
    
    --color-success-50: 240 253 244;
    --color-success-100: 220 252 231;
    --color-success-500: 34 197 94;
    --color-success-600: 22 163 74;
    
    --color-warning-50: 255 251 235;
    --color-warning-100: 254 243 199;
    --color-warning-500: 245 158 11;
    --color-warning-600: 217 119 6;
    
    --color-error-50: 254 242 242;
    --color-error-100: 254 226 226;
    --color-error-500: 239 68 68;
    --color-error-600: 220 38 38;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    --spacing-3xl: 64px;
    
    /* Border Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Typography */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-base: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    --font-size-3xl: 30px;
    --font-size-4xl: 36px;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
  }
`;

export type Theme = typeof theme;