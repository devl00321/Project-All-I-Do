/**
 * types.ts
 * SmsProvider interface — the contract all SMS implementations must satisfy.
 */

export interface SmsProvider {
  /**
   * Send a 6-digit OTP to the given E.164 phone number.
   * Throws on failure (network error, auth error, etc.).
   * Returns void on success.
   */
  sendOtp(phone: string, otp: string): Promise<void>;
}
