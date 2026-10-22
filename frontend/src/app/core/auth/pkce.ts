// Small helpers for the OAuth 2.0 authorization code flow with PKCE (RFC 7636).

export function base64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomString(byteCount: number): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(byteCount)));
}

export async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

/** Reads a JWT's payload for display only. The gateway and services do the real validation. */
export function decodeJwt<T = Record<string, unknown>>(token: string): T {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/** Only in-app paths ("/cart", "/products?q=x") are allowed as a place to return to after sign-in. */
export function safeReturnUrl(value: string | null | undefined): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/';
}
