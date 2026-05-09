const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: ["out/", "dist/", "**/*.d.ts", "test-apps/"],
  },
  {
    files: ["src/**/*.ts"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 6,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/naming-convention": "warn",
      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "off",
    },
  },
];
