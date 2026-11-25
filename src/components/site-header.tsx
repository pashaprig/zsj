import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './language-switcher';

export function SiteHeader() {
  const t = useTranslations('Nav');
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-primary">
          ЗСЖ
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/advertising" className="hover:underline">
            {t('advertising')}
          </Link>
          <Link href="/subscription" className="hover:underline">
            {t('subscription')}
          </Link>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
