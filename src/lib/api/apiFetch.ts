import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../auth/tokens';
import { refreshTokens } from '../auth/refresh';

interface DecodedToken {
  exp: number;
}

/**
 * Checks if the access token is expired.
 * @param token - The access token to check.
 * @returns True if the token is expired, false otherwise.
 */
function isTokenExpired(token: string): boolean {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/**
 * Ensures a valid access token is available.
 * If the token is missing or expired, attempts to refresh it.
 * @returns The valid access token or null if unavailable.
 */
async function ensureValidToken(): Promise<string | null> {
  let token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    token = await refreshTokens();
  }
  return token;
}

/**
 * Wrapper for API calls that handles token refresh automatically.
 * Detects 401 errors, refreshes tokens, and retries the request once.
 * @param url - The API endpoint URL.
 * @param options - Fetch options (method, headers, body, etc.).
 * @returns The fetch response.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await ensureValidToken();
  if (!token) {
    throw new Error('Unable to obtain a valid access token');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    const newToken = await refreshTokens();
    if (newToken) {
      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    }
  }

  return response;
}
