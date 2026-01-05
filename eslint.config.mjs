import path from "node:path";
import { fileURLToPath } from "node:url";

import stylistic from "@stylistic/eslint-plugin";
import vitest from "@vitest/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import promise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import reactHooks from "eslint-plugin-react-hooks";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import cspellPlugin from "@cspell/eslint-plugin";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      ".yarn/",
      "charms/",
      "actions/dist/",
      ".github/",
      "docs/",
      "public/",
      "konf/",
    ],
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "e2e/**/*.ts", "actions/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      promise.configs["flat/recommended"],
      reactHooks.configs["recommended-latest"],
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    plugins: {
      prettier,
      vitest,
      "react-refresh": reactRefresh,
      react,
      "@stylistic": stylistic,
      perfectionist,
      "@cspell": cspellPlugin,
    },
    languageOptions: {
      globals: {
        window: true,
        document: true,
        localStorage: true,
        windowLocation: true,
        jujuDashboardConfig: true,
        lightningjs: true,
      },
      ecmaVersion: 5,
      sourceType: "script",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        project: [
          "./tsconfig.json",
          "./tsconfig.node.json",
          "./actions/tsconfig.json",
        ].map((project) => path.join(__dirname, project)),
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      "import/resolver": { node: { paths: ["src"] }, typescript: true },
      react: { version: "detect" },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "prefer-promise-reject-errors": "error",
      "@typescript-eslint/await-thenable": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "error",
      "prefer-destructuring": "off",
      "@typescript-eslint/prefer-destructuring": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-confusing-void-expression": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": "error",
      "require-await": "off",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {
          ignorePrimitives: {
            string: true,
            boolean: true,
          },
        },
      ],
      "init-declarations": "off",
      "@typescript-eslint/init-declarations": "error",
      "@typescript-eslint/promise-function-async": "error",
      "react/jsx-filename-extension": [1, { extensions: [".js", ".tsx"] }],
      "import/prefer-default-export": 0,
      "import/first": ["error"],
      "import/newline-after-import": "error",
      // Prevent conflicts with consistent-type-imports
      "import/no-duplicates": "off",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc" },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
        },
      ],
      "vitest/prefer-expect-assertions": 0,
      "vitest/no-hooks": 0,
      "vitest/no-conditional-expect": 0,
      "default-case": 0,
      "no-param-reassign": 0,
      "no-case-declarations": 0,
      "no-constant-condition": ["error", { checkLoops: false }],
      "one-var": ["error", "never"],
      "id-length": [
        "error",
        { exceptions: ["_", "i", "j", "x", "y"], properties: "never" },
      ],
      camelcase: ["error", { properties: "never" }],
      curly: ["error", "all"],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "react/no-unescaped-entities": 0,
      "react/display-name": 0,
      "@typescript-eslint/no-duplicate-enum-values": 0,
      "promise/catch-or-return": ["error", { allowFinally: true }],
      "react-refresh/only-export-components": ["error"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrors: "none",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": ["error"],
      "perfectionist/sort-intersection-types": "error",
      "perfectionist/sort-union-types": "error",
      "@cspell/spellchecker": ["warn", {}],
    },
  },
  {
    files: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "e2e/**/*.spec.ts",
      "actions/**/*.test.ts",
    ],
    rules: {
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/init-declarations": "off",
    },
  },
  {
    files: ["e2e/**/*.ts"],
    rules: {
      // Prevent Playwright's `use` from being misidentified as a hook.
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["actions/**/*.ts"],
    settings: {
      "import/resolver": {
        node: { paths: ["actions/src"] },
        typescript: {
          project: ["actions/tsconfig.json"],
        },
      },
    },
  },
);
