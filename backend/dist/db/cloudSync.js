// HealthSure — Multi-Tier Serverless State Synchronization
// backend/src/db/cloudSync.ts
const CHANNEL = 'healthsure-cloud-appointments-prod-v2';
const isTestEnv = () => process.env.NODE_ENV === 'test' ||
    process.env.DISABLE_CLOUD_SYNC === 'true' ||
    process.argv.some((arg) => arg.includes('test'));
export async function publishCloudAppointment(apt) {
    if (isTestEnv())
        return;
    try {
        await fetch(`https://ntfy.sh/${CHANNEL}/publish`, {
            method: 'POST',
            body: JSON.stringify(apt),
            signal: AbortSignal.timeout(2000),
        });
    }
    catch (err) {
        // Non-blocking relay fallback
    }
}
export async function syncCloudAppointments(store) {
    if (isTestEnv())
        return;
    try {
        const res = await fetch(`https://ntfy.sh/${CHANNEL}/json?poll=1&since=24h`, {
            signal: AbortSignal.timeout(2000),
        });
        if (!res.ok)
            return;
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
            if (!line)
                continue;
            try {
                const event = JSON.parse(line);
                if (event.event === 'message' && event.message) {
                    const apt = JSON.parse(event.message);
                    if (apt && (apt.id || apt.appointmentId)) {
                        // Check if already in store
                        const existing = store.appointments.find((e) => e.id === apt.id ||
                            e.appointmentId === apt.appointmentId ||
                            (apt.idempotencyKey && e.idempotencyKey === apt.idempotencyKey));
                        if (existing) {
                            if (apt.status && existing.status !== apt.status) {
                                existing.status = apt.status;
                                existing.updatedAt = new Date(apt.updatedAt || Date.now());
                            }
                        }
                        else {
                            store.appointments.unshift(apt);
                            // NOTE: Outreach slot counts are NOT modified here.
                            // Slots are authoritative-local and managed only by direct API calls (/book, /cancel).
                            // Decrementing here from replayed ntfy.sh history would corrupt slot counts.
                        }
                    }
                }
            }
            catch { }
        }
    }
    catch {
        // Graceful offline fallback
    }
}
