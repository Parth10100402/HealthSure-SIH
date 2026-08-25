// HealthSure — Database Seed CLI Script
// backend/src/db/seed.ts
import { dataStore } from './store.js';
async function main() {
    console.log('[Seed] Initializing HealthSure database seeds...');
    await dataStore.initialize();
    console.log(`[Seed] Successfully seeded:`);
    console.log(`  • ${dataStore.users.length} Users (Patient, Doctor, Hospital Staff, Admin)`);
    console.log(`  • ${dataStore.facilities.length} Healthcare Facilities (PHCs & District Hospitals)`);
    console.log(`  • ${dataStore.outreachSchedules.length} Specialist Outreach Deployments`);
    console.log(`  • ${dataStore.referrals.length} Clinical Referrals (HS-REF-7821)`);
    console.log(`  • ${dataStore.appointments.length} Confirmed Appointments`);
    console.log(`  • ${dataStore.healthRecords.length} Health Records`);
    console.log(`  • ${dataStore.followUps.length} Follow-up Trackers`);
}
main().catch((err) => {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
});
