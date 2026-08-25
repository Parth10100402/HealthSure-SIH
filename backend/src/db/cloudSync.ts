// HealthSure — Multi-Tier Serverless State Synchronization
// backend/src/db/cloudSync.ts

import type { AppointmentEntity } from '../types/index.js';
import type { DataStore } from './store.js';

const CHANNEL = 'healthsure-cloud-appointments-prod-v2';

export async function publishCloudAppointment(apt: AppointmentEntity): Promise<void> {
  try {
    await fetch(`https://ntfy.sh/${CHANNEL}/publish`, {
      method: 'POST',
      body: JSON.stringify(apt),
    });
  } catch (err) {
    console.warn('[CloudSync] Publish warning:', err);
  }
}

export async function syncCloudAppointments(store: DataStore): Promise<void> {
  try {
    const res = await fetch(`https://ntfy.sh/${CHANNEL}/json?poll=1&since=24h`);
    if (!res.ok) return;

    const text = await res.text();
    const lines = text.trim().split('\n');

    for (const line of lines) {
      if (!line) continue;
      try {
        const event = JSON.parse(line);
        if (event.event === 'message' && event.message) {
          const apt: AppointmentEntity = JSON.parse(event.message);
          if (apt && (apt.id || apt.appointmentId)) {
            // Check if already in store
            const exists = store.appointments.some(
              (existing: AppointmentEntity) =>
                existing.id === apt.id ||
                existing.appointmentId === apt.appointmentId ||
                (apt.idempotencyKey && existing.idempotencyKey === apt.idempotencyKey)
            );

            if (!exists) {
              store.appointments.unshift(apt);

              // Update outreach slot if applicable
              if (apt.outreachId) {
                const outreach = store.outreachSchedules.find(
                  (o: any) => o.id === apt.outreachId || o.outreachId === apt.outreachId
                );
                if (outreach && outreach.availableSlots > 0) {
                  outreach.availableSlots -= 1;
                }
              }
            }
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[CloudSync] Sync warning:', err);
  }
}
