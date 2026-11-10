import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const appConfig = {
  backendUrl: process.env.BACKEND || process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000',
  publicUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:5173',
  tmdbBaseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  tmdbApiKey: process.env.TMDB_API_KEY || 'ffefb8a1d835920bd5152230950e867e',
  tmdbImageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
  muxPlaybackDomain: process.env.NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN || 'stream.mux.com',
  muxTestPlaybackId: process.env.NEXT_PUBLIC_MUX_TEST_PLAYBACK_ID || 'demo-stream',
} as const;

export const env = {
  BACKEND: appConfig.backendUrl,
  NEXT_PUBLIC_URL: appConfig.publicUrl,
  TMDB_BASE_URL: appConfig.tmdbBaseUrl,
  TMDB_API_KEY: appConfig.tmdbApiKey,
  TMDB_IMAGE_BASE_URL: appConfig.tmdbImageBaseUrl,
  NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN: appConfig.muxPlaybackDomain,
  NEXT_PUBLIC_MUX_TEST_PLAYBACK_ID: appConfig.muxTestPlaybackId,
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supportedLocales = ['en', 'es', 'pt'] as const;

export type AppLocale = (typeof supportedLocales)[number];

export function normalizeLocale(locale?: string | null): AppLocale {
  return supportedLocales.includes(locale as AppLocale) ? (locale as AppLocale) : 'en';
}

export function getTmdbLanguage(locale?: string | null): string {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale === 'es' ? 'es-ES' : normalizedLocale === 'pt' ? 'pt-BR' : 'en-US';
}

const messages = {
  en: {
    home: 'Home',
    browse: 'Browse',
    myList: 'My List',
    profile: 'Profile',
    search: 'Search',
    settings: 'Settings',
    admin: 'Admin',
    trendingThisWeek: 'Trending This Week',
    popularMovies: 'Popular Movies',
    popularTvShows: 'Popular TV Shows',
    topRatedMovies: 'Top Rated Movies',
    continueWatching: 'Continue Watching',
    preferredLanguage: 'Preferred Language',
    maturityRating: 'Maturity Rating Filter',
    kidsProfile: 'Kids Profile',
    kidsProfileDescription: 'Restricts visibility to child-friendly content and ratings.',
    savePreferences: 'Save Preferences',
    cancel: 'Cancel',
  },
  es: {
    home: 'Inicio',
    browse: 'Explorar',
    myList: 'Mi lista',
    profile: 'Perfil',
    search: 'Buscar',
    settings: 'Configuración',
    admin: 'Admin',
    trendingThisWeek: 'Tendencias de esta semana',
    popularMovies: 'Películas populares',
    popularTvShows: 'Series populares',
    topRatedMovies: 'Películas mejor valoradas',
    continueWatching: 'Continuar viendo',
    preferredLanguage: 'Idioma preferido',
    maturityRating: 'Filtro de clasificación por edad',
    kidsProfile: 'Perfil infantil',
    kidsProfileDescription: 'Restringe el contenido a títulos y clasificaciones aptos para niños.',
    savePreferences: 'Guardar preferencias',
    cancel: 'Cancelar',
  },
  pt: {
    home: 'Início',
    browse: 'Explorar',
    myList: 'Minha lista',
    profile: 'Perfil',
    search: 'Pesquisar',
    settings: 'Configurações',
    admin: 'Admin',
    trendingThisWeek: 'Em alta esta semana',
    popularMovies: 'Filmes populares',
    popularTvShows: 'Séries populares',
    topRatedMovies: 'Filmes mais bem avaliados',
    continueWatching: 'Continuar assistindo',
    preferredLanguage: 'Idioma preferido',
    maturityRating: 'Filtro de classificação etária',
    kidsProfile: 'Perfil infantil',
    kidsProfileDescription:
      'Restringe a exibição a conteúdos e classificações adequados para crianças.',
    savePreferences: 'Salvar preferências',
    cancel: 'Cancelar',
  },
} as const;

export type TranslationKey = keyof (typeof messages)['en'];
export type Messages = (typeof messages)[AppLocale];

export function getMessages(locale?: string | null): Messages {
  return messages[normalizeLocale(locale)];
}
