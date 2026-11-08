import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import { getMessages, normalizeLocale } from '@/src/features/common/config';
import { LANGUAGES, MATURITY_RATINGS, type Profile } from '../domain/profile';
import { saveSettingsFormAction } from '../services/profile.service';

interface SettingsViewProps {
  profile: Profile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  const currentLanguage = normalizeLocale(profile.language);
  const t = getMessages(currentLanguage);
  const currentMaturity = profile.maturityRating || profile.maturity_rating || 'TV-MA';
  const currentIsKids = !!(profile.isKids ?? profile.is_kids);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 md:px-12 md:py-10">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/profile" className="text-muted hover:text-on-background transition-colors">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">
          {t.settings}
        </h1>
      </div>

      <form
        action={saveSettingsFormAction}
        className="bg-surface-container border-surface-bright/20 flex flex-col gap-6 rounded-lg border p-6 shadow-md"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="language" className="text-body-lg text-on-background font-semibold">
            {t.preferredLanguage}
          </label>
          <select
            id="language"
            name="language"
            defaultValue={currentLanguage}
            className="border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary h-12 w-full cursor-pointer rounded border px-4 focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="maturity_rating"
            className="text-body-lg text-on-background font-semibold"
          >
            {t.maturityRating}
          </label>
          <select
            id="maturity_rating"
            name="maturity_rating"
            defaultValue={currentMaturity}
            className="border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary h-12 w-full cursor-pointer rounded border px-4 focus:outline-none"
          >
            {MATURITY_RATINGS.map((m) => (
              <option key={m.code} value={m.code}>
                {m.description}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-surface-container-high border-surface-bright/20 mt-2 flex items-center justify-between rounded border p-4">
          <div className="flex flex-col gap-1 pr-4">
            <span className="text-body-md text-on-background font-semibold">{t.kidsProfile}</span>
            <p className="text-muted text-xs">{t.kidsProfileDescription}</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="is_kids"
              defaultChecked={currentIsKids}
              className="peer sr-only"
            />
            <div className="bg-surface-bright peer peer-checked:bg-primary h-6 w-11 rounded-full peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button type="submit" size="lg" className="flex-1 sm:flex-initial">
            {t.savePreferences}
          </Button>
          <Link href="/profile" className="flex-1 text-center sm:flex-initial">
            <Button type="button" variant="secondary" size="lg" className="w-full">
              {t.cancel}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
