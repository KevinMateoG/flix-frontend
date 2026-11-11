'use client';

import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/src/features/common/hooks/useLanguage';
import { useTmdbSearch } from '../hooks/useTmdbSearch';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';

export function SearchView() {
  const { locale, t } = useLanguage();
  const { query, setQuery, results, loading } = useTmdbSearch(locale);

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-background mb-6">
        {t('search')}
      </h1>

      <div className="mb-8 flex flex-col gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={
            locale === 'es'
              ? 'Busca películas y series...'
              : locale === 'pt'
                ? 'Pesquise filmes e séries...'
                : 'Search movies, TV shows...'
          }
        />
        {loading && (
          <div className="text-muted mt-2 flex items-center gap-2 text-sm">
            <Loader2 size={16} className="text-primary animate-spin" />
            {locale === 'es' ? 'Buscando...' : locale === 'pt' ? 'Pesquisando...' : 'Searching...'}
          </div>
        )}
      </div>

      <SearchResults items={results} query={query} />
    </div>
  );
}
