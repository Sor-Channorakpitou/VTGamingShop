import { Injectable, computed, signal } from '@angular/core';
import { codeChallenge, decodeJwt, randomString, safeReturnUrl } from './pkce';

export interface User {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  roles: string[];
}

interface StoredTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

interface PendingSignIn {
  verifier: string;
  state: string;
  returnUrl: string;
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
}

interface IdTokenClaims {
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  roles?: string[];
}

const CLIENT_ID = 'storefront';
const REALM = '/auth/realms/vtshop';
const OIDC = `${REALM}/protocol/openid-connect`;
const TOKENS_KEY = 'vt.auth.tokens';
const PENDING_KEY = 'vt.auth.pending';

/**
 * Sign-in with Keycloak (realm "vtshop") using the authorization code flow with PKCE.
 * The login and signup forms are Keycloak's own pages, themed to match the shop; this service
 * sends the user there, exchanges the returned code on /callback and keeps the tokens for the tab
 * (sessionStorage, so they are gone when the tab closes).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokens = signal<StoredTokens | null>(read<StoredTokens>(TOKENS_KEY));

  readonly user = computed<User | null>(() => {
    const tokens = this.tokens();
    if (!tokens) return null;
    const claims = decodeJwt<IdTokenClaims>(tokens.idToken);
    return {
      firstName: claims.given_name ?? '',
      lastName: claims.family_name ?? '',
      name: claims.name || claims.preferred_username || claims.email || 'Account',
      email: claims.email ?? '',
      roles: claims.roles ?? [],
    };
  });
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.roles.includes('admin') ?? false);

  readonly accountConsoleUrl = `${REALM}/account`;

  constructor() {
    // A session whose refresh token has also expired is over.
    const tokens = this.tokens();
    if (tokens && Date.now() > tokens.refreshExpiresAt) this.setTokens(null);
  }

  login(returnUrl: string = currentUrl()): Promise<void> {
    return this.startSignIn('auth', returnUrl);
  }

  register(returnUrl: string = currentUrl()): Promise<void> {
    return this.startSignIn('registrations', returnUrl);
  }

  /** Finishes sign-in on /callback. Returns the in-app URL to go back to. */
  async completeLogin(search: string): Promise<string> {
    const params = new URLSearchParams(search);
    const pending = read<PendingSignIn>(PENDING_KEY);
    write(PENDING_KEY, null);

    if (params.has('error')) {
      throw new Error(params.get('error_description') || params.get('error') || 'Sign-in failed.');
    }
    if (!pending || params.get('state') !== pending.state || !params.get('code')) {
      throw new Error('This sign-in link is no longer valid. Please try again.');
    }

    this.storeTokens(
      await tokenRequest({
        grant_type: 'authorization_code',
        code: params.get('code')!,
        redirect_uri: redirectUri(),
        code_verifier: pending.verifier,
      }),
    );
    return pending.returnUrl;
  }

  /** A valid access token, refreshed when close to expiry, or null when signed out. */
  async getAccessToken(): Promise<string | null> {
    const tokens = this.tokens();
    if (!tokens) return null;
    if (Date.now() < tokens.expiresAt - 30_000) return tokens.accessToken;

    if (tokens.refreshToken && Date.now() < tokens.refreshExpiresAt - 5_000) {
      try {
        this.storeTokens(
          await tokenRequest({ grant_type: 'refresh_token', refresh_token: tokens.refreshToken }),
        );
        return this.tokens()!.accessToken;
      } catch (error) {
        console.warn('Session refresh failed', error);
      }
    }
    this.setTokens(null);
    return null;
  }

  logout(): void {
    const tokens = this.tokens();
    this.setTokens(null);
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      post_logout_redirect_uri: `${location.origin}/`,
    });
    if (tokens?.idToken) params.set('id_token_hint', tokens.idToken);
    location.assign(`${OIDC}/logout?${params}`);
  }

  private async startSignIn(endpoint: 'auth' | 'registrations', returnUrl: string): Promise<void> {
    const verifier = randomString(48);
    const state = randomString(16);
    write<PendingSignIn>(PENDING_KEY, { verifier, state, returnUrl: safeReturnUrl(returnUrl) });

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      scope: 'openid profile email',
      redirect_uri: redirectUri(),
      state,
      code_challenge: await codeChallenge(verifier),
      code_challenge_method: 'S256',
    });
    location.assign(`${OIDC}/${endpoint}?${params}`);
  }

  private storeTokens(response: TokenResponse): void {
    const now = Date.now();
    this.setTokens({
      accessToken: response.access_token,
      idToken: response.id_token,
      refreshToken: response.refresh_token,
      expiresAt: now + response.expires_in * 1000,
      refreshExpiresAt: response.refresh_expires_in ? now + response.refresh_expires_in * 1000 : now,
    });
  }

  private setTokens(tokens: StoredTokens | null): void {
    write(TOKENS_KEY, tokens);
    this.tokens.set(tokens);
  }
}

// Token requests use fetch, not HttpClient, so they never pass through the auth interceptor.
async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch(`${OIDC}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...params }),
  });
  if (!response.ok) throw new Error(`Token request failed with ${response.status}`);
  return response.json();
}

const redirectUri = () => `${location.origin}/callback`;
const currentUrl = () => location.pathname + location.search;

function read<T>(key: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: sign-in will not survive a reload.
  }
}
