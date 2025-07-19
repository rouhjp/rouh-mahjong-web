import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade to warning
      '@typescript-eslint/no-unused-expressions': 'off', // Allow for short-circuit eval
      
      // Import rules for ES Module compliance
      'import/extensions': ['error', 'always', {
        'js': 'always',
        'ts': 'never',
        'tsx': 'never',
        // Ignore extensions for external packages
        ignorePackages: true
      }],
      'import/no-unresolved': 'off', // Turn off as TypeScript handles this
    },
    settings: {
      'import/resolver': {
        'node': {
          'extensions': ['.js', '.ts', '.tsx']
        }
      },
    },
  },
)
