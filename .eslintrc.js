module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // Temporarily allow 'any' types in API slices
    "@typescript-eslint/no-explicit-any": "off",
    // Allow unused vars with underscore prefix
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    // Allow empty interfaces for extensibility
    "@typescript-eslint/no-empty-object-type": "off",
    // Relax some React rules
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
  },
};
