// HealthSure — Fast2SMS (India SMS Gateway) Production Provider
// backend/src/services/sms/fast2SmsProvider.ts

import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';

export class Fast2SmsProvider implements ISmsProvider {
  readonly name = 'fast2sms';

  get isConfigured(): boolean {
    const key = (process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY || '').trim();
    return key.length > 0;
  }

  async sendOtp(mobile: string, otp: string): Promise<SendOtpResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        provider: this.name,
        error: 'Fast2SMS credentials not configured. Please set SMS_API_KEY in your backend .env file.',
      };
    }

    const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanNumber || cleanNumber.length !== 10) {
      return {
        success: false,
        provider: this.name,
        error: 'Invalid 10-digit Indian mobile number format.',
      };
    }

    try {
      const rawKey = (process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY || '');
      const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();
      const rawRoute = (process.env.FAST2SMS_ROUTE || 'q').toLowerCase().trim();
      const senderId = process.env.SMS_SENDER_ID || 'HLTHSR';
      const templateId = process.env.FAST2SMS_DLT_TEMPLATE_ID;

      // Fast2SMS supports routes:
      // 1. 'q'   - Quick SMS route (custom text message)
      // 2. 'otp' - Fast2SMS OTP route (variables_values)
      // 3. 'dlt' - Enterprise DLT route with registered template ID
      let payload: Record<string, any>;

      if (rawRoute === 'q' || rawRoute === 'quick') {
        payload = {
          route: 'q',
          message: `Your HealthSure verification code is ${otp}. Valid for 5 minutes. Do not share.`,
          language: 'english',
          flash: 0,
          numbers: cleanNumber,
        };
      } else if (rawRoute === 'otp') {
        payload = {
          route: 'otp',
          variables_values: otp,
          numbers: cleanNumber,
          flash: 0,
        };
      } else {
        payload = {
          route: 'dlt',
          sender_id: senderId,
          numbers: cleanNumber,
          variables_values: otp,
          flash: 0,
        };
        if (templateId) {
          payload.message = templateId;
        }
      }

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as any;

      // Fast2SMS returns: { return: true, request_id: "...", message: ["SMS sent successfully."] }
      if (response.ok && data.return === true) {
        return {
          success: true,
          messageId: data.request_id || `fast2sms-${Date.now()}`,
          provider: this.name,
        };
      }

      // Handle granular provider errors safely without exposing secrets
      let errorMessage = 'Fast2SMS dispatch failed.';
      if (data.message) {
        errorMessage = Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
      } else if (response.status === 401) {
        errorMessage = 'Invalid Fast2SMS authorization key or suspended account.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid parameters, insufficient wallet credits, or DND restriction.';
      }

      console.error(`[Fast2SMS Error Response] Status ${response.status}: ${errorMessage}`);

      return {
        success: false,
        provider: this.name,
        error: errorMessage,
      };
    } catch (err: any) {
      console.error('[Fast2SMS Network Exception]:', err.message);
      return {
        success: false,
        provider: this.name,
        error: `Fast2SMS network failure: ${err.message}`,
      };
    }
  }
}
