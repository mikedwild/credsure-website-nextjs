import { localePath, parsePath, getLangFromPath } from './localePath';

describe('localePath utility', () => {
  test('prefixes unprefixed path with target language', () => {
    const result = localePath('/pricing', 'en');
    expect(result).toMatch(/^\/en\//);
  });

  test('converts path to DE locale', () => {
    const result = localePath('/pricing', 'de');
    expect(result).toMatch(/^\/de\//);
  });

  test('handles root path', () => {
    expect(localePath('/', 'en')).toBe('/en');
    expect(localePath('/', 'de')).toBe('/de');
  });

  test('handles null/undefined path', () => {
    expect(localePath(null, 'en')).toBe('/en');
    expect(localePath('', 'en')).toBe('/en');
  });
});

describe('parsePath utility', () => {
  test('extracts lang and slug from prefixed path', () => {
    const result = parsePath('/en/pricing');
    expect(result.lang).toBe('en');
    expect(result.slug).toBe('pricing');
  });

  test('returns null lang for unprefixed path', () => {
    const result = parsePath('/pricing');
    expect(result.lang).toBeNull();
    expect(result.slug).toBe('pricing');
  });

  test('handles DE prefixed path', () => {
    const result = parsePath('/de/preise');
    expect(result.lang).toBe('de');
    expect(result.slug).toBe('preise');
  });

  test('handles nested paths', () => {
    const result = parsePath('/en/blog/my-article');
    expect(result.lang).toBe('en');
    expect(result.slug).toBe('blog/my-article');
  });
});

describe('getLangFromPath utility', () => {
  test('returns en for EN prefixed paths', () => {
    expect(getLangFromPath('/en/pricing')).toBe('en');
  });

  test('returns de for DE prefixed paths', () => {
    expect(getLangFromPath('/de/preise')).toBe('de');
  });

  test('defaults to en for unprefixed paths', () => {
    expect(getLangFromPath('/pricing')).toBe('en');
  });
});
