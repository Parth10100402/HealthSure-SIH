// HealthSure — Doctor Controller
// backend/src/controllers/doctorController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';

export const getMyDoctorProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = dataStore.doctors[0];
    const appointments = dataStore.appointments.filter((a) => a.doctorId === doctor.id);

    const enriched = appointments.map((a) => {
      const pat = dataStore.patients.find((p) => p.id === a.patientId);
      const fac = dataStore.facilities.find((f) => f.id === a.facilityId);

      return {
        id: a.id,
        appointmentId: a.appointmentId,
        patientId: a.patientId,
        patientName: pat?.fullName || 'Parth Sharma',
        patientMobile: pat?.mobile,
        patientHealthId: pat?.patientId || 'HS-10248',
        time: a.startTime,
        date: a.date,
        type: a.mode === 'TELECONSULTATION' ? 'Teleconsult' : 'In-Person OPD',
        status: a.status.toLowerCase(),
        tokenNumber: a.token || 'OPD-01',
        reasonForVisit: a.reasonForVisit || 'Cardiology Review',
        facility: fac?.name || 'PHC Khed',
      };
    });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorReferrals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  } catch (error) {
    next(error);
  }
};

export const getDoctorFollowUps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const followUps = dataStore.followUps;

    const enriched = followUps.map((f) => {
      const pat = dataStore.patients.find((p) => p.id === f.patientId);
      const fac = dataStore.facilities.find((fac) => fac.id === f.facilityId);

      return {
        id: f.id,
        patientName: pat?.fullName || 'Parth Sharma',
        patientHealthId: pat?.patientId || 'HS-10248',
        speciality: f.speciality,
        dueDate: f.dueDate,
        mode: f.mode.toLowerCase(),
        status: f.status.toLowerCase(),
        instructions: f.instructions,
        facility: fac?.name || 'PHC Khed',
      };
    });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const completeConsultation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId, clinicalNotes, diagnosis, vitals, prescriptions, createFollowUpDays, followUpInstructions } = req.body;

    const apt = dataStore.appointments.find((a) => a.id === appointmentId || a.appointmentId === appointmentId);
    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    apt.status = 'COMPLETED';
    apt.updatedAt = new Date();

    // 1. Create Health Record
    const record = {
      id: 'hr-' + Date.now(),
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      facilityId: apt.facilityId,
      appointmentId: apt.id,
      recordType: 'CONSULTATION' as const,
      title: `${diagnosis || 'Clinical'} Consultation Record`,
      date: new Date().toISOString().split('T')[0],
      clinicalNotes: clinicalNotes || 'Patient completed specialist review. Vitals stable.',
      diagnosis: diagnosis || 'Clinical Assessment Complete',
      vitalsJson: vitals ? JSON.stringify(vitals) : undefined,
      prescriptionJson: prescriptions ? JSON.stringify(prescriptions) : undefined,
      createdAt: new Date(),
    };
    dataStore.healthRecords.unshift(record);

    // 2. Create Follow-Up if requested
    if (createFollowUpDays) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + (createFollowUpDays || 30));

      dataStore.followUps.unshift({
        id: 'fol-' + Date.now(),
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        facilityId: apt.facilityId,
        appointmentId: apt.id,
        speciality: 'Cardiology',
        dueDate: followUpDate.toISOString().split('T')[0],
        mode: 'TELECONSULTATION',
        status: 'UPCOMING',
        priority: 'NORMAL',
        instructions: followUpInstructions || 'Routine follow-up assessment via local PHC kiosk.',
        title: '30-Day Care Continuity Review',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Consultation completed. Health record and follow-up created.',
      data: {
        appointment: apt,
        healthRecord: record,
      },
    });
  } catch (error) {
    next(error);
  }
};
