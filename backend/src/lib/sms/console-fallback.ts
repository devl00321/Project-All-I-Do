/**
 * console-fallback.ts
 * Development-only SMS provider that logs the OTP to stdout.
 *
 * SAFETY GATES — both must be true to use this provider:
 *   1. ALLOW_CONSOLE_OTP=true   must be explicitly set in .env
 *   2. MSG91_AUTH_KEY must NOT be set (prod key takes priority)
 *
 * This provider will NEVER be selected in production if MSG91_AUTH_KEY
 * is set, regardless of ALLOW_CONSOLE_OTP. See sms/index.ts for the
 * factory logic.
 *
 * The console output is deliberately loud and ugly so it is impossible
 * to miss if it ever leaks into a prod log stream.
 */

import type { SmsProvider } from './types';

export class ConsoleFallbackSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<void> {
    if (process.env.ALLOW_CONSOLE_OTP !== 'true') {
      throw new Error(
        '[SMS] ConsoleFallbackSmsProvider called but ALLOW_CONSOLE_OTP is not "true".\n' +
        'Set ALLOW_CONSOLE_OTP=true in .env to use the console fallback in development.',
      );
    }

    // Deliberately noisy output so this is never missed in logs
    const border = '!'.repeat(60);
    console.warn('\n' + border);
    console.warn('⚠️   DEV-ONLY OTP — NEVER SHIP THIS TO PRODUCTION   ⚠️');
    console.warn(border);
    console.warn(`  Phone : ${phone}`);
    console.warn(`  OTP   : ${otp}`);
    console.warn(border + '\n');
  }
}
