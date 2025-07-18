module.exports = [
  {
    ignores: [
      'lib/**/*',
      'generated/**/*',
      'node_modules/**/*',
    ],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'quotes': ['error', 'double'],
      'indent': ['error', 2],
    },
  },
];
