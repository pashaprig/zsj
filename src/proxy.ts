import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/** Locale routing for public pages (ADR-0006). /admin and /api stay outside locale routing. */
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
