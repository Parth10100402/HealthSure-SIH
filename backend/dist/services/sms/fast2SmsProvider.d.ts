import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';
export declare class Fast2SmsProvider implements ISmsProvider {
    readonly name = "fast2sms";
    get isConfigured(): boolean;
    sendOtp(mobile: string, otp: string): Promise<SendOtpResult>;
}
