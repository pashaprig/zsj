'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/** Switches the UI locale while keeping the current path. */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const current = useLocale();
  const t = useTranslations('Nav');
  return (
    <nav aria-label={t('language')} className="flex gap-1 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === current ? 'true' : undefined}
          className={cn(
            'rounded-md px-2 py-1 uppercase',
            locale === current ? 'bg-secondary font-semibold' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {locale === 'uk' ? 'UA' : 'RU'}
        </Link>
      ))}
    </nav>
  );
}
