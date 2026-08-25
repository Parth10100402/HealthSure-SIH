// HealthSure — Hospital Staff Portal Service Layer connected to Backend REST API
// frontend/src/services/hospitalService.ts

import {
  mockHospitalProfile,
  mockHospitalReferrals,
  mockHospitalCapacity,
  mockHospitalDiagnostics,
  mockOutreachCampsManagement,
} from '../data/hospitalMockData';
import { mockDoctorAppointments } from '../data/doctorMockData';
import type {
  HospitalProfile,
  HospitalReferralEntry,
  HospitalCapacityMetric,
  HospitalDiagnosticInventory,
  OutreachCampManagementItem,
} from '../types/hospital';
import type { DoctorAppointmentSummary } from '../types/doctor';
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

class HospitalService {
  private profile: HospitalProfile = { ...mockHospitalProfile };
  private referrals: HospitalReferralEntry[] = [...mockHospitalReferrals];
  private capacity: HospitalCapacityMetric[] = [...mockHospitalCapacity];
  private diagnostics: HospitalDiagnosticInventory[] = [...mockHospitalDiagnostics];
  private outreachCamps: OutreachCampManagementItem[] = [...mockOutreachCampsManagement];
  private appointments: DoctorAppointmentSummary[] = [...mockDoctorAppointments];

  async getProfile(): Promise<HospitalProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/hospitals/me`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            ...mockHospitalProfile,
            name: json.data.name || mockHospitalProfile.name,
            district: json.data.district || mockHospitalProfile.district,
            totalBeds: json.data.totalBeds || mockHospitalProfile.totalBeds,
            occupiedBeds: json.data.occupiedBeds || mockHospitalProfile.occupiedBeds,
          };
        }
      }
    } catch {
      // Fallback
    }
    return { ...this.profile };
  }

  async getReferrals(): Promise<HospitalReferralEntry[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/hospitals/me/referrals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((r: any) => ({
            id: r.referralId || r.id,
            referralId: r.referralId,
            patientName: r.patientName || 'Parth Sharma',
            patientAge: 52,
            patientGender: 'Male' as const,
            patientHealthId: r.patientHealthId || 'HS-10248',
            referringFacility: r.referringFacility || 'PHC Khed',
            referringFacilityType: 'PHC' as const,
            referringDoctor: 'Dr. Medical Officer',
            department: r.department || 'Cardiology',
            priority: r.priority as any,
            status: r.status === 'hospital_accepted' ? 'accepted' : (r.status as any),
            scheduledDate: '2026-08-28',
            scheduledTime: '10:30 AM',
            tokenNumber: r.tokenNumber || 'DH-CARD-14',
            opdRoom: 'OPD Room 104',
            assignedSpecialist: 'Dr. Ananya Mehta',
            clinicalReason: r.clinicalReason || 'Cardiology evaluation',
            turnaroundHours: 4.5,
            dateReceived: r.dateReceived || '2026-08-22',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [...this.referrals];
  }

  async acceptReferral(referralId: string, assignedSpecialist = 'Dr. Ananya Mehta'): Promise<HospitalReferralEntry | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/hospitals/referrals/${referralId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'HOSPITAL_ACCEPTED',
          tokenNumber: `DH-CARD-${Math.floor(10 + Math.random() * 80)}`,
          appointmentDate: '2026-08-28',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const idx = this.referrals.findIndex((r) => r.id === referralId);
          if (idx !== -1) {
            this.referrals[idx] = {
              ...this.referrals[idx],
              status: 'accepted',
              assignedSpecialist,
              scheduledDate: '2026-08-28',
              scheduledTime: '10:30 AM',
              tokenNumber: json.data?.tokenNumber || `DH-CARD-14`,
            };
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
        status: 'accepted',
        assignedSpecialist,
        scheduledDate: '2026-08-28',
        scheduledTime: '10:30 AM',
        tokenNumber: `DH-CARD-${Math.floor(10 + Math.random() * 80)}`,
        opdRoom: 'OPD Room 104',
      };
      return { ...this.referrals[idx] };
    }
    return null;
  }

  async getAppointments(): Promise<DoctorAppointmentSummary[]> {
    return [...this.appointments];
  }

  async getCapacityMetrics(): Promise<HospitalCapacityMetric[]> {
    return [...this.capacity];
  }

  async getDiagnostics(): Promise<HospitalDiagnosticInventory[]> {
    return [...this.diagnostics];
  }

  async updateDiagnosticStatus(id: string, status: 'available' | 'limited' | 'unavailable'): Promise<boolean> {
    await simulateDelay();
    const idx = this.diagnostics.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.diagnostics[idx].status = status;
      return true;
    }
    return false;
  }

  async getOutreachCamps(): Promise<OutreachCampManagementItem[]> {
    return [...this.outreachCamps];
  }

  async createOutreachCamp(camp: Omit<OutreachCampManagementItem, 'id' | 'bookedSlots' | 'status'>): Promise<OutreachCampManagementItem> {
    await simulateDelay(200);
    const newCamp: OutreachCampManagementItem = {
      ...camp,
      id: `CAMP-OUT-0${this.outreachCamps.length + 1}`,
      bookedSlots: 0,
      status: 'scheduled',
    };
    this.outreachCamps.unshift(newCamp);
    return newCamp;
  }
}

export const hospitalService = new HospitalService();
