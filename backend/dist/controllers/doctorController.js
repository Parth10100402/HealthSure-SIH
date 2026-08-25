import { syncCloudAppointments } from '../db/cloudSync.js';
import { dataStore } from '../db/store.js';
import { createUtcInstantFromIst, formatAppointmentTime, formatAppointmentDate } from '../utils/dateTime.js';
export const getMyDoctorProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        let doctor = dataStore.doctors.find((d) => d.userId === userId || d.id === req.user?.doctorId);
        if (!doctor) {
            doctor = dataStore.doctors[0];
        }
        const facility = dataStore.facilities.find((f) => f.id === doctor?.hospitalId);
        res.json({
            success: true,
            data: {
                ...doctor,
                hospitalName: facility?.name || 'District Hospital Ratnagiri',
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getDoctorAppointments = async (req, res, next) => {
    await syncCloudAppointments(dataStore);
    try {
        const doctor = dataStore.doctors.find((d) => d.userId === req.user?.userId || d.id === req.user?.doctorId) || dataStore.doctors[0];
        const appointments = dataStore.appointments.filter((a) => a.doctorId === doctor.id);
        const enriched = appointments.map((a) => {
            const pat = dataStore.patients.find((p) => p.id === a.patientId);
            const fac = dataStore.facilities.find((f) => f.id === a.facilityId);
            const scheduledAt = a.scheduledAt || createUtcInstantFromIst(a.date, a.startTime);
            const displayTime = formatAppointmentTime(scheduledAt);
            const displayDate = formatAppointmentDate(scheduledAt);
            const tele = dataStore.teleconsultations.find((t) => t.appointmentId === a.id || t.appointmentId === a.appointmentId || t.id === 'tele-001');
            return {
                id: a.id,
                appointmentId: a.appointmentId,
                patientId: a.patientId,
                patientName: pat?.fullName || 'Parth Sharma',
                patientMobile: pat?.mobile,
                patientHealthId: pat?.patientId || 'HS-10248',
                scheduledAt,
                time: displayTime,
                startTime: displayTime,
                date: displayDate,
                mode: a.mode === 'TELECONSULTATION' ? 'teleconsultation' : 'in-person',
                type: a.mode === 'TELECONSULTATION' ? 'Teleconsult' : 'In-Person OPD',
                status: a.status.toLowerCase(),
                tokenNumber: a.token || 'OPD-01',
                reasonForVisit: a.reasonForVisit || 'Cardiology Review',
                facility: fac?.name || 'PHC Khed',
                teleconsultId: tele?.id || 'tele-001',
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
export const getDoctorReferrals = async (req, res, next) => {
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
                speciality: r.speciality,
                priority: r.priority.toLowerCase(),
                status: r.status.toLowerCase(),
                fromFacility: fromFac?.name || 'PHC Khed',
                reason: r.reason,
                createdDate: r.createdAt.toISOString().split('T')[0],
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
export const getDoctorFollowUps = async (req, res, next) => {
    try {
        const followUps = dataStore.followUps;
        const enriched = followUps.map((f) => {
            const pat = dataStore.patients.find((p) => p.id === f.patientId);
            const fac = dataStore.facilities.find((f) => f.id === f.facilityId);
            return {
                id: f.id,
                patientName: pat?.fullName || 'Parth Sharma',
                patientHealthId: pat?.patientId || 'HS-10248',
                speciality: f.speciality,
                dueDate: f.dueDate,
                mode: f.mode.toLowerCase(),
                status: f.status.toLowerCase(),
                instructions: f.instructions,
                facilityName: fac?.name || 'PHC Khed',
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
export const completeConsultation = async (req, res, next) => {
    try {
        const { appointmentId, patientId, clinicalNotes, diagnosis, vitals, prescription, createFollowUpDays, followUpInstructions } = req.body;
        const doc = dataStore.doctors.find((d) => d.userId === req.user?.userId || d.id === req.user?.doctorId) || dataStore.doctors[0];
        const pat = dataStore.patients.find((p) => p.id === patientId) || dataStore.patients[0];
        const apt = dataStore.appointments.find((a) => a.id === appointmentId || a.appointmentId === appointmentId);
        if (apt) {
            apt.status = 'COMPLETED';
            apt.updatedAt = new Date();
        }
        const hrId = 'hr-' + Date.now();
        const newRecord = {
            id: hrId,
            patientId: pat.id,
            doctorId: doc.id,
            facilityId: doc.hospitalId,
            appointmentId: apt?.id,
            recordType: 'CONSULTATION',
            title: `Clinical Consultation - ${doc.speciality}`,
            date: new Date().toISOString().split('T')[0],
            clinicalNotes: clinicalNotes || 'Patient examined. Condition stable.',
            diagnosis: diagnosis || 'Clinical evaluation completed.',
            vitalsJson: JSON.stringify(vitals || {}),
            prescriptionJson: JSON.stringify(prescription || []),
            createdAt: new Date(),
        };
        dataStore.healthRecords.unshift(newRecord);
        let createdFollowUp = null;
        if (createFollowUpDays) {
            const dueDate = new Date(Date.now() + createFollowUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            createdFollowUp = {
                id: 'fol-' + Date.now(),
                patientId: pat.id,
                doctorId: doc.id,
                facilityId: doc.hospitalId,
                appointmentId: apt?.id,
                speciality: doc.speciality,
                dueDate,
                mode: 'TELECONSULTATION',
                status: 'UPCOMING',
                priority: 'NORMAL',
                instructions: followUpInstructions || 'Follow-up consultation.',
                title: `Follow-Up: ${doc.speciality} Review`,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            dataStore.followUps.unshift(createdFollowUp);
        }
        res.json({
            success: true,
            data: {
                healthRecord: newRecord,
                followUp: createdFollowUp,
            },
            message: 'Consultation successfully recorded with updated clinical records and continuity plan.',
        });
    }
    catch (error) {
        next(error);
    }
};
