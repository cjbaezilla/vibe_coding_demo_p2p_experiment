module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'react-app',
    'react-app/jest',
    'plugin:jsdoc/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jsdoc'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsdoc/require-jsdoc': 'warn',
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'max-len': ['warn', { 'code': 120 }]
  },
  settings: {
    react: {
      version: 'detect',
    },
    jsdoc: {
      tagNamePreference: {
        returns: 'returns'
      }
    }
  },
}; 