module.exports = {
  env: {
    node: true,
    es2024: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint', 'prettier'],

  rules: {
    'import/no-default-export': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] },
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    'prettier/prettier': 'error',
    'no-process-exit': 0,
    'node/no-missing-import': 0,
  },

  settings: {
    'import/ignore': ['node_modules'],
    'import/resolver': {
      typescript: {},
    },
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
  },
};
