import { dataStore } from '../db/store.js';
import { createUtcInstantFromIst, formatAppointmentTime, formatAppointmentDate } from '../utils/dateTime.js';
import { publishCloudAppointment } from '../db/cloudSync.js';
export const getMyHospitalProfile = async (_req, res, next) => {
    try {
        const hospital = dataStore.facilities.find((f) => f.type === 'DISTRICT_HOSPITAL') || dataStore.facilities[4];
        res.json({
            success: true,
            data: {
                id: hospital.id,
                facilityId: hospital.facilityId,
                name: hospital.name,
                type: hospital.type,
                district: hospital.district,
                state: hospital.state,
                totalBeds: 350,
                occupiedBeds: 284,
                opdQueueLength: 42,
                activeOutreachCamps: dataStore.outreachSchedules.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getHospitalReferrals = async (_req, res, next) => {
    try {
        const referrals = dataStore.referrals;
        const enriched = referrals.map((r) => {
            const pat = dataStore.patients.find((p) => p.id === r.patientId);
            const fromFac = dataStore.facilities.find((f) => f.id === r.referringFacilityId);
            return {
                id: r.id,
                referralId: r.referralId,
                patientName: pat?.fullName || 'Parth Sharma',
                patientHealthId: pat?.patientId || 'HS-10248',
                referringFacility: fromFac?.name || 'PHC Khed',
                department: r.speciality,
                priority: r.priority.toLowerCase(),
                status: r.status.toLowerCase(),
                tokenNumber: r.tokenNumber || 'DH-CARD-14',
                clinicalReason: r.reason,
                dateReceived: r.createdAt.toISOString().split('T')[0],
            };
        });
        res.json({
            success: true,
            data: enriched,
        });
    }
    catch (error) {
        next(error);
    }
};
export const patchHospitalReferral = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, tokenNumber, appointmentDate } = req.body;
        const ref = dataStore.referrals.find((r) => r.id === id || r.referralId === id);
        if (!ref) {
            res.status(404).json({ success: false, message: 'Referral not found.' });
            return;
        }
        if (status)
            ref.status = status.toUpperCase();
        if (tokenNumber)
            ref.tokenNumber = tokenNumber;
        ref.updatedAt = new Date();
        // If accepting & scheduling, also ensure an appointment is created
        if (status === 'HOSPITAL_ACCEPTED' || status === 'APPOINTMENT_SCHEDULED') {
            const pat = dataStore.patients.find((p) => p.id === ref.patientId);
            const doc = dataStore.doctors[0];
            const fac = dataStore.facilities.find((f) => f.id === ref.receivingHospitalId) || dataStore.facilities[4];
            const targetDate = appointmentDate || '2026-08-28';
            const scheduledAt = createUtcInstantFromIst(targetDate, '10:30 AM');
            const newApt = {
                id: 'apt-' + Date.now(),
                appointmentId: `HS-APT-${Math.floor(1000 + Math.random() * 9000)}`,
                patientId: ref.patientId,
                doctorId: doc.id,
                facilityId: fac.id,
                referralId: ref.id,
                scheduledAt,
                date: formatAppointmentDate(scheduledAt),
                startTime: formatAppointmentTime(scheduledAt),
                endTime: '11:00 AM',
                mode: 'IN_PERSON',
                status: 'CONFIRMED',
                token: ref.tokenNumber || 'DH-CARD-14',
                reasonForVisit: `Referred ${ref.speciality} Consultation (${ref.referralId})`,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            dataStore.appointments.unshift(newApt);
            publishCloudAppointment(newApt);
            if (pat) {
                dataStore.notifications.unshift({
                    id: 'notif-' + Date.now(),
                    userId: pat.userId,
                    type: 'REFERRAL_ACCEPTED',
                    title: 'Referral Accepted by Hospital',
                    message: `Referral ${ref.referralId} accepted. Token ${newApt.token} assigned for ${newApt.date}.`,
                    read: false,
                    createdAt: new Date(),
                });
            }
        }
        res.json({
            success: true,
            data: ref,
            message: 'Referral successfully updated by hospital triage desk.',
        });
    }
    catch (error) {
        next(error);
    }
};
