import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing (ADR-0006): Ukrainian lives at the root without a prefix (`/archive`),
 * Russian under `/ru` (`/ru/archive`). No redirect by browser language or cookie —
 * an unprefixed URL always opens the Ukrainian page; readers switch via the language switcher.
 */
export const routing = defineRouting({
  locales: ['uk', 'ru'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
