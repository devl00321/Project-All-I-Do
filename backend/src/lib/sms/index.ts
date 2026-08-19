/**
 * index.ts  (sms)
 * Factory: selects the right SmsProvider based on environment.
 *
 * Priority order:
 *   1. MSG91  — if MSG91_AUTH_KEY is set (production)
 *   2. Console fallback — if ALLOW_CONSOLE_OTP=true (development only)
 *   3. Throws — if neither is configured (fail-fast, clear error message)
 *
 * The singleton is cached after first creation so env vars are read
 * once per process, not on every OTP request.
 */

import type { SmsProvider } from './types';
import { Msg91SmsProvider } from './msg91';
import { ConsoleFallbackSmsProvider } from './console-fallback';

let _cachedProvider: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (_cachedProvider) return _cachedProvider;

  if (process.env.MSG91_AUTH_KEY) {
    _cachedProvider = new Msg91SmsProvider();
    return _cachedProvider;
  }

  if (process.env.ALLOW_CONSOLE_OTP === 'true') {
    console.warn(
      '[SMS] No MSG91_AUTH_KEY found. Using ConsoleFallbackSmsProvider.\n' +
      '      OTPs will be printed to stdout. DO NOT use in production.',
    );
    _cachedProvider = new ConsoleFallbackSmsProvider();
    return _cachedProvider;
  }

  throw new Error(
    '[SMS] No SMS provider configured.\n' +
    '  - For production: set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID\n' +
    '  - For development: set ALLOW_CONSOLE_OTP=true',
  );
}

export type { SmsProvider };
