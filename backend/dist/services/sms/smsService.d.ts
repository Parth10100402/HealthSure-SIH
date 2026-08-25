import type { ISmsProvider, SendOtpResult } from './smsProvider.interface.js';
export declare class SmsService {
    private providers;
    private activeProviderName;
    constructor();
    registerProvider(provider: ISmsProvider): void;
    getProvider(name?: string): ISmsProvider;
    getActiveProviderName(): string;
    sendOtp(mobile: string, otp: string, templateContext?: Record<string, any>): Promise<SendOtpResult>;
}
export declare const smsService: SmsService;
