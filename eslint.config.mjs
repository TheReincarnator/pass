import { FlatCompat } from "@eslint/eslintrc"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.plugins("prettier", "unused-imports"),
  {
    rules: {
      "arrow-body-style": "off",
      complexity: "off",
      curly: "error",
      "import/extensions": "off",
      "import/no-unresolved": "off",
      "max-depth": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "max-params": ["error", 4],
      "max-statements": "off",
      "no-await-in-loop": "off",
      "no-continue": "off",
      "no-underscore-dangle": "error",
      "no-use-before-define": "off",
      "prettier/prettier": ["error", { htmlWhitespaceSensitivity: "css" }],
      "require-await": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
]

export default eslintConfig
