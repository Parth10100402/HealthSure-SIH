// HealthSure — Doctor Portal TypeScript Definitions
// frontend/src/types/doctor.ts

export interface DoctorProfile {
  id: string; // e.g. 'DOC-CARD-1042'
  fullName: string; // 'Dr. Ananya Mehta'
  qualification: string; // 'MD, DM (Cardiology)'
  registrationNumber: string; // 'MMC/2014/08/3421'
  speciality: string; // 'Cardiology'
  hospital: string; // 'District Hospital Ratnagiri'
  department: string; // 'Department of Cardiology & Non-Invasive Diagnostics'
  opdRoom: string; // 'OPD Room 104'
  phone: string; // '+91 2352 222300'
  email: string; // 'ananya.mehta@districthospital.gov.in'
  experienceYears: number; // 12
  outreachAssignedPHCs: string[]; // ['PHC Khed', 'Sub-Centre Chiplun Rural', 'PHC Guhagar']
}

export interface DoctorConsultationForm {
  appointmentId: string;
  patientId: string;
  patientName: string;
  symptomsPresented: string;
  clinicalObservations: string;
  provisionalDiagnosis: string;
  vitals: {
    bloodPressure: string;
    pulseRate: string;
    spo2: string;
    bloodSugar?: string;
    weightKg?: string;
  };
  prescriptions: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  labTestsOrdered: string[];
  referralAdvised?: {
    destinationFacility: string;
    speciality: string;
    priority: 'Normal' | 'Urgent';
    reason: string;
  };
  followUpAdvisedDays: number;
  followUpMode: 'in-person' | 'teleconsultation';
  doctorNotes: string;
}

export interface DoctorAppointmentSummary {
  scheduledAt?: string;
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientVillage: string;
  referringPHC: string;
  time: string;
  date: string;
  speciality: string;
  tokenNumber: string;
  mode: 'in-person' | 'teleconsultation' | 'outreach';
  status: 'waiting' | 'in_consultation' | 'confirmed' | 'completed' | 'cancelled';
  reasonForVisit: string;
  referralId?: string;
  vitalsSummary?: string;
  priority: 'Normal' | 'Urgent';
}
