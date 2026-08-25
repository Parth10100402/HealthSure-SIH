import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';
export declare class TwilioSmsProvider implements ISmsProvider {
    readonly name = "twilio";
    get isConfigured(): boolean;
    sendOtp(mobile: string, otp: string): Promise<SendOtpResult>;
}
