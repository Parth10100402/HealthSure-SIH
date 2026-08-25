// HealthSure — Twilio SMS Gateway Provider
// backend/src/services/sms/twilioSmsProvider.ts
export class TwilioSmsProvider {
    name = 'twilio';
    get isConfigured() {
        return Boolean(process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            (process.env.TWILIO_PHONE_NUMBER || process.env.SMS_SENDER_ID));
    }
    async sendOtp(mobile, otp) {
        if (!this.isConfigured) {
            return {
                success: false,
                provider: this.name,
                error: 'Twilio credentials not configured in environment (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN missing).',
            };
        }
        const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
        const destination = `+91${cleanNumber}`;
        try {
            const sid = process.env.TWILIO_ACCOUNT_SID;
            const token = process.env.TWILIO_AUTH_TOKEN;
            const from = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_SENDER_ID;
            const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
            const authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`;
            const params = new URLSearchParams();
            params.append('From', from);
            params.append('To', destination);
            params.append('Body', `<#> Your HealthSure verification code is ${otp}. Valid for 5 minutes.`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            const data = (await response.json());
            if (response.ok && data.sid) {
                return {
                    success: true,
                    messageId: data.sid,
                    provider: this.name,
                };
            }
            return {
                success: false,
                provider: this.name,
                error: data.message || 'Twilio SMS delivery failed',
            };
        }
        catch (err) {
            return {
                success: false,
                provider: this.name,
                error: `Twilio network exception: ${err.message}`,
            };
        }
    }
}
