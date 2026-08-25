import { formatAppointmentTime, formatAppointmentDate } from '../utils/dateTime';
import {
  mockDoctorProfile,
  mockDoctorAppointments,
  mockDoctorReferrals,
  mockDoctorOutreachSchedule,
  mockDoctorFollowUps,
} from '../data/doctorMockData';
import { mockHealthRecords, mockPatientProfile } from '../data/patientMockData';
import type { DoctorProfile, DoctorAppointmentSummary, DoctorConsultationForm } from '../types/doctor';
import type { Referral, FollowUp, SpecialistOutreach, HealthRecord, PatientProfile } from '../types/patient';
import { getStoredToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const simulateDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class DoctorService {
  private profile: DoctorProfile = { ...mockDoctorProfile };
  private appointments: DoctorAppointmentSummary[] = [...mockDoctorAppointments];
  private referrals: Referral[] = [...mockDoctorReferrals];
  private outreach: SpecialistOutreach[] = [...mockDoctorOutreachSchedule];
  private followUps: FollowUp[] = [...mockDoctorFollowUps];
  private records: HealthRecord[] = [...mockHealthRecords];

  async getProfile(): Promise<DoctorProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/me`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            ...mockDoctorProfile,
            fullName: json.data.name || mockDoctorProfile.fullName,
            speciality: json.data.speciality || mockDoctorProfile.speciality,
            hospital: json.data.hospitalName || mockDoctorProfile.hospital,
            registrationNumber: json.data.registrationNumber || mockDoctorProfile.registrationNumber,
          };
        }
      }
    } catch {
      // Fallback
    }
    return { ...this.profile };
  }

  async getAppointments(): Promise<DoctorAppointmentSummary[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/me/appointments`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((a: any) => ({
            id: a.appointmentId || a.id,
            scheduledAt: a.scheduledAt,
            patientName: a.patientName || 'Parth Sharma',
            patientHealthId: a.patientHealthId || 'HS-10248',
            patientAge: 52,
            patientGender: 'Male' as const,
            patientVillage: 'Khed',
            referringPHC: a.facility || 'PHC Khed',
            date: formatAppointmentDate(a.scheduledAt || a.date),
            time: formatAppointmentTime(a.scheduledAt || a.time || a.startTime),
            speciality: 'Cardiology',
            mode: 'teleconsultation' as const,
            type: a.type.toLowerCase().includes('tele') ? ('teleconsult' as const) : ('in_person' as const),
            status: a.status.toLowerCase() as any,
            tokenNumber: a.tokenNumber || a.token || 'OPD-01',
            chiefComplaint: a.reasonForVisit || 'Specialist Evaluation',
            reasonForVisit: a.reasonForVisit || 'Specialist Evaluation',
            phcName: a.facility || 'PHC Khed',
            isOutreachSlot: false,
            priority: 'Normal' as const,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...this.appointments];
  }

  async getReferrals(): Promise<Referral[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/referrals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((r: any) => ({
            ...mockDoctorReferrals[0],
            id: r.referralId || r.id,
            referralId: r.referralId,
            patientName: r.patientName,
            status: r.status.toLowerCase(),
            speciality: r.speciality,
            reason: r.reason,
            sourceFacility: r.referringFacilityName || 'PHC Khed',
            destinationHospital: r.receivingHospitalName || 'District Hospital Ratnagiri',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...this.referrals];
  }

  async acceptReferral(referralId: string): Promise<Referral | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/referrals/${referralId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'HOSPITAL_ACCEPTED' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const idx = this.referrals.findIndex((r) => r.id === referralId);
          if (idx !== -1) {
            this.referrals[idx].status = 'hospital_accepted';
            return { ...this.referrals[idx] };
          }
        }
      }
    } catch {
      // Fallback
    }

    const idx = this.referrals.findIndex((r) => r.id === referralId);
    if (idx !== -1) {
      this.referrals[idx] = {
        ...this.referrals[idx],
        status: 'hospital_accepted',
      };
      return { ...this.referrals[idx] };
    }
    return null;
  }

  async getOutreachSchedule(): Promise<SpecialistOutreach[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/outreach`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((o: any) => ({
            id: o.id || o.outreachId,
            doctorName: o.doctorName || 'Dr. Ananya Mehta',
            doctorQualification: 'MD, DM (Cardiology)',
            speciality: o.speciality,
            baseHospital: o.hospitalName || 'District Hospital Ratnagiri',
            outreachLocation: o.destinationPHC || 'PHC Khed',
            outreachFacilityType: 'PHC' as const,
            date: o.date,
            timeSlot: `${o.startTime} - ${o.endTime}`,
            totalSlots: o.totalSlots,
            availableSlots: o.availableSlots,
            status: o.availableSlots === 0 ? ('booked' as const) : o.availableSlots <= 5 ? ('filling_fast' as const) : ('available' as const),
            servicesProvided: ['Cardiology Assessment', '12-Lead ECG Evaluation', '2D Echo Review'],
            patientPrep: 'Please bring medical records.',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...this.outreach];
  }

  async getFollowUps(): Promise<FollowUp[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/followups`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
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
    return [...this.followUps];
  }

  async getPatientClinicalRecord(_patientId: string): Promise<{ profile: PatientProfile; records: HealthRecord[] }> {
    return {
      profile: mockPatientProfile,
      records: this.records,
    };
  }

  async submitConsultation(form: DoctorConsultationForm): Promise<{ success: boolean; recordId: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/consultations/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          appointmentId: 'apt-001',
          diagnosis: form.provisionalDiagnosis,
          clinicalNotes: form.doctorNotes || form.clinicalObservations,
          vitals: form.vitals,
          prescriptions: form.prescriptions,
          createFollowUpDays: form.followUpAdvisedDays || 30,
          followUpInstructions: form.doctorNotes || 'Routine cardiology follow-up review.',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return { success: true, recordId: json.data?.healthRecord?.id || 'HS-REC-NEW' };
        }
      }
    } catch {
      // Fallback
    }

    await simulateDelay(200);
    const newRecordId = `HS-REC-${Date.now().toString().slice(-4)}`;
    return { success: true, recordId: newRecordId };
  }
}

export const doctorService = new DoctorService();
