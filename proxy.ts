import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL
});

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /.*\\..*  (files with extensions, e.g., favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
