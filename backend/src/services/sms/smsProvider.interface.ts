// HealthSure — SMS Provider Interface & Types
// backend/src/services/sms/smsProvider.interface.ts

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface ISmsProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  sendOtp(mobile: string, otp: string, templateContext?: Record<string, any>): Promise<SendOtpResult>;
}
