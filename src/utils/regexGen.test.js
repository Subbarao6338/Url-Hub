import { describe, it, expect } from 'vitest';
import { generateRegex, testRegex } from './regexGen';

describe('regexGen utility', () => {
  it('should return empty string for empty input', () => {
    expect(generateRegex('')).toBe('');
    expect(generateRegex(null)).toBe('');
  });

  it('should generate regex pattern for simple alphanumeric string', () => {
    const input = 'abc123XYZ';
    const regex = generateRegex(input);
    expect(regex).toBe('^[a-z]{3}\\d{3}[A-Z]{3}$');

    const isMatch = testRegex(regex, input);
    expect(isMatch).toBe(true);
  });

  it('should properly handle testRegex with valid and invalid regular expressions', () => {
    expect(testRegex('^\\d{3}$', '123')).toBe(true);
    expect(testRegex('^\\d{3}$', 'abc')).toBe(false);
    // Invalid regex pattern should return false instead of throwing
    expect(testRegex('[invalid regex(', 'abc')).toBe(false);
  });
});
