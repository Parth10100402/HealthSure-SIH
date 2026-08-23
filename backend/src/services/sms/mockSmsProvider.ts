// HealthSure — Mock SMS Provider for Development & CI
// backend/src/services/sms/mockSmsProvider.ts

import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';

export class MockSmsProvider implements ISmsProvider {
  readonly name = 'mock';
  readonly isConfigured = true;

  async sendOtp(mobile: string, otp: string): Promise<SendOtpResult> {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      const masked = mobile.length >= 4 ? `${'*'.repeat(mobile.length - 4)}${mobile.slice(-4)}` : mobile;
      console.log(`\n======================================================`);
      console.log(`📱 [DEV ONLY - MOCK SMS PROVIDER]`);
      console.log(`Recipient: +91-${masked}`);
      console.log(`Generated OTP: ${otp}`);
      console.log(`Message: <#> Your HealthSure verification code is ${otp}. Valid for 5 minutes.`);
      console.log(`======================================================\n`);
    }

    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      provider: this.name,
    };
  }
}
