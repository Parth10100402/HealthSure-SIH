// HealthSure — Government & Public Health Admin Service Layer connected to Backend REST API
// frontend/src/services/adminService.ts

import type {
  AdminProfile,
  PublicHealthIndicator,
  FacilityPerformance,
  ReferralPipelineStage,
  SystemBottleneck,
  AdminReferralRecord,
  SpecialistOutreachRecord,
  TeleconsultationStats,
  AdminFollowUpRecord,
  DiagnosticServiceAvailability,
  AdminReportItem,
  AdminFilterOptions,
} from '../types/admin';

import {
  mockAdminProfile,
  mockPublicHealthIndicators,
  mockReferralPipeline,
  mockSystemBottlenecks,
  mockFacilityPerformances,
  mockAdminReferrals,
  mockSpecialistOutreachRecords,
  mockTeleconsultationStats,
  mockAdminFollowUps,
  mockDiagnosticAvailability,
  mockAdminReports,
} from '../data/adminMockData';

import { getStoredToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

class AdminService {
  async getProfile(): Promise<AdminProfile> {
    return { ...mockAdminProfile };
  }

  async getIndicators(filter?: AdminFilterOptions): Promise<PublicHealthIndicator> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.indicators) {
          return json.data.indicators;
        }
      }
    } catch {
      // Fallback
    }

    if (filter?.facility && filter.facility !== 'all') {
      const facility = mockFacilityPerformances.find((f) => f.name === filter.facility);
      if (facility) {
        return {
          patientsServed: facility.patientsServed,
          activeReferrals: facility.referralsSent,
          referralCompletionRate: facility.referralCompletionRate,
          specialistOutreachVisits: facility.outreachVisitsCount,
          teleconsultations: facility.teleconsultationsCount,
          followUpsDue: Math.round(facility.referralsSent * 0.4),
        };
      }
    }
    return { ...mockPublicHealthIndicators };
  }

  async getReferralPipeline(_filter?: AdminFilterOptions): Promise<ReferralPipelineStage[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.pipeline)) {
          return json.data.pipeline;
        }
      }
    } catch {
      // Fallback
    }
    return [...mockReferralPipeline];
  }

  async getBottlenecks(): Promise<SystemBottleneck[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.bottlenecks)) {
          return json.data.bottlenecks;
        }
      }
    } catch {
      // Fallback
    }
    return [...mockSystemBottlenecks];
  }

  async getFacilities(districtFilter?: string, typeFilter?: string): Promise<FacilityPerformance[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/facilities`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.filter((f: any) => {
            const matchDist = !districtFilter || districtFilter === 'all' || f.district.toLowerCase() === districtFilter.toLowerCase();
            const matchType = !typeFilter || typeFilter === 'all' || f.type.toLowerCase() === typeFilter.toLowerCase();
            return matchDist && matchType;
          });
        }
      }
    } catch {
      // Fallback
    }

    return mockFacilityPerformances.filter((f) => {
      const matchDist = !districtFilter || districtFilter === 'all' || f.district.toLowerCase() === districtFilter.toLowerCase();
      const matchType = !typeFilter || typeFilter === 'all' || f.type.toLowerCase() === typeFilter.toLowerCase();
      return matchDist && matchType;
    });
  }

  async getReferrals(search?: string, priorityFilter?: string, statusFilter?: string): Promise<AdminReferralRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/referrals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.filter((r: any) => {
            const matchSearch =
              !search ||
              r.id.toLowerCase().includes(search.toLowerCase()) ||
              r.patientName.toLowerCase().includes(search.toLowerCase()) ||
              r.fromFacility.toLowerCase().includes(search.toLowerCase());
            const matchPriority = !priorityFilter || priorityFilter === 'all' || r.priority === priorityFilter;
            const matchStatus = !statusFilter || statusFilter === 'all' || r.status === statusFilter;
            return matchSearch && matchPriority && matchStatus;
          });
        }
      }
    } catch {
      // Fallback
    }

    return mockAdminReferrals.filter((r) => {
      const matchSearch =
        !search ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.fromFacility.toLowerCase().includes(search.toLowerCase());
      const matchPriority = !priorityFilter || priorityFilter === 'all' || r.priority === priorityFilter;
      const matchStatus = !statusFilter || statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchPriority && matchStatus;
    });
  }

  async getSpecialistOutreach(facilityFilter?: string): Promise<SpecialistOutreachRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/outreach`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.filter((o: any) => {
            return !facilityFilter || facilityFilter === 'all' || o.targetPHC.toLowerCase().includes(facilityFilter.toLowerCase());
          });
        }
      }
    } catch {
      // Fallback
    }

    return mockSpecialistOutreachRecords.filter((o) => {
      return !facilityFilter || facilityFilter === 'all' || o.targetPHC.toLowerCase().includes(facilityFilter.toLowerCase());
    });
  }

  async getTeleconsultStats(): Promise<TeleconsultationStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/teleconsultations`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }
    return { ...mockTeleconsultationStats };
  }

  async getFollowUps(statusFilter?: string): Promise<AdminFollowUpRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/followups`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.filter((f: any) => !statusFilter || statusFilter === 'all' || f.status === statusFilter);
        }
      }
    } catch {
      // Fallback
    }
    return mockAdminFollowUps.filter((f) => !statusFilter || statusFilter === 'all' || f.status === statusFilter);
  }

  async getDiagnostics(facilityFilter?: string, categoryFilter?: string): Promise<DiagnosticServiceAvailability[]> {
    return mockDiagnosticAvailability.filter((d) => {
      const matchFac = !facilityFilter || facilityFilter === 'all' || d.facility.toLowerCase().includes(facilityFilter.toLowerCase());
      const matchCat = !categoryFilter || categoryFilter === 'all' || d.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchFac && matchCat;
    });
  }

  async getReports(): Promise<AdminReportItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports`, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }
    return [...mockAdminReports];
  }
}

export const adminService = new AdminService();
