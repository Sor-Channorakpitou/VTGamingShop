import { base64Url, codeChallenge, decodeJwt, randomString, safeReturnUrl } from './pkce';

describe('PKCE helpers', () => {
  it('computes the S256 challenge as base64url(SHA-256(verifier))', async () => {
    // SHA-256("abc") is the standard FIPS 180-2 test vector.
    expect(await codeChallenge('abc')).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
  });

  it('encodes base64url without padding', () => {
    expect(base64Url(new Uint8Array([251, 255, 191]))).toBe('-_-_');
    expect(base64Url(new Uint8Array([1]))).toBe('AQ');
  });

  it('makes random URL-safe strings', () => {
    const a = randomString(32);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomString(32)).not.toBe(a);
  });

  it('reads JWT payloads including non-ASCII text', () => {
    const payload = btoa(String.fromCharCode(...new TextEncoder().encode('{"name":"Sor Channorakpitou","x":"é"}')))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodeJwt(`h.${payload}.s`)).toEqual({ name: 'Sor Channorakpitou', x: 'é' });
  });

  it.each([
    ['/cart', '/cart'],
    ['/products?q=mouse', '/products?q=mouse'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['', '/'],
    [null, '/'],
  ])('only allows in-app return URLs: %s', (input, expected) => {
    expect(safeReturnUrl(input)).toBe(expected);
  });
});
