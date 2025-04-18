import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.plugins('import', 'prettier', 'unused-imports'),
  {
    rules: {
      complexity: 'off',
      curly: 'error',
      'max-depth': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'max-params': ['error', 4],
      'max-statements': 'off',
      'no-await-in-loop': 'off',
      'no-continue': 'off',
      'no-underscore-dangle': 'error',
      'no-use-before-define': 'off',
      'prettier/prettier': ['error', { htmlWhitespaceSensitivity: 'css' }],
      'react-hooks/exhaustive-deps': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]

export default eslintConfig
