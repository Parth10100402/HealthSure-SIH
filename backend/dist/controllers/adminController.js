import { syncCloudAppointments } from '../db/cloudSync.js';
import { dataStore } from '../db/store.js';
export const getAdminOverview = async (_req, res, next) => {
    await syncCloudAppointments(dataStore);
    try {
        const baseAppointments = 1240;
        const initialAptCount = 1;
        const validAppointments = dataStore.appointments.filter((a) => a.status !== 'CANCELLED');
        const totalAppointments = baseAppointments + Math.max(0, validAppointments.length - initialAptCount);
        const basePatients = 12840;
        const initialPatCount = 1;
        const patientsServed = basePatients + Math.max(0, dataStore.patients.length - initialPatCount);
        const totalReferrals = dataStore.referrals.length + 436;
        const completedReferrals = 381;
        const activeReferrals = dataStore.referrals.filter((r) => r.status !== 'COMPLETED').length + 55;
        const completionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 87;
        const totalOutreachSlots = dataStore.outreachSchedules.reduce((a, b) => a + b.totalSlots, 0);
        const bookedOutreachSlots = dataStore.outreachSchedules.reduce((a, b) => a + (b.totalSlots - b.availableSlots), 0);
        const baseTeleconsults = 1284;
        const initialTeleCount = 1;
        const teleconsultations = baseTeleconsults + Math.max(0, dataStore.teleconsultations.length - initialTeleCount);
        const followUpsDue = dataStore.followUps.filter((f) => f.status === 'DUE').length + 310;
        res.json({
            success: true,
            data: {
                indicators: {
                    patientsServed,
                    totalAppointments,
                    activeReferrals,
                    referralCompletionRate: completionRate,
                    specialistOutreachVisits: 126,
                    teleconsultations,
                    followUpsDue,
                },
                pipeline: [
                    { stage: 1, key: 'created', title: '1. PHC Created', count: 438 + (dataStore.referrals.length - 2), description: 'Referrals initiated by rural medical officers' },
                    { stage: 2, key: 'accepted', title: '2. Hospital Accepted', count: 426, description: 'Validated & triaged by district specialists' },
                    { stage: 3, key: 'scheduled', title: '3. Slot Reserved', count: 410, description: 'Appointments and OPD tokens assigned' },
                    { stage: 4, key: 'patient_visit', title: '4. Arrival Confirmed', count: 395, description: 'Patients registered at hospital desk' },
                    { stage: 5, key: 'consultation_done', title: '5. Consultation Done', count: 388, description: 'Specialist clinical assessment complete' },
                    { stage: 6, key: 'follow_up_done', title: '6. Counter-Referral', count: 382, description: 'Care summary synced back to local PHC' },
                    { stage: 7, key: 'completed', title: '7. Continuity Completed', count: 381, description: 'Patient receiving localized maintenance care' },
                ],
                bottlenecks: [
                    {
                        id: 'BOT-01',
                        category: 'referral_acceptance',
                        title: '12 Referrals Awaiting Hospital Triage',
                        count: 12,
                        severity: 'medium',
                        description: '12 cardiology and orthopaedics referrals from PHC Dapoli & Chiplun have been in pending state for >24 hours.',
                        affectedFacility: 'District Hospital Ratnagiri',
                        actionRecommendation: 'Notify Nodal Specialist Desk to expedite token triage.',
                    },
                    {
                        id: 'BOT-02',
                        category: 'patient_visit',
                        title: '8 Patients Not Arrived for Scheduled Transfer',
                        count: 8,
                        severity: 'high',
                        description: '8 rural patients missed their reserved OPD slot at District Hospital Ratnagiri due to rural transit delays.',
                        affectedFacility: 'PHC Khed / Sub-Centre Chiplun',
                        actionRecommendation: 'Trigger ASHA worker follow-up call & reschedule to next mobile outreach.',
                    },
                ],
                outreachUtilization: {
                    totalSlots: totalOutreachSlots,
                    bookedSlots: bookedOutreachSlots,
                    rate: totalOutreachSlots > 0 ? Math.round((bookedOutreachSlots / totalOutreachSlots) * 100) : 75,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminFacilities = async (_req, res, next) => {
    try {
        const list = dataStore.facilities.map((fac) => {
            const isDh = fac.type === 'DISTRICT_HOSPITAL';
            return {
                id: fac.id,
                facilityId: fac.facilityId,
                name: fac.name,
                type: fac.type,
                district: fac.district,
                taluka: fac.taluka,
                patientsServed: isDh ? 6420 : 1284,
                referralsSent: isDh ? 18 : 82,
                referralsReceived: isDh ? 284 : 6,
                referralCompletionRate: isDh ? 94 : 91,
                outreachVisitsCount: isDh ? 54 : 12,
                teleconsultationsCount: isDh ? 680 : 148,
                status: fac.status === 'OPERATIONAL' ? 'Operational' : 'Attention Required',
            };
        });
        res.json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminReferrals = async (_req, res, next) => {
    try {
        const list = dataStore.referrals.map((r) => {
            const pat = dataStore.patients.find((p) => p.id === r.patientId);
            const fromFac = dataStore.facilities.find((f) => f.id === r.referringFacilityId);
            const toFac = dataStore.facilities.find((f) => f.id === r.receivingHospitalId);
            return {
                id: r.referralId,
                patientId: pat?.patientId || 'HS-10248',
                patientName: pat?.fullName || 'Parth Sharma',
                fromFacility: fromFac?.name || 'PHC Khed',
                toHospital: toFac?.name || 'District Hospital Ratnagiri',
                speciality: r.speciality,
                priority: r.priority === 'URGENT' ? 'Urgent' : 'Normal',
                status: r.status.toLowerCase(),
                createdDate: r.createdAt.toISOString().split('T')[0],
                turnaroundHours: r.turnaroundHours,
            };
        });
        res.json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminOutreach = async (_req, res, next) => {
    try {
        const list = dataStore.outreachSchedules.map((o) => {
            const doc = dataStore.doctors.find((d) => d.id === o.doctorId);
            const fac = dataStore.facilities.find((f) => f.id === o.hospitalId);
            return {
                id: o.outreachId,
                doctorName: doc?.name || 'Dr. Ananya Mehta',
                speciality: o.speciality,
                parentHospital: fac?.name || 'District Hospital Ratnagiri',
                targetPHC: o.destinationPHC,
                district: 'Ratnagiri',
                date: o.date,
                totalSlots: o.totalSlots,
                bookedSlots: o.totalSlots - o.availableSlots,
                utilizationRate: Math.round(((o.totalSlots - o.availableSlots) / o.totalSlots) * 100),
                mmuStatus: o.mmuVehicleStatus.includes('Operational') ? 'Operational' : 'Scheduled',
            };
        });
        res.json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminTeleconsultations = async (_req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                total: 1284,
                completed: 1142,
                pending: 94,
                cancelled: 48,
                lowBandwidth2gCount: 874,
                lowBandwidthPercent: 68,
                avgDurationMinutes: 11.4,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminFollowUps = async (_req, res, next) => {
    try {
        const list = dataStore.followUps.map((f) => {
            const pat = dataStore.patients.find((p) => p.id === f.patientId);
            const fac = dataStore.facilities.find((fac) => fac.id === f.facilityId);
            return {
                id: f.id,
                patientId: pat?.patientId || 'HS-10248',
                facility: fac?.name || 'PHC Khed',
                speciality: f.speciality,
                dueDate: f.dueDate,
                mode: f.mode === 'TELECONSULTATION' ? 'teleconsultation' : 'in-person',
                status: f.status.toLowerCase(),
                priority: f.priority === 'URGENT' ? 'Urgent' : 'Normal',
            };
        });
        res.json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminReports = async (_req, res, next) => {
    try {
        res.json({
            success: true,
            data: [
                {
                    id: 'REP-01',
                    title: 'Monthly Rural Healthcare Access & Continuity Audit',
                    category: 'Continuity Performance',
                    period: 'August 2026',
                    description: 'Comprehensive analysis of patient footfall, inter-facility transfers, and local PHC resolution rates across Ratnagiri.',
                    lastGenerated: '2026-08-23',
                    fileSize: '2.4 MB',
                },
                {
                    id: 'REP-02',
                    title: 'Inter-Facility Referral Pipeline & Bottleneck Summary',
                    category: 'Referral Pipeline',
                    period: 'Q2 2026',
                    description: 'Detailed triage turnaround times, slot booking compliance, and drop-off rate tracking from PHC to District Hospital.',
                    lastGenerated: '2026-08-22',
                    fileSize: '1.8 MB',
                },
                {
                    id: 'REP-03',
                    title: 'Specialist Outreach MMU Utilization & Coverage Report',
                    category: 'Outreach Efficiency',
                    period: 'August 2026',
                    description: 'Weekly vehicle deployment metrics, doctor attendance, and slot utilization percentages across remote sub-centres.',
                    lastGenerated: '2026-08-21',
                    fileSize: '3.1 MB',
                },
            ],
        });
    }
    catch (error) {
        next(error);
    }
};
