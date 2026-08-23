// HealthSure — SMS Dispatch Service
// backend/src/services/sms/smsService.ts

import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';
import { MockSmsProvider } from './mockSmsProvider.js';
import { Fast2SmsProvider } from './fast2SmsProvider.js';
import { ExotelSmsProvider } from './exotelSmsProvider.js';
import { TwilioSmsProvider } from './twilioSmsProvider.js';

export class SmsService {
  private providers: Map<string, ISmsProvider> = new Map();
  private activeProviderName: string;

  constructor() {
    // Register available providers
    this.registerProvider(new MockSmsProvider());
    this.registerProvider(new Fast2SmsProvider());
    this.registerProvider(new ExotelSmsProvider());
    this.registerProvider(new TwilioSmsProvider());

    this.activeProviderName = (process.env.SMS_PROVIDER || 'mock').toLowerCase().trim();
  }

  registerProvider(provider: ISmsProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  getProvider(name?: string): ISmsProvider {
    const target = (name || process.env.SMS_PROVIDER || this.activeProviderName || 'mock').toLowerCase().trim();
    const provider = this.providers.get(target);
    if (!provider) {
      console.warn(`[SmsService] Unknown provider "${target}". Falling back to mock provider.`);
      return this.providers.get('mock')!;
    }
    return provider;
  }

  getActiveProviderName(): string {
    return (process.env.SMS_PROVIDER || this.activeProviderName || 'mock').toLowerCase().trim();
  }

  async sendOtp(mobile: string, otp: string, templateContext?: Record<string, any>): Promise<SendOtpResult> {
    const activeName = this.getActiveProviderName();
    const provider = this.getProvider(activeName);

    // If real provider is configured but missing credentials, report error
    if (activeName !== 'mock' && !provider.isConfigured) {
      console.error(`[SmsService] Active provider "${activeName}" is not configured with required environment variables.`);
      return {
        success: false,
        provider: activeName,
        error: `Real SMS provider "${activeName}" credentials missing in environment (.env).`,
      };
    }

    try {
      return await provider.sendOtp(mobile, otp, templateContext);
    } catch (err: any) {
      console.error(`[SmsService] Provider error in "${activeName}":`, err.message);
      return {
        success: false,
        provider: activeName,
        error: err.message || 'SMS delivery failed.',
      };
    }
  }
}

export const smsService = new SmsService();
