/**
 * msg91.ts
 * MSG91 OTP API implementation.
 *
 * Required env vars:
 *   MSG91_AUTH_KEY    — your MSG91 auth key (from dashboard)
 *   MSG91_TEMPLATE_ID — the Flow OTP template ID you created in MSG91
 *
 * MSG91 Flow API: https://docs.msg91.com/reference/send-otp
 *
 * The phone number is sent WITHOUT the leading '+' to MSG91
 * (they expect international format without the plus sign).
 */

import type { SmsProvider } from './types';

interface Msg91Response {
  type: 'success' | 'error';
  message: string;
}

export class Msg91SmsProvider implements SmsProvider {
  private readonly authKey: string;
  private readonly templateId: string;

  constructor() {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey) {
      throw new Error('[MSG91] MSG91_AUTH_KEY env var is not set.');
    }
    if (!templateId) {
      throw new Error('[MSG91] MSG91_TEMPLATE_ID env var is not set.');
    }

    this.authKey = authKey;
    this.templateId = templateId;
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    // MSG91 wants the number without leading '+'
    const mobile = phone.startsWith('+') ? phone.slice(1) : phone;

    const body = JSON.stringify({
      template_id: this.templateId,
      mobile,
      otp,
      otp_length: 6,
      otp_expiry: 5,  // minutes — shown in the SMS template
    });

    let response: Response;
    try {
      response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': this.authKey,
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body,
      });
    } catch (networkErr) {
      throw new Error(`[MSG91] Network error: ${(networkErr as Error).message}`);
    }

    let data: Msg91Response;
    try {
      data = await response.json() as Msg91Response;
    } catch {
      const text = await response.text().catch(() => '(unreadable body)');
      throw new Error(`[MSG91] Non-JSON response (${response.status}): ${text}`);
    }

    if (!response.ok || data.type === 'error') {
      throw new Error(
        `[MSG91] API error (HTTP ${response.status}): ${data.message ?? 'unknown error'}`,
      );
    }
  }
}
