/**
 * Token management utilities for storing and retrieving access and refresh tokens in localStorage.
 */

/**
 * Saves the access token to localStorage.
 * @param token - The access token to save.
 */
export function saveAccessToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

/**
 * Retrieves the access token from localStorage.
 * @returns The access token or null if not found.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Saves the refresh token to localStorage.
 * @param token - The refresh token to save.
 */
export function saveRefreshToken(token: string): void {
  localStorage.setItem('refreshToken', token);
}

/**
 * Retrieves the refresh token from localStorage.
 * @returns The refresh token or null if not found.
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/**
 * Clears both access and refresh tokens from localStorage.
 */
export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
