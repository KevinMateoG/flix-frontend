import { appConfig } from './config';

function parseApiErrorMessage(status: number, errText: string): string {
  try {
    const parsed = JSON.parse(errText) as { message?: string; error?: string };
    if (parsed?.message) return parsed.message;
    if (parsed?.error) return parsed.error;
  } catch {
    // fallback to raw text
  }
  return errText || `API Error ${status}`;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const headers = new Headers(options.headers);
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Origin')) {
    headers.set('Origin', appConfig.publicUrl);
  }

  const res = await fetch(`${appConfig.backendUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(parseApiErrorMessage(res.status, errText));
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const json = (await res.json()) as { data?: T } & T;
    return (json?.data !== undefined ? json.data : json) as T;
  }
  return null;
}

export async function fetchClientApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(parseApiErrorMessage(res.status, errText));
  }

  const json = (await res.json()) as { data?: T } & T;
  return (json?.data !== undefined ? json.data : json) as T;
}
