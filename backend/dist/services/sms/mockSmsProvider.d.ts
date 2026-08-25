import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';
export declare class MockSmsProvider implements ISmsProvider {
    readonly name = "mock";
    readonly isConfigured = true;
    sendOtp(mobile: string, otp: string): Promise<SendOtpResult>;
}
