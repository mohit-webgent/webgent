import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", ".next_build/**", "node_modules/**", "next-env.d.ts", "scripts/generate-pricing-matrix.js"],
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
      // React Compiler guidance that arrived with Next 16. Existing components work correctly but
      // don't follow it yet, so these stay visible as warnings until those components are revisited.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/error-boundaries": "warn",
    },
  },
  {
    files: ["tests/**", "scripts/**", "prisma/seed.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default config;
