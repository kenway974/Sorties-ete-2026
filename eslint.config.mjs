import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Initialization-only useEffect patterns (reading localStorage, setting state
      // from async data on mount) are universally accepted. This rule is too strict.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
