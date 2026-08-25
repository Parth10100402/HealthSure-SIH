import { publishCloudAppointment } from '../db/cloudSync.js';
import { dataStore } from '../db/store.js';
import { bookOutreachSlotSchema } from '../schemas/validationSchemas.js';
export const getOutreachSchedules = async (req, res, next) => {
    try {
        const { speciality, phc, date } = req.query;
        let list = [...dataStore.outreachSchedules];
        if (speciality) {
            list = list.filter((o) => o.speciality.toLowerCase().includes(speciality.toLowerCase()));
        }
        if (phc) {
            list = list.filter((o) => o.destinationPHC.toLowerCase().includes(phc.toLowerCase()));
        }
        if (date) {
            list = list.filter((o) => o.date === date);
        }
        // Enrich with doctor and facility information
        const enriched = list.map((o) => {
            const doc = dataStore.doctors.find((d) => d.id === o.doctorId);
            const fac = dataStore.facilities.find((f) => f.id === o.hospitalId);
            return {
                ...o,
                doctorName: doc?.name || 'Dr. Specialist',
                specialistName: doc?.name || 'Dr. Specialist',
                doctorSpeciality: doc?.speciality || o.speciality,
                hospitalName: fac?.name || 'District Hospital Ratnagiri',
                utilizationRate: Math.round(((o.totalSlots - o.availableSlots) / o.totalSlots) * 100),
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
export const getOutreachById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const outreach = dataStore.outreachSchedules.find((o) => o.id === id || o.outreachId === id);
        if (!outreach) {
            res.status(404).json({ success: false, message: 'Specialist outreach session not found.' });
            return;
        }
        const doc = dataStore.doctors.find((d) => d.id === outreach.doctorId);
        const fac = dataStore.facilities.find((f) => f.id === outreach.hospitalId);
        res.json({
            success: true,
            data: {
                ...outreach,
                doctorName: doc?.name,
                hospitalName: fac?.name,
                utilizationRate: Math.round(((outreach.totalSlots - outreach.availableSlots) / outreach.totalSlots) * 100),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const bookOutreachSlot = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = bookOutreachSlotSchema.parse(req.body);
        let patientId = body.patientId;
        if (!patientId && req.user?.role === 'PATIENT') {
            const pat = dataStore.patients.find((p) => p.userId === req.user?.userId);
            patientId = pat?.id || dataStore.patients[0].id;
        }
        else if (!patientId) {
            patientId = dataStore.patients[0].id;
        }
        // Execute atomic slot decrement & appointment creation
        const { appointment, outreach } = dataStore.bookOutreachSlot(String(id), patientId, body.reasonForVisit);
        publishCloudAppointment(appointment);
        const doc = dataStore.doctors.find((d) => d.id === outreach.doctorId);
        res.status(201).json({
            success: true,
            data: {
                appointment,
                outreach: {
                    ...outreach,
                    doctorName: doc?.name,
                    utilizationRate: Math.round(((outreach.totalSlots - outreach.availableSlots) / outreach.totalSlots) * 100),
                },
            },
            message: 'Specialist outreach appointment successfully confirmed.',
        });
    }
    catch (error) {
        if (error.message.includes('no longer available') || error.message.includes('not found')) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
