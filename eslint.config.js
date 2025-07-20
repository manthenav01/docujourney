const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // General JavaScript/TypeScript rules
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'comma-dangle': ['error', 'always-multiline'],
      
      // Import rules
      'no-duplicate-imports': 'error',
      
      // Console statements - allow in API routes and lib files, warn in components
      'no-console': 'off', // Disabled globally since this is a development codebase with lots of logging
      
      // React rules adjustments
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/no-unescaped-entities': 'warn', // Keep as warning, safe to fix later
      
      // Next.js specific adjustments
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'warn',
      
      // React hooks - be careful with these to not break functionality
      'react-hooks/exhaustive-deps': 'off', // Disabled to avoid breaking existing functionality
    },
  },
  {
    // Stricter rules for components (not API routes)
    files: ['components/**/*.{js,jsx,ts,tsx}', 'app/**/page.tsx', 'app/**/layout.tsx'],
    rules: {
      'no-console': 'warn', // Warn in UI components
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      // Less strict for JavaScript files
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'functions/lib/**',
      'functions/generated/**',
      'public/**',
      'scripts/data/**',
      '.venv/**',
      '*.py',
      'tsconfig.tsbuildinfo',
      'serviceAccountKey.json',
    ],
  },
];