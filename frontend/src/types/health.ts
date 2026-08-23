export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  hospitalType: 'Government' | 'Super Speciality' | 'Private Multi-Speciality' | 'Government Apex Institute' | string;
  image: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
  vicinityArea?: string;
  emergency24x7: boolean;
  insuranceAccepted: string[];
  insuranceDetails: {
    cashlessAvailable: boolean;
    tpaSupport: boolean;
    preAuthRequired: boolean;
    policyVerificationRequired: boolean;
  };
  specialties: string[];
  departments: string[];
  consultationFee: number;
  bedCount: number;
  phone: string;
  address: string;
  googleMapUrl: string;
  website: string;
  timings: string;
  popularDiseases: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  hospitalName: string;
  hospitalId: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  experienceYears: number;
  languages: string[];
  patientRating: number;
  reviewsCount: number;
  consultationFee: number;
  availableToday: boolean;
  onlineConsultation: boolean;
  offlineConsultation: boolean;
  avatar: string;
  availableSlots: string[];
  availableDays: string[];
  qualification?: string;
  appointmentStatus?: 'Available Today' | 'Slot Tomorrow' | 'Available On Call' | 'Available' | string;
}

export type ExtendedFollowUpStatus = 
  | 'No Follow-Up Needed'
  | 'Monitoring'
  | 'Follow-Up Recommended'
  | 'Follow-Up Scheduled'
  | 'Urgent Follow-Up'
  | 'Treatment Ongoing'
  | 'Awaiting Results'
  | 'Resolved';

export type FollowUpPriority = 'Low' | 'Moderate' | 'High' | 'Urgent';

export interface FollowUpTimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  statusTag?: ExtendedFollowUpStatus;
  updatedBy?: string;
}

export interface AIFollowUpRecommendation {
  recommendedAction: string;
  suggestedTimeline: string;
  suggestedSpecialist: string;
  reason: string;
  priority: FollowUpPriority;
}

export interface MedicalReport {
  id: string;
  title: string;
  date: string;
  patientName?: string;
  patientId?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | string;
  bloodGroup?: string;
  uploadedDate?: string;
  recommendations?: string[];
  type?: 'Blood Test' | 'CBC' | 'LFT' | 'KFT' | 'Thyroid' | 'MRI' | 'CT Scan' | 'X-Ray' | string;
  category?: string;
  department?: 'General Medicine' | 'Cardiology' | 'Neurology' | 'Orthopedics' | 'Gastroenterology' | 'Endocrinology' | 'Pulmonology' | string;
  condition?: 'Blood' | 'Diabetes' | 'Thyroid' | 'Liver' | 'Kidney' | 'Cardiac' | 'Respiratory' | string;
  diagnosis?: string;
  clinicalFindings?: string[] | string;
  healthScore?: number;
  status: 'Normal' | 'Requires Attention' | 'Action Needed' | 'Optimal' | string;
  
  // Follow-Up Workflow Fields
  followUpStatus?: ExtendedFollowUpStatus;
  clinicianNote?: string;
  nextFollowUpDate?: string;
  assignedSpecialist?: string;
  priority?: FollowUpPriority;
  followUpReason?: string;
  lastUpdated?: string;

  // Resolved State Fields
  resolutionNote?: string;
  resolvedDate?: string;

  // AI Recommendation & Timeline
  aiFollowUpRecommendation?: AIFollowUpRecommendation;
  followUpTimeline?: FollowUpTimelineEvent[];

  summary: string;
  fileUrl?: string;
  keyFindings?: string[];
  parameters?: { name: string; value: string; unit: string; referenceRange: string; status: string }[];
  normalValues?: { parameter: string; value: string; referenceRange: string }[];
  abnormalValues?: { parameter: string; value: string; referenceRange: string; status: 'High' | 'Low' | 'Critical'; impact: string }[];
  laymanExplanation?: string;
  possibleCauses?: string[];
  lifestyleSuggestions?: string[];
  dietRecommendations?: {
    foodsToEat: string[];
    foodsToAvoid: string[];
  };
  whenToConsultDoctor?: string;
}

export interface CostEstimateInput {
  disease: string;
  hospitalId: string;
  insuranceProvider: string;
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  description: string;
}

export interface CostEstimateResult {
  disease: string;
  hospitalName: string;
  insuranceName: string;
  itemizedCosts: CostBreakdownItem[];
  subtotal: number;
  estimatedInsuranceCoverage: number;
  outOfPocketMin: number;
  outOfPocketMax: number;
}

export interface SymptomCheckResult {
  symptoms: string[];
  urgencyLevel: 'Low' | 'Moderate' | 'High' | 'Emergency';
  possibleConditions: { condition: string; probability: number; description: string }[];
  recommendedSpecialist: string;
  recommendedHospitals: string[];
  disclaimer: string;
}

export interface VitalSign {
  name: string;
  value: string | number;
  unit: string;
  status: 'Optimal' | 'Normal' | 'Borderline' | 'High';
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

export interface MedicineSchedule {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timings?: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[];
  timeOfDay?: string;
  takenToday: boolean | { [time: string]: boolean };
  remainingPills?: number;
  totalPills?: number;
  refillNeeded?: boolean;
  prescribedBy?: string;
  instructions?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'Self' | 'Parent' | 'Child' | 'Spouse' | 'Grandparent' | 'Father' | 'Mother' | 'Daughter' | string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  avatar: string;
  phone?: string;
  email?: string;
  heightCm?: number;
  weightKg?: number;
  chronicConditions?: string[];
  abhaId?: string;
  insurancePolicyNumber?: string;
}

export interface Appointment {
  id: string;
  doctorId?: string;
  doctorName: string;
  specialty?: string;
  doctorSpecialty?: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  type: 'Video' | 'In-Person' | 'Offline' | string;
  tokenNumber?: number;
  estimatedWaitMins?: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | string;
  patientName: string;
  patientId?: string;
  consultationFee?: number;
}
