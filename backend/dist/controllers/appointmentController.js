// HealthSure — Appointments Controller
// backend/src/controllers/appointmentController.ts
import { dataStore } from '../db/store.js';
import { createAppointmentSchema } from '../schemas/validationSchemas.js';
export const getAppointments = async (req, res, next) => {
    try {
        const { status, mode, doctorId, patientId } = req.query;
        let list = [...dataStore.appointments];
        // Filter by role if patient
        if (req.user?.role === 'PATIENT') {
            const patient = dataStore.patients.find((p) => p.userId === req.user?.userId);
            const pid = patient?.id || req.user.patientId;
            if (pid)
                list = list.filter((a) => a.patientId === pid);
        }
        else if (req.user?.role === 'DOCTOR') {
            const doctor = dataStore.doctors.find((d) => d.userId === req.user?.userId);
            const did = doctor?.id || req.user.doctorId;
            if (did)
                list = list.filter((a) => a.doctorId === did);
        }
        if (status)
            list = list.filter((a) => a.status === status.toUpperCase());
        if (mode)
            list = list.filter((a) => a.mode === mode.toUpperCase());
        if (doctorId)
            list = list.filter((a) => a.doctorId === doctorId);
        if (patientId)
            list = list.filter((a) => a.patientId === patientId);
        // Enrich with patient and doctor details
        const enriched = list.map((a) => {
            const pat = dataStore.patients.find((p) => p.id === a.patientId);
            const doc = dataStore.doctors.find((d) => d.id === a.doctorId);
            const fac = dataStore.facilities.find((f) => f.id === a.facilityId);
            const tele = dataStore.teleconsultations.find((t) => t.appointmentId === a.id || t.id === a.id);
            return {
                ...a,
                patientName: pat?.fullName || 'Patient',
                patientMobile: pat?.mobile,
                doctorName: doc?.name || 'Dr. Specialist',
                speciality: doc?.speciality || 'General Medicine',
                facilityName: fac?.name || 'District Hospital Ratnagiri',
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
export const getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);
        if (!apt) {
            res.status(404).json({ success: false, message: 'Appointment not found.' });
            return;
        }
        const pat = dataStore.patients.find((p) => p.id === apt.patientId);
        const doc = dataStore.doctors.find((d) => d.id === apt.doctorId);
        const fac = dataStore.facilities.find((f) => f.id === apt.facilityId);
        res.json({
            success: true,
            data: {
                ...apt,
                patient: pat,
                doctor: doc,
                facility: fac,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const createAppointment = async (req, res, next) => {
    try {
        const body = createAppointmentSchema.parse(req.body);
        let patientId = body.patientId;
        if (!patientId && req.user?.role === 'PATIENT') {
            const pat = dataStore.patients.find((p) => p.userId === req.user?.userId);
            patientId = pat?.id || dataStore.patients[0].id;
        }
        else if (!patientId) {
            patientId = dataStore.patients[0].id;
        }
        const newApt = {
            id: 'apt-' + Date.now(),
            appointmentId: `HS-APT-${Math.floor(1000 + Math.random() * 9000)}`,
            patientId,
            doctorId: body.doctorId,
            facilityId: body.facilityId,
            outreachId: body.outreachId,
            referralId: body.referralId,
            date: body.date,
            startTime: body.startTime,
            endTime: body.endTime,
            mode: body.mode,
            status: 'CONFIRMED',
            token: `TOKEN-${Math.floor(10 + Math.random() * 90)}`,
            reasonForVisit: body.reasonForVisit || 'Specialist Consultation',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        dataStore.appointments.unshift(newApt);
        if (newApt.mode === 'TELECONSULTATION') {
            const teleId = `tele-${newApt.id}`;
            dataStore.teleconsultations.unshift({
                id: teleId,
                appointmentId: newApt.id,
                patientId: newApt.patientId,
                doctorId: newApt.doctorId,
                status: 'SCHEDULED',
                networkMode: 'HD_VIDEO',
                durationSeconds: 0,
                clinicalNotes: 'WebRTC P2P Teleconsultation Session',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        res.status(201).json({
            success: true,
            data: newApt,
            message: 'Appointment successfully scheduled.',
        });
    }
    catch (error) {
        next(error);
    }
};
export const patchAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);
        if (!apt) {
            res.status(404).json({ success: false, message: 'Appointment not found.' });
            return;
        }
        Object.assign(apt, req.body, { updatedAt: new Date() });
        res.json({
            success: true,
            data: apt,
            message: 'Appointment updated.',
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);
        if (!apt) {
            res.status(404).json({ success: false, message: 'Appointment not found.' });
            return;
        }
        apt.status = 'CANCELLED';
        apt.updatedAt = new Date();
        // If it was linked to outreach, release slot
        if (apt.outreachId) {
            const outreach = dataStore.outreachSchedules.find((o) => o.id === apt.outreachId);
            if (outreach && outreach.availableSlots < outreach.totalSlots) {
                outreach.availableSlots += 1;
            }
        }
        res.json({
            success: true,
            message: 'Appointment cancelled.',
        });
    }
    catch (error) {
        next(error);
    }
};
