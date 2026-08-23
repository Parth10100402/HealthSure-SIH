// HealthSure — Patient Domain Types
// frontend/src/types/patient.ts

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type AppointmentType = 'in-person' | 'outreach' | 'teleconsultation';

export interface PatientProfile {
  id: string; // e.g., 'HS-10248'
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  preferredLanguage: 'en' | 'hi' | 'mr';
  abhaId: string; // e.g., '91-2034-5821-9012'
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  registeredFacility: string;
}

export interface Appointment {
  id: string; // e.g., 'HS-APT-3012'
  doctorName: string;
  doctorQualification: string;
  speciality: string;
  facility: string;
  facilityType: 'PHC' | 'Sub-Centre' | 'District Hospital' | 'City Hospital';
  date: string; // YYYY-MM-DD
  time: string; // e.g., '10:30 AM'
  status: AppointmentStatus;
  type: AppointmentType;
  tokenNumber: string;
  roomNumber?: string;
  reasonForVisit: string;
  instructions?: string;
  isOutreachVisit?: boolean;
  outreachLocation?: string;
}

export interface SpecialistOutreach {
  id: string; // e.g., 'HS-OUT-101'
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  speciality: string;
  doctorName: string;
  doctorQualification: string;
  hospital: string;
  outreachLocation: string; // e.g., 'PHC Khed'
  outreachFacilityType: 'PHC' | 'Sub-Centre';
  date: string;
  timeSlot: string; // e.g., '09:00 AM - 01:00 PM'
  totalSlots: number;
  availableSlots: number;
  status: 'scheduled' | 'filling_fast' | 'completed';
  instructions: string[];
  contactPhone: string;
  distanceKmPlaceholder?: number;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  genericName: string;
  dosage: string; // e.g. '500 mg'
  frequency: string; // e.g. '1-0-1 (Twice daily after meals)'
  duration: string; // e.g. '14 Days'
  instructions: string;
}

export interface LabReportItem {
  id: string;
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'borderline' | 'abnormal';
}

export interface HealthRecord {
  id: string; // e.g., 'HS-REC-4501'
  date: string;
  facility: string;
  doctorName: string;
  speciality: string;
  recordType: 'consultation' | 'prescription' | 'diagnostic' | 'referral_summary';
  title: string;
  clinicalAssessmentNotes: string;
  vitals?: {
    bloodPressure?: string;
    pulseRate?: string;
    weightKg?: number;
    bloodSugarMgDl?: string;
    spo2Percent?: string;
  };
  prescriptions?: PrescriptionItem[];
  labReports?: LabReportItem[];
  followUpRecommendation?: string;
}

export type ReferralStatus =
  | 'created'
  | 'hospital_accepted'
  | 'appointment_scheduled'
  | 'patient_visit_pending'
  | 'consultation_completed'
  | 'follow_up_scheduled'
  | 'completed';

export interface ReferralTimelineStep {
  step: number;
  label: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  facility?: string;
  description: string;
}

export interface Referral {
  id: string; // e.g., 'HS-REF-7821'
  referralDate: string;
  fromFacility: string;
  toFacility: string;
  department: string;
  referringDoctor: string;
  receivingDoctor?: string;
  priority: 'Normal' | 'Urgent';
  clinicalReason: string;
  status: ReferralStatus;
  currentStepNumber: number; // 1 to 7
  timeline: ReferralTimelineStep[];
  nextActionLabel: string;
  nextActionRoute: string;
  qrCodeMock: string;
}

export type DiagnosticAvailability = 'available' | 'limited' | 'unavailable';

export interface DiagnosticTest {
  id: string;
  testName: string;
  category: 'Blood Tests' | 'Cardiology' | 'Radiology' | 'Urine / Stool' | 'General';
  facility: string;
  facilityType: 'PHC' | 'Sub-Centre' | 'District Hospital';
  availability: DiagnosticAvailability;
  lastUpdated: string;
  timing: string;
  turnaroundTime: string;
  prerequisites: string;
  isFreeGovtService: boolean;
}

export type MedicineAvailabilityStatus = 'available' | 'limited' | 'unavailable';

export interface MedicineStock {
  id: string;
  medicineName: string;
  genericName: string;
  category: 'Antibiotics' | 'Cardiovascular' | 'Diabetes' | 'Pain & Fever' | 'Respiratory' | 'Maternal & Child';
  facility: string;
  availability: MedicineAvailabilityStatus;
  stockStatusText: string;
  lastUpdated: string;
  dosageForm: string; // Tablet, Syrup, Injection, Ointment
  isEssentialDrug: boolean;
}

export interface Teleconsultation {
  id: string;
  appointmentId: string;
  doctorName: string;
  speciality: string;
  hospital: string;
  date: string;
  time: string;
  status: 'upcoming' | 'waiting' | 'in_consultation' | 'completed';
  meetingTokenMock: string;
  lowBandwidthModeSupported: boolean;
  instructions: string;
}

export interface FollowUp {
  id: string;
  title: string;
  doctorName: string;
  speciality: string;
  facility: string;
  dueDate: string;
  status: 'upcoming' | 'due' | 'completed' | 'overdue';
  mode: 'in-person' | 'teleconsultation';
  instructions: string;
  relatedRecordId?: string;
}

export interface PatientNotification {
  id: string;
  title: string;
  message: string;
  category: 'appointment' | 'referral' | 'outreach' | 'diagnostic' | 'medicine' | 'followup';
  timestamp: string;
  read: boolean;
  actionRoute?: string;
  actionLabel?: string;
}
