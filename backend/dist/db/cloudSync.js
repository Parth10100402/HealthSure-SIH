// HealthSure — Multi-Tier Serverless State Synchronization
// backend/src/db/cloudSync.ts
const CHANNEL = 'healthsure-cloud-appointments-prod-v2';
export async function publishCloudAppointment(apt) {
    try {
        await fetch(`https://ntfy.sh/${CHANNEL}/publish`, {
            method: 'POST',
            body: JSON.stringify(apt),
        });
    }
    catch (err) {
        console.warn('[CloudSync] Publish warning:', err);
    }
}
export async function syncCloudAppointments(store) {
    try {
        const res = await fetch(`https://ntfy.sh/${CHANNEL}/json?poll=1&since=24h`);
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
                        const exists = store.appointments.some((existing) => existing.id === apt.id ||
                            existing.appointmentId === apt.appointmentId ||
                            (apt.idempotencyKey && existing.idempotencyKey === apt.idempotencyKey));
                        if (!exists) {
                            store.appointments.unshift(apt);
                            // Update outreach slot if applicable
                            if (apt.outreachId) {
                                const outreach = store.outreachSchedules.find((o) => o.id === apt.outreachId || o.outreachId === apt.outreachId);
                                if (outreach && outreach.availableSlots > 0) {
                                    outreach.availableSlots -= 1;
                                }
                            }
                        }
                    }
                }
            }
            catch { }
        }
    }
    catch (err) {
        console.warn('[CloudSync] Sync warning:', err);
    }
}
