import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/** Locale routing for public pages. /admin and /api stay outside the locale prefix (ADR-0005). */
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
