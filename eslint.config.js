import antfu from "@antfu/eslint-config"

export default antfu({
  ignores: ["**/*.json"],
  markdown: false,
  stylistic: false,
  jsonc: false,
  jsx: false,
  toml: false,
  test: { overrides: { "test/no-import-node-test": "off" } },
  typescript: {
    tsconfigPath: "tsconfig.json",
    ignoresTypeAware: ["copy.ts", "*.config.*"],

    overridesTypeAware: {
      "ts/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            { from: "package", package: "node:test", name: ["describe", "it", "test"] },
          ],
        },
      ],
    },

    overrides: {
      "no-console": "off",
      "ts/no-use-before-define": "off",
      "ts/consistent-type-definitions": "off",
      "ts/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "ts/no-unsafe-argument": "off",
      "ts/no-unsafe-assignment": "off",
      "node/prefer-global/process": "off",
      "antfu/no-top-level-await": "off",
      "import/consistent-type-specifier-style": "off",

      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          internalPattern: ["^@/", "^~/", "^#[a-zA-Z0-9-]+/"],
          newlinesBetween: "always",
          groups: [
            ["builtin", "builtin-type"],
            ["external", "external-type"],
            ["internal", "internal-type"],
            ["parent", "parent-type"],
            ["sibling", "sibling-type"],
            ["index", "index-type"],
            "object",
            "unknown",
          ],
        },
      ],
    },
  },
})
