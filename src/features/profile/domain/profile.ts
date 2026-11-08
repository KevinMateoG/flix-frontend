export interface Profile {
  id: string;
  userId?: string;
  user_id?: string;
  displayName?: string | null;
  display_name?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  plan?: string | null;
  region?: string | null;
  language?: string | null;
  maturityRating?: string | null;
  maturity_rating?: string | null;
  isKids?: boolean | null;
  is_kids?: boolean | null;
}

export interface UpdateProfileSettingsInput {
  language?: string;
  maturityRating?: string;
  isKids?: boolean;
}

export const REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'BR', name: 'Brazil' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
] as const;

export const MATURITY_RATINGS = [
  { code: 'G', description: 'G - General Audiences' },
  { code: 'PG', description: 'PG - Parental Guidance Suggested' },
  { code: 'PG-13', description: 'PG-13 - Parents Strongly Cautioned' },
  { code: 'R', description: 'R - Restricted' },
  { code: 'NC-17', description: 'NC-17 - Adults Only' },
  { code: 'TV-MA', description: 'TV-MA - Mature Audience Only (Default)' },
] as const;
