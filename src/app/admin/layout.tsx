import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = { title: 'Адмінка — ЗСЖ', robots: { index: false } };

/**
 * Admin root layout: Ukrainian-only, outside locale routing (ADR-0006).
 * The auth guard arrives with the admin sign-in feature.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
