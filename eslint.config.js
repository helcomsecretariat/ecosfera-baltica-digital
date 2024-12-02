import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // forcing this to keep HMR working. We care about development experience.
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lodash-es",
              importNames: ["chain"],
              message: "Do not use `_.chain` (https://github.com/lodash/lodash/issues/3298#issuecomment-319978917)",
            },
          ],
        },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
