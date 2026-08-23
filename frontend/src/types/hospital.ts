// HealthSure — Hospital Staff Portal TypeScript Definitions
// frontend/src/types/hospital.ts

export interface HospitalProfile {
  id: string; // 'DH-RAT-001'
  name: string; // 'District Hospital Ratnagiri'
  type: 'District Hospital' | 'Sub-District Hospital' | 'Civil Hospital';
  district: string; // 'Ratnagiri'
  state: string; // 'Maharashtra'
  totalBeds: number; // 350
  occupiedBeds: number; // 284
  activeSpecialistsCount: number; // 28
  assignedPHCs: string[]; // ['PHC Khed', 'PHC Guhagar', 'Sub-Centre Chiplun', 'PHC Sangameshwar']
  contactPhone: string; // '+91 2352 222300'
  emergencyHelpline: string; // '108 / 102'
  nodalOfficer: string; // 'Dr. Suresh Mane (Civil Surgeon)'
}

export interface HospitalReferralEntry {
  id: string; // 'HS-REF-7821'
  patientId: string; // 'HS-10248'
  patientName: string; // 'Ramesh Sharma'
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientVillage: string; // 'Khed'
  referringPHC: string; // 'PHC Khed'
  referringDoctor: string; // 'Dr. Rajesh Patil'
  department: string; // 'Cardiology'
  assignedSpecialist?: string; // 'Dr. Ananya Mehta'
  dateReceived: string; // '2026-08-22'
  priority: 'Normal' | 'Urgent';
  clinicalReason: string;
  status: 'new' | 'accepted' | 'scheduled' | 'consultation_done' | 'rejected';
  scheduledDate?: string;
  scheduledTime?: string;
  tokenNumber?: string;
  opdRoom?: string;
}

export interface HospitalCapacityMetric {
  department: string;
  totalDailySlots: number;
  bookedSlots: number;
  specialistName: string;
  opdRoom: string;
  status: 'available' | 'near_capacity' | 'full';
  queueWaiting: number;
}

export interface HospitalDiagnosticInventory {
  id: string;
  testName: string;
  department: string;
  dailyCapacity: number;
  testsConductedToday: number;
  status: 'available' | 'limited' | 'unavailable';
  turnaroundTime: string;
  machineStatus: 'Operational' | 'Maintenance' | 'Calibration';
  isEmergencyAvailable: boolean;
}

export interface OutreachCampManagementItem {
  id: string;
  speciality: string;
  doctorName: string;
  destinationPHC: string;
  date: string;
  timeSlot: string;
  totalSlots: number;
  bookedSlots: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  driverOrTransportStatus: string;
  medicalKitSupplied: boolean;
}
