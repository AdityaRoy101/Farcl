import { REFRESH_MUTATION } from '../graphql/mutations/Refresh/Refresh';
import { saveAccessToken, saveRefreshToken, getRefreshToken } from './tokens';

/**
 * Refreshes the access token using the refresh token.
 * Calls the GraphQL refresh API, updates localStorage with new tokens, and returns the new access token.
 * @returns The new access token or null if refresh failed.
 */
export async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({
        query: REFRESH_MUTATION,
      }),
    });

    const json = await response.json();
    const raw = json.body?.singleResult?.data?.refresh || json.data?.refresh;

    if (!raw) return null;

    const result = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (result.success && result.data?.accessToken) {
      saveAccessToken(result.data.accessToken);
      if (result.data.refreshToken) {
        saveRefreshToken(result.data.refreshToken);
      }
      return result.data.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}
