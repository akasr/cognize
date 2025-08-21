import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // AirBnB style rules (manual)
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-parens': ['error', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'max-len': ['error', { code: 100 }],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'consistent-return': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
    },
  },
  // Disable style rules that conflict with Prettier
  prettierConfig,
];
