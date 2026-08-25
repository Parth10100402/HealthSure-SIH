// HealthSure — Exotel India SMS Gateway Provider
// backend/src/services/sms/exotelSmsProvider.ts
export class ExotelSmsProvider {
    name = 'exotel';
    get isConfigured() {
        return Boolean(process.env.EXOTEL_ACCOUNT_SID &&
            process.env.EXOTEL_API_KEY &&
            process.env.EXOTEL_API_TOKEN);
    }
    async sendOtp(mobile, otp) {
        if (!this.isConfigured) {
            return {
                success: false,
                provider: this.name,
                error: 'Exotel credentials not configured in environment (EXOTEL_ACCOUNT_SID/EXOTEL_API_KEY/EXOTEL_API_TOKEN missing).',
            };
        }
        const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
        const destination = `+91${cleanNumber}`;
        try {
            const sid = process.env.EXOTEL_ACCOUNT_SID;
            const key = process.env.EXOTEL_API_KEY;
            const token = process.env.EXOTEL_API_TOKEN;
            const senderId = process.env.SMS_SENDER_ID || 'HLTHSR';
            const dltEntityId = process.env.EXOTEL_DLT_ENTITY_ID || '';
            const dltTemplateId = process.env.EXOTEL_DLT_TEMPLATE_ID || '';
            const url = `https://api.exotel.com/v1/Accounts/${sid}/Sms/send.json`;
            const authHeader = `Basic ${Buffer.from(`${key}:${token}`).toString('base64')}`;
            const params = new URLSearchParams();
            params.append('From', senderId);
            params.append('To', destination);
            params.append('Body', `<#> Your HealthSure verification code is ${otp}. Valid for 5 minutes. Do not share.`);
            if (dltEntityId)
                params.append('DltEntityId', dltEntityId);
            if (dltTemplateId)
                params.append('DltTemplateId', dltTemplateId);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            const data = (await response.json());
            if (response.ok && data.SMSMessage) {
                return {
                    success: true,
                    messageId: data.SMSMessage.Sid || `exotel-${Date.now()}`,
                    provider: this.name,
                };
            }
            return {
                success: false,
                provider: this.name,
                error: data.RestException?.Message || 'Exotel SMS delivery failed',
            };
        }
        catch (err) {
            return {
                success: false,
                provider: this.name,
                error: `Exotel network exception: ${err.message}`,
            };
        }
    }
}
