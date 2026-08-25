// HealthSure — Government & Public Health Admin TypeScript Definitions
// frontend/src/types/admin.ts

export type FacilityType = 'Sub-Centre' | 'PHC' | 'Sub-District Hospital' | 'District Hospital' | 'Civil Hospital';

export type FacilityStatus = 'Operational' | 'Attention Required';

export interface AdminProfile {
  id: string; // 'ADM-MH-001'
  fullName: string; // 'Maharashtra State Health Administrator'
  designation: string; // 'State Public Health Monitoring Officer'
  department: string; // 'Directorate of Health Services, Maharashtra'
  jurisdiction: string; // 'State of Maharashtra'
  assignedDistricts: string[]; // ['Ratnagiri', 'Sindhudurg', 'Raigad', 'Kolhapur']
  email: string;
  phone: string;
}

export interface AdminFilterOptions {
  state: string;
  district: string;
  facility: string;
  speciality?: string;
  dateRange?: string;
}

export interface PublicHealthIndicator {
  patientsServed: number; // e.g. 12840
  activeReferrals: number; // e.g. 438
  referralCompletionRate: number; // e.g. 87%
  specialistOutreachVisits: number; // e.g. 126
  teleconsultations: number; // e.g. 1284
  followUpsDue: number; // e.g. 312
}

export interface FacilityPerformance {
  id: string;
  name: string; // e.g. 'PHC Khed'
  type: FacilityType;
  district: string; // e.g. 'Ratnagiri'
  taluka: string;
  patientsServed: number;
  referralsSent: number;
  referralsReceived: number;
  referralCompletionRate: number; // %
  outreachVisitsCount: number;
  teleconsultationsCount: number;
  status: FacilityStatus;
  issueFlag?: string;
}

export interface ReferralPipelineStage {
  stage: number;
  key: string;
  title: string;
  count: number;
  description: string;
}

export interface SystemBottleneck {
  id: string;
  category: 'referral_acceptance' | 'appointment_scheduling' | 'patient_visit' | 'follow_up_overdue';
  title: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedFacility: string;
  actionRecommendation: string;
}

export interface AdminReferralRecord {
  id: string; // e.g. 'HS-REF-7821'
  patientId: string; // 'HS-10248'
  patientName: string; // 'Parth Sharma'
  fromFacility: string; // 'PHC Khed'
  toHospital: string; // 'District Hospital Ratnagiri'
  speciality: string; // 'Cardiology'
  priority: 'Normal' | 'Urgent';
  status: 'created' | 'accepted' | 'scheduled' | 'patient_visit' | 'consultation_done' | 'follow_up_done' | 'completed';
  createdDate: string;
  turnaroundHours: number;
}

export interface SpecialistOutreachRecord {
  id: string;
  doctorName: string;
  speciality: string;
  parentHospital: string;
  targetPHC: string;
  district: string;
  date: string;
  totalSlots: number;
  bookedSlots: number;
  utilizationRate: number; // %
  mmuStatus: 'Operational' | 'Scheduled' | 'Delayed';
}

export interface TeleconsultationStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  lowBandwidth2gCount: number;
  lowBandwidthPercent: number;
  avgDurationMinutes: number;
}

export interface AdminFollowUpRecord {
  id: string;
  patientId: string; // 'HS-10248'
  facility: string; // 'PHC Khed'
  speciality: string; // 'Cardiology'
  dueDate: string;
  mode: 'in-person' | 'teleconsultation';
  status: 'due' | 'upcoming' | 'completed' | 'overdue';
  priority: 'Normal' | 'Urgent';
}

export interface DiagnosticServiceAvailability {
  id: string;
  facility: string;
  facilityType: FacilityType;
  district: string;
  testName: string;
  category: string;
  status: 'Available' | 'Limited' | 'Referral Required' | 'Unavailable';
  equipmentStatus: 'Operational' | 'Maintenance' | 'Calibration';
  dailyVolume: number;
}

export interface AdminReportItem {
  id: string;
  title: string;
  category: string;
  period: string;
  description: string;
  lastGenerated: string;
  fileSize: string;
}
