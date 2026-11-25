import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Module boundaries (ADR-0004): outside code imports a module only via its public index.ts.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*/*', '**/modules/*/domain/**', '**/modules/*/application/**', '**/modules/*/infra/**'],
              message: "Import a module only through its public barrel: '@/modules/<module>'.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'next-env.d.ts', 'drizzle/meta/**']),
]);
