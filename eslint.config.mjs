import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTs from 'eslint-config-next/typescript.js';
import eslintConfigPrettier from 'eslint-config-prettier';

// Helper para garantir que as configs sejam tratadas corretamente (array ou objeto)
const wrapConfig = (config) => (Array.isArray(config) ? config : [config]);

const eslintConfig = defineConfig([
  ...wrapConfig(nextVitals),
  ...wrapConfig(nextTs),
  eslintConfigPrettier,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
]);

export default eslintConfig;
