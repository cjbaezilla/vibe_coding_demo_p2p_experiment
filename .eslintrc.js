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
    'jsdoc/require-jsdoc': ['warn', {
      publicOnly: true,
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: true,
        FunctionExpression: true
      }
    }],
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'max-len': ['warn', { 'code': 120 }],
    // Prevent React.memo usage as per requirements
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'react',
        importNames: ['memo'],
        message: 'React.memo is not allowed in this project.'
      }]
    }],
    // Additional useful rules
    'no-multi-spaces': 'warn',
    'no-trailing-spaces': 'warn',
    'no-multiple-empty-lines': ['warn', { 'max': 2, 'maxEOF': 1 }],
    'comma-dangle': ['warn', 'only-multiline'],
    'arrow-body-style': ['warn', 'as-needed'],
    'arrow-parens': ['warn', 'always'],
    'quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'jsx-quotes': ['warn', 'prefer-double'],
    'react/self-closing-comp': 'warn',
    'react/jsx-pascal-case': 'warn'
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
  overrides: [
    {
      // Allow console statements in service files
      files: ['**/services/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};