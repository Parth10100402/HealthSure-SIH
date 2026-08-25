// HealthSure — Referral Controller
// backend/src/controllers/referralController.ts
import { dataStore } from '../db/store.js';
import { createReferralSchema, updateReferralStatusSchema } from '../schemas/validationSchemas.js';
export const getReferrals = async (req, res, next) => {
    try {
        const { status, priority, patientId, hospitalId, phcId } = req.query;
        let list = [...dataStore.referrals];
        // Filter by role if patient
        if (req.user?.role === 'PATIENT') {
            const pat = dataStore.patients.find((p) => p.userId === req.user?.userId);
            const pid = pat?.id || req.user.patientId;
            if (pid)
                list = list.filter((r) => r.patientId === pid);
        }
        else if (req.user?.role === 'HOSPITAL_STAFF') {
            // Show referrals received at hospital
            const dh = dataStore.facilities.find((f) => f.type === 'DISTRICT_HOSPITAL');
            if (dh)
                list = list.filter((r) => r.receivingHospitalId === dh.id);
        }
        if (status)
            list = list.filter((r) => r.status === status.toUpperCase());
        if (priority)
            list = list.filter((r) => r.priority === priority.toUpperCase());
        if (patientId)
            list = list.filter((r) => r.patientId === patientId);
        if (hospitalId)
            list = list.filter((r) => r.receivingHospitalId === hospitalId);
        if (phcId)
            list = list.filter((r) => r.referringFacilityId === phcId);
        // Enrich with facility, patient, doctor names
        const enriched = list.map((r) => {
            const pat = dataStore.patients.find((p) => p.id === r.patientId);
            const fromFac = dataStore.facilities.find((f) => f.id === r.referringFacilityId);
            const toFac = dataStore.facilities.find((f) => f.id === r.receivingHospitalId);
            const doc = dataStore.doctors.find((d) => d.id === r.referringDoctorId);
            return {
                ...r,
                patientName: pat?.fullName || 'Parth Sharma',
                patientMobile: pat?.mobile,
                patientHealthId: pat?.patientId || 'HS-10248',
                referringFacilityName: fromFac?.name || 'PHC Khed',
                receivingHospitalName: toFac?.name || 'District Hospital Ratnagiri',
                doctorName: doc?.name || 'Dr. Medical Officer',
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
export const getReferralById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ref = dataStore.referrals.find((r) => r.id === id || r.referralId === id);
        if (!ref) {
            res.status(404).json({ success: false, message: 'Referral record not found.' });
            return;
        }
        const pat = dataStore.patients.find((p) => p.id === ref.patientId);
        const fromFac = dataStore.facilities.find((f) => f.id === ref.referringFacilityId);
        const toFac = dataStore.facilities.find((f) => f.id === ref.receivingHospitalId);
        const doc = dataStore.doctors.find((d) => d.id === ref.referringDoctorId);
        res.json({
            success: true,
            data: {
                ...ref,
                patient: pat,
                referringFacility: fromFac,
                receivingHospital: toFac,
                doctor: doc,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const createReferral = async (req, res, next) => {
    try {
        const body = createReferralSchema.parse(req.body);
        const newRef = {
            id: 'ref-' + Date.now(),
            referralId: `HS-REF-${Math.floor(1000 + Math.random() * 9000)}`,
            patientId: body.patientId,
            referringFacilityId: body.referringFacilityId,
            receivingHospitalId: body.receivingHospitalId,
            referringDoctorId: req.user?.doctorId || dataStore.doctors[0].id,
            speciality: body.speciality,
            reason: body.reason,
            priority: body.priority,
            status: 'CREATED',
            tokenNumber: `TOKEN-${Math.floor(10 + Math.random() * 90)}`,
            turnaroundHours: 3.5,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        dataStore.referrals.unshift(newRef);
        // Notify patient
        const pat = dataStore.patients.find((p) => p.id === body.patientId);
        if (pat) {
            dataStore.notifications.unshift({
                id: 'notif-' + Date.now(),
                userId: pat.userId,
                type: 'SYSTEM',
                title: 'Referral Initiated',
                message: `Clinical referral ${newRef.referralId} initiated for ${newRef.speciality} consultation at District Hospital Ratnagiri.`,
                read: false,
                createdAt: new Date(),
            });
        }
        res.status(201).json({
            success: true,
            data: newRef,
            message: 'Referral successfully created.',
        });
    }
    catch (error) {
        next(error);
    }
};
export const patchReferral = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = updateReferralStatusSchema.parse(req.body);
        const ref = dataStore.referrals.find((r) => r.id === id || r.referralId === id);
        if (!ref) {
            res.status(404).json({ success: false, message: 'Referral record not found.' });
            return;
        }
        ref.status = body.status;
        if (body.tokenNumber)
            ref.tokenNumber = body.tokenNumber;
        ref.updatedAt = new Date();
        // If hospital accepted and scheduled appointment
        if (body.status === 'APPOINTMENT_SCHEDULED' || body.status === 'HOSPITAL_ACCEPTED') {
            const pat = dataStore.patients.find((p) => p.id === ref.patientId);
            if (pat) {
                dataStore.notifications.unshift({
                    id: 'notif-' + Date.now(),
                    userId: pat.userId,
                    type: 'REFERRAL_ACCEPTED',
                    title: 'Referral Accepted & Processed',
                    message: `Referral ${ref.referralId} accepted by District Hospital. Assigned token: ${ref.tokenNumber || 'DH-CARD-14'}`,
                    read: false,
                    createdAt: new Date(),
                });
            }
        }
        res.json({
            success: true,
            data: ref,
            message: `Referral status updated to ${ref.status}.`,
        });
    }
    catch (error) {
        next(error);
    }
};
