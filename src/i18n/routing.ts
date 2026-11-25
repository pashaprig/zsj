import { defineRouting } from 'next-intl/routing';

/** Locale routing — every public URL carries its locale (ADR-0005). */
export const routing = defineRouting({
  locales: ['uk', 'ru'],
  defaultLocale: 'uk',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
