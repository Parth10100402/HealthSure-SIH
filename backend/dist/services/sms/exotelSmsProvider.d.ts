import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';
export declare class ExotelSmsProvider implements ISmsProvider {
    readonly name = "exotel";
    get isConfigured(): boolean;
    sendOtp(mobile: string, otp: string): Promise<SendOtpResult>;
}
