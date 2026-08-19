/**
 * validators.ts
 * Shared input validators for auth endpoints.
 * Each function returns an error string on failure, or null on success.
 */

/**
 * E.164 phone number format.
 * Examples: +919876543210, +14155552671, +442071838750
 *
 * Rule: '+' followed by 7–15 digits, first digit not zero.
 * (E.164 allows 1–15 digits after the country code, minimum total
 *  phone length is 8 chars: + + 1-digit CC + 6-digit national number)
 */
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function validateE164(value: unknown): string | null {
  if (typeof value !== 'string' || !value) {
    return 'phone is required.';
  }
  if (!E164_REGEX.test(value)) {
    return 'phone must be in E.164 format (e.g. +919876543210).';
  }
  return null;
}

export function validateRole(value: unknown): string | null {
  if (value !== 'customer' && value !== 'provider') {
    return 'role must be "customer" or "provider".';
  }
  return null;
}

export function validateOtp(value: unknown): string | null {
  if (typeof value !== 'string' || !value) {
    return 'otp is required.';
  }
  if (!/^\d{6}$/.test(value)) {
    return 'otp must be exactly 6 digits.';
  }
  return null;
}

export type Role = 'customer' | 'provider';
