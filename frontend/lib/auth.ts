// Authentication helper & client storage for JWT tokens
export type UserRole = 'admin' | 'wali_kelas';

export interface UserProfile {
  role: UserRole;
  kelas_diampu: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  kelas_diampu: string;
  profile?: UserProfile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
}

const ACCESS_TOKEN_KEY = 'buku_induk_access_token';
const REFRESH_TOKEN_KEY = 'buku_induk_refresh_token';
const USER_KEY = 'buku_induk_user';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuth(tokens: AuthTokens, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Set simple cookie for middleware or external checks if needed
  document.cookie = `buku_induk_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  window.dispatchEvent(new Event('auth-change'));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'buku_induk_logged_in=; path=/; max-age=0; SameSite=Lax';
  window.dispatchEvent(new Event('auth-change'));
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

export function isWaliKelas(): boolean {
  const user = getCurrentUser();
  return user?.role === 'wali_kelas';
}

/**
 * Request ke backend untuk refresh access token menggunakan refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearAuth();
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  try {
    const res = await fetch(`${apiUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const data = await res.json();
    if (data.access) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        if (data.refresh) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
        }
      }
      return data.access;
    }
  } catch (err) {
    console.error('Failed to refresh token', err);
    clearAuth();
  }
  return null;
}
