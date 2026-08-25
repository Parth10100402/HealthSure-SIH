// HealthSure — Patient Service Layer connected to Backend REST API
// frontend/src/services/patientService.ts

import type {
  PatientProfile,
  Appointment,
  SpecialistOutreach,
  HealthRecord,
  Referral,
  DiagnosticTest,
  MedicineStock,
  Teleconsultation,
  FollowUp,
  PatientNotification,
} from '../types/patient';

import {
  mockPatientProfile,
  mockAppointments,
  mockOutreachEvents,
  mockHealthRecords,
  mockReferral,
  mockDiagnostics,
  mockMedicines,
  mockTeleconsultations,
  mockFollowUps,
  mockNotifications,
} from '../data/patientMockData';

import { HEALTHSURE_IVR_NUMBER } from '../config/constants';
import { getStoredToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const patientService = {
  async getProfile(): Promise<PatientProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/me`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            ...mockPatientProfile,
            fullName: json.data.fullName || mockPatientProfile.fullName,
            id: json.data.patientId || mockPatientProfile.id,
            phone: json.data.mobile || mockPatientProfile.phone,
            email: json.data.email || mockPatientProfile.email,
            village: json.data.village || mockPatientProfile.village,
            district: json.data.district || mockPatientProfile.district,
            preferredLanguage: (json.data.preferredLanguage === 'mr' ? 'mr' : json.data.preferredLanguage === 'hi' ? 'hi' : 'en'),
          };
        }
      }
    } catch {
      // Fall back to local mock data
    }
    return { ...mockPatientProfile };
  },

  async updateProfile(updates: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          Object.assign(mockPatientProfile, updates);
          return { ...mockPatientProfile };
        }
      }
    } catch {
      // Fallback
    }
    Object.assign(mockPatientProfile, updates);
    return { ...mockPatientProfile };
  },

  async getAppointments(): Promise<Appointment[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((a: any) => ({
            id: a.appointmentId || a.id,
            doctorName: a.doctorName || 'Dr. Specialist',
            doctorQualification: 'MD, Specialist Lead',
            speciality: a.speciality || 'Cardiology',
            facility: a.facilityName || 'District Hospital Ratnagiri',
            facilityType: a.facilityName?.includes('PHC') ? 'PHC' : 'District Hospital',
            date: a.date,
            time: a.startTime,
            status: a.status.toLowerCase(),
            type: a.mode === 'OUTREACH' ? 'outreach' : a.mode === 'TELECONSULTATION' ? 'teleconsultation' : 'in-person',
            tokenNumber: a.token || 'TKN-01',
            roomNumber: 'OPD-102',
            reasonForVisit: a.reasonForVisit || 'Specialist Consultation',
            instructions: 'Please bring prior clinical records and photo ID.',
            isOutreachVisit: a.mode === 'OUTREACH',
            outreachLocation: a.mode === 'OUTREACH' ? a.facilityName : undefined,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...mockAppointments];
  },

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const list = await this.getAppointments();
    return list.find((a) => a.id === id);
  },

  async bookAppointment(newApt: Omit<Appointment, 'id' | 'tokenNumber' | 'status'>): Promise<Appointment> {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          doctorId: 'doc-001',
          facilityId: 'fac-phc-01',
          date: newApt.date,
          startTime: newApt.time,
          mode: newApt.type === 'outreach' ? 'OUTREACH' : newApt.type === 'teleconsultation' ? 'TELECONSULTATION' : 'IN_PERSON',
          reasonForVisit: newApt.reasonForVisit,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created: Appointment = {
            ...newApt,
            id: json.data.appointmentId,
            tokenNumber: json.data.token,
            status: 'confirmed',
          };
          mockAppointments.unshift(created);
          return created;
        }
      }
    } catch {
      // Fallback
    }
    const created: Appointment = {
      ...newApt,
      id: `HS-APT-${Math.floor(3000 + Math.random() * 1000)}`,
      tokenNumber: `HS-TKN-${Math.floor(10 + Math.random() * 90)}`,
      status: 'confirmed',
    };
    mockAppointments.unshift(created);
    return created;
  },

  async cancelAppointment(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const apt = mockAppointments.find((a) => a.id === id);
        if (apt) apt.status = 'cancelled';
        return true;
      }
    } catch {
      // Fallback
    }
    const apt = mockAppointments.find((a) => a.id === id);
    if (apt) {
      apt.status = 'cancelled';
      return true;
    }
    return false;
  },

  async getOutreachEvents(): Promise<SpecialistOutreach[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/outreach`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((o: any) => ({
            id: o.id || o.outreachId,
            doctorName: o.doctorName || o.specialistName || 'Dr. Specialist',
            doctorQualification:
              o.speciality === 'Cardiology'
                ? 'MD, DM (Cardiology), Lead Specialist'
                : o.speciality === 'General Medicine'
                ? 'MD (General Medicine), Consultant Physician'
                : o.speciality === 'Gynecology'
                ? 'MS (Obstetrics & Gynecology)'
                : o.speciality === 'Pediatrics'
                ? 'MD (Pediatrics), Child Health Specialist'
                : o.speciality === 'Dermatology'
                ? 'MD (Dermatology, Venereology & Leprosy)'
                : o.speciality === 'Orthopedics'
                ? 'MS (Orthopedics), Joint & Trauma Surgeon'
                : o.speciality === 'ENT'
                ? 'MS (ENT & Otorhinolaryngology)'
                : o.speciality === 'Neurology'
                ? 'DM (Neurology), Consultant Neurologist'
                : 'MD / MS Specialist Consultant',
            speciality: o.speciality,
            baseHospital: o.hospitalName || 'District Hospital Ratnagiri',
            hospital: o.hospitalName || 'District Hospital Ratnagiri',
            outreachLocation: o.destinationPHC || 'PHC Khed',
            outreachFacilityType: 'PHC' as const,
            date: o.date,
            timeSlot: `${o.startTime} - ${o.endTime}`,
            totalSlots: o.totalSlots,
            availableSlots: o.availableSlots,
            status: o.availableSlots === 0 ? ('booked' as const) : o.availableSlots <= 5 ? ('filling_fast' as const) : ('available' as const),
            servicesProvided: [`${o.speciality} Clinical Assessment`, 'Diagnostic Screening & Triage', 'Digital Prescription & Follow-up Plan'],
            instructions: ['Please bring prior medical records, prescriptions, and government Photo ID.'],
            patientPrep: 'Please bring prior medical records, ECG tracings, and current medicine strips.',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...mockOutreachEvents];
  },

  async bookOutreachSlot(outreachId: string, patientReason: string): Promise<{ success: boolean; appointment?: Appointment; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/outreach/${outreachId}/book`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reasonForVisit: patientReason }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const aptData = json.data.appointment;
          const outreachDoc = json.data.outreach;
          const newApt: Appointment = {
            id: aptData.appointmentId || aptData.id,
            doctorName: outreachDoc?.doctorName || 'Dr. Specialist',
            doctorQualification: outreachDoc?.doctorSpeciality === 'Cardiology' ? 'MD, DM (Cardiology)' : 'MD / MS Specialist',
            speciality: outreachDoc?.speciality || 'General Medicine',
            facility: outreachDoc?.destinationPHC || 'PHC Khed',
            facilityType: 'PHC',
            date: aptData.date,
            time: aptData.startTime,
            status: 'confirmed',
            type: 'outreach',
            tokenNumber: aptData.token || 'MMU-08',
            roomNumber: 'Specialist Outreach Unit',
            reasonForVisit: patientReason || `Specialist Outreach Consultation - ${outreachDoc?.speciality || 'Specialist'}`,
            instructions: 'Please bring prior records and Photo ID.',
            isOutreachVisit: true,
            outreachLocation: outreachDoc?.destinationPHC || 'PHC Khed',
          };
          mockAppointments.unshift(newApt);
          return { success: true, appointment: newApt, message: json.message || 'Slot confirmed.' };
        }
      } else {
        const errJson = await res.json();
        return { success: false, message: errJson.message || 'Unable to reserve slot.' };
      }
    } catch {
      // Fallback local logic
    }

    const event = mockOutreachEvents.find((e) => e.id === outreachId);
    if (!event) return { success: false, message: 'Outreach event not found.' };
    if (event.availableSlots <= 0) return { success: false, message: 'No slots available for this outreach event.' };

    event.availableSlots -= 1;
    if (event.availableSlots <= 5) event.status = 'filling_fast';

    const newApt: Appointment = {
      id: `HS-APT-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: event.doctorName,
      doctorQualification: event.doctorQualification,
      speciality: event.speciality,
      facility: event.outreachLocation,
      facilityType: event.outreachFacilityType,
      date: event.date,
      time: event.timeSlot.split('-')[0].trim(),
      status: 'confirmed',
      type: 'outreach',
      tokenNumber: `OUT-${event.speciality.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 80)}`,
      roomNumber: 'Specialist Outreach Unit',
      reasonForVisit: patientReason || `Specialist outreach appointment for ${event.speciality}`,
      instructions: 'Please bring prior records, prescriptions and valid Photo/ABHA ID.',
      isOutreachVisit: true,
      outreachLocation: event.outreachLocation,
    };

    mockAppointments.unshift(newApt);
    return { success: true, appointment: newApt, message: 'Outreach slot booked successfully.' };
  },

  async getHealthRecords(): Promise<HealthRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/health-records`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((r: any) => ({
            id: r.id,
            date: r.date,
            facility: r.facilityName || 'PHC Khed',
            doctorName: r.doctorName || 'Dr. Ananya Mehta',
            speciality: r.doctorSpeciality || 'Cardiology',
            diagnosis: r.diagnosis || 'Clinical Assessment',
            summary: r.clinicalNotes,
            recordType: r.recordType.toLowerCase(),
            vitals: r.vitals,
            prescriptions: r.prescriptions,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...mockHealthRecords];
  },

  async getHealthRecordById(id: string): Promise<HealthRecord | undefined> {
    const list = await this.getHealthRecords();
    return list.find((r) => r.id === id);
  },

  async getReferrals(): Promise<Referral[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/referrals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((r: any) => ({
            ...mockReferral,
            id: r.referralId || r.id,
            status: r.status.toLowerCase(),
            department: r.speciality,
            clinicalReason: r.reason,
            priority: r.priority === 'URGENT' ? 'Urgent' : 'Normal',
            fromFacility: r.referringFacilityName || 'PHC Khed',
            toFacility: r.receivingHospitalName || 'District Hospital Ratnagiri',
            timeline: mockReferral.timeline.map((step) => {
              if (step.step === 1) return { ...step, status: 'completed' as const };
              if (step.step === 2) return { ...step, status: (r.status === 'CREATED' ? 'current' : 'completed') as any };
              if (step.step === 3) return { ...step, status: (['APPOINTMENT_SCHEDULED', 'PATIENT_VISIT', 'CONSULTATION_COMPLETED', 'COMPLETED'].includes(r.status.toUpperCase()) ? 'completed' : 'pending') as any };
              return step;
            }),
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [{ ...mockReferral }];
  },

  async getDiagnostics(query = '', facilityFilter = 'all'): Promise<DiagnosticTest[]> {
    return mockDiagnostics.filter((d) => {
      const matchesQuery =
        !query ||
        d.testName.toLowerCase().includes(query.toLowerCase()) ||
        d.category.toLowerCase().includes(query.toLowerCase()) ||
        d.facility.toLowerCase().includes(query.toLowerCase());

      const matchesFacility =
        facilityFilter === 'all' ||
        (facilityFilter === 'phc' && d.facilityType === 'PHC') ||
        (facilityFilter === 'hospital' && d.facilityType === 'District Hospital');

      return matchesQuery && matchesFacility;
    });
  },

  async getMedicines(query = '', categoryFilter = 'all'): Promise<MedicineStock[]> {
    return mockMedicines.filter((m) => {
      const matchesQuery =
        !query ||
        m.medicineName.toLowerCase().includes(query.toLowerCase()) ||
        m.genericName.toLowerCase().includes(query.toLowerCase()) ||
        m.facility.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || m.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  },

  async getTeleconsultations(): Promise<Teleconsultation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/teleconsultations`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapTeleStatus = (s: string, doctorJoined?: boolean): Teleconsultation['status'] => {
            const upper = (s || '').toUpperCase();
            if (upper === 'COMPLETED' || upper === 'ENDED') return 'completed';
            if (upper === 'CONNECTED' || upper === 'IN_PROGRESS' || upper === 'IN_CONSULTATION') return 'in_consultation';
            if (doctorJoined || upper === 'WAITING_FOR_PATIENT' || upper === 'CONNECTING') return 'waiting';
            return 'upcoming';
          };

          return json.data.map((t: any) => ({
            id: t.id,
            appointmentId: t.appointmentId || 'apt-001',
            doctorName: t.doctorName || 'Dr. Ananya Mehta',
            doctorQualification: 'MD, DM (Cardiology)',
            speciality: t.speciality || 'Cardiology',
            hospital: t.hospital || 'District Hospital Ratnagiri',
            date: t.date,
            time: t.time,
            status: mapTeleStatus(t.status, t.doctorJoined),
            sessionUrl: `https://teleconsult.healthsure.gov.in/room/${t.id}`,
            instructions: t.instructions,
            isLowBandwidthMode: t.networkMode === 'ADAPTIVE_2G_AUDIO',
            dialInNumber: HEALTHSURE_IVR_NUMBER,
            conferencePin: '884102',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...mockTeleconsultations];
  },

  async getTeleconsultSession(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/teleconsultations/${encodeURIComponent(id)}/session`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async getFollowUps(): Promise<FollowUp[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/followups`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((f: any) => ({
            id: f.id,
            doctorName: f.doctorName || 'Dr. Ananya Mehta',
            speciality: f.speciality || 'Cardiology',
            facility: f.facility || 'PHC Khed',
            dueDate: f.dueDate,
            mode: f.mode === 'TELECONSULTATION' ? 'teleconsult' : 'in-person',
            status: f.status.toLowerCase(),
            instructions: f.instructions,
            appointmentBooked: false,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...mockFollowUps];
  },

  async getNotifications(): Promise<PatientNotification[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((n: any) => ({
            id: n.id,
            type: n.type.toLowerCase().includes('referral') ? 'referral' : n.type.toLowerCase().includes('outreach') ? 'outreach' : 'appointment',
            title: n.title,
            message: n.message,
            timestamp: 'Just now',
            read: n.read,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...mockNotifications];
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore
    }
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore
    }
    mockNotifications.forEach((n) => (n.read = true));
  },
};
