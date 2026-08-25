// HealthSure — Health Records Controller
// backend/src/controllers/healthRecordController.ts
import { dataStore } from '../db/store.js';
import { createHealthRecordSchema } from '../schemas/validationSchemas.js';
export const getHealthRecords = async (req, res, next) => {
    try {
        const { patientId, recordType } = req.query;
        let list = [...dataStore.healthRecords];
        if (req.user?.role === 'PATIENT') {
            const pat = dataStore.patients.find((p) => p.userId === req.user?.userId);
            const pid = pat?.id || req.user.patientId;
            if (pid)
                list = list.filter((r) => r.patientId === pid);
        }
        else if (patientId) {
            list = list.filter((r) => r.patientId === patientId);
        }
        if (recordType) {
            list = list.filter((r) => r.recordType === recordType.toUpperCase());
        }
        const enriched = list.map((r) => {
            const doc = dataStore.doctors.find((d) => d.id === r.doctorId);
            const fac = dataStore.facilities.find((f) => f.id === r.facilityId);
            return {
                ...r,
                doctorName: doc?.name || 'Dr. Ananya Mehta',
                doctorSpeciality: doc?.speciality || 'Cardiology',
                facilityName: fac?.name || 'PHC Khed',
                vitals: r.vitalsJson ? JSON.parse(r.vitalsJson) : undefined,
                prescriptions: r.prescriptionJson ? JSON.parse(r.prescriptionJson) : undefined,
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
export const getHealthRecordById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const record = dataStore.healthRecords.find((r) => r.id === id);
        if (!record) {
            res.status(404).json({ success: false, message: 'Health record not found.' });
            return;
        }
        const doc = dataStore.doctors.find((d) => d.id === record.doctorId);
        const fac = dataStore.facilities.find((f) => f.id === record.facilityId);
        res.json({
            success: true,
            data: {
                ...record,
                doctorName: doc?.name,
                facilityName: fac?.name,
                vitals: record.vitalsJson ? JSON.parse(record.vitalsJson) : undefined,
                prescriptions: record.prescriptionJson ? JSON.parse(record.prescriptionJson) : undefined,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const createHealthRecord = async (req, res, next) => {
    try {
        const body = createHealthRecordSchema.parse(req.body);
        const newRecord = {
            id: 'hr-' + Date.now(),
            patientId: body.patientId,
            doctorId: body.doctorId,
            facilityId: body.facilityId,
            appointmentId: body.appointmentId,
            recordType: body.recordType,
            title: body.title,
            date: body.date,
            clinicalNotes: body.clinicalNotes,
            diagnosis: body.diagnosis,
            vitalsJson: body.vitals ? JSON.stringify(body.vitals) : undefined,
            prescriptionJson: body.prescriptions ? JSON.stringify(body.prescriptions) : undefined,
            createdAt: new Date(),
        };
        dataStore.healthRecords.unshift(newRecord);
        res.status(201).json({
            success: true,
            data: newRecord,
            message: 'Health record added.',
        });
    }
    catch (error) {
        next(error);
    }
};
