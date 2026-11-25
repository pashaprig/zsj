import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Button } from '@/components/ui/button';

/** External subscription services; labels and URLs live in messages/{uk,ru}.json. */
const SERVICES = ['ukrposhta'] as const;

export default function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('Subscription');
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p>{t('body')}</p>
      <ul className="flex flex-wrap gap-2">
        {SERVICES.map((s) => (
          <li key={s}>
            <Button asChild variant="outline">
              <a href={t(`serviceUrls.${s}`)} target="_blank" rel="noopener noreferrer">
                {t(`services.${s}`)}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
