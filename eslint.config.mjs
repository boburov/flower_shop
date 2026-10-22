import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "lib/generated/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Uzbek copy uses apostrophes (oʻ, gʻ, qoʻshish) throughout; raw ' in JSX
      // text is intentional and renders correctly.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
