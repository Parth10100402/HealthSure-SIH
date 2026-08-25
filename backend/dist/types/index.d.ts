export type Role = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type FacilityType = 'SUB_CENTRE' | 'PHC' | 'SUB_DISTRICT_HOSPITAL' | 'DISTRICT_HOSPITAL' | 'HOSPITAL';
export type FacilityStatus = 'OPERATIONAL' | 'ATTENTION_REQUIRED';
export type AppointmentMode = 'IN_PERSON' | 'OUTREACH' | 'TELECONSULTATION';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'WAITING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type OutreachStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'NORMAL' | 'URGENT';
export type ReferralStatus = 'CREATED' | 'HOSPITAL_ACCEPTED' | 'APPOINTMENT_SCHEDULED' | 'PATIENT_VISIT' | 'CONSULTATION_COMPLETED' | 'FOLLOW_UP' | 'COMPLETED';
export type RecordType = 'CONSULTATION' | 'PRESCRIPTION' | 'DIAGNOSTIC' | 'REFERRAL' | 'FOLLOW_UP';
export type DiagnosticStatus = 'AVAILABLE' | 'LIMITED' | 'REFERRAL_REQUIRED' | 'UNAVAILABLE';
export type EquipmentStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'CALIBRATION';
export type DiagnosticReportStatus = 'PENDING' | 'READY' | 'DELIVERED';
export type TeleconsultStatus = 'SCHEDULED' | 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type NetworkMode = 'ADAPTIVE_2G_AUDIO' | 'HD_VIDEO';
export type FollowUpStatus = 'UPCOMING' | 'DUE' | 'COMPLETED' | 'OVERDUE';
export type NotificationType = 'APPOINTMENT_CONFIRMED' | 'REFERRAL_ACCEPTED' | 'FOLLOW_UP_DUE' | 'OUTREACH_AVAILABLE' | 'TELECONSULTATION_REMINDER' | 'SYSTEM';
export interface AuthTokenPayload {
    userId: string;
    role: Role;
    name: string;
    email?: string;
    preferredLang: string;
    patientId?: string;
    doctorId?: string;
    hospitalId?: string;
}
export interface UserEntity {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    passwordHash: string;
    role: Role;
    status: UserStatus;
    preferredLang: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface FacilityEntity {
    id: string;
    facilityId: string;
    name: string;
    type: FacilityType;
    district: string;
    taluka: string;
    state: string;
    contactPhone?: string;
    status: FacilityStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface PatientEntity {
    id: string;
    userId: string;
    patientId: string;
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    mobile?: string;
    email?: string;
    village?: string;
    district?: string;
    state: string;
    registeredPHC?: string;
    emergencyContact?: string;
    preferredLanguage: string;
    abhaNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface DoctorEntity {
    id: string;
    userId: string;
    doctorId: string;
    name: string;
    speciality: string;
    registrationNumber: string;
    hospitalId: string;
    designation?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SpecialistOutreachEntity {
    id: string;
    outreachId: string;
    doctorId: string;
    hospitalId: string;
    destinationPHC: string;
    speciality: string;
    date: string;
    startTime: string;
    endTime: string;
    totalSlots: number;
    availableSlots: number;
    status: OutreachStatus;
    mmuVehicleStatus: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ReferralEntity {
    id: string;
    referralId: string;
    patientId: string;
    referringFacilityId: string;
    receivingHospitalId: string;
    referringDoctorId?: string;
    speciality: string;
    reason: string;
    priority: Priority;
    status: ReferralStatus;
    tokenNumber?: string;
    turnaroundHours: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface AppointmentEntity {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    facilityId: string;
    outreachId?: string;
    referralId?: string;
    scheduledAt: string;
    date: string;
    startTime: string;
    endTime?: string;
    mode: AppointmentMode;
    status: AppointmentStatus;
    token?: string;
    reasonForVisit?: string;
    idempotencyKey?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface HealthRecordEntity {
    id: string;
    patientId: string;
    doctorId: string;
    facilityId: string;
    appointmentId?: string;
    recordType: RecordType;
    title: string;
    date: string;
    clinicalNotes: string;
    diagnosis?: string;
    vitalsJson?: string;
    prescriptionJson?: string;
    createdAt: Date;
}
export interface DiagnosticServiceEntity {
    id: string;
    facilityId: string;
    name: string;
    category: string;
    status: DiagnosticStatus;
    equipmentStatus: EquipmentStatus;
    estimatedTurnaround: string;
    dailyVolume: number;
    lastUpdated: Date;
}
export interface DiagnosticReportEntity {
    id: string;
    patientId: string;
    facilityId: string;
    testName: string;
    category: string;
    date: string;
    status: DiagnosticReportStatus;
    resultsSummary?: string;
    reportReference?: string;
    createdAt: Date;
}
export interface TeleconsultationEntity {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    status: TeleconsultStatus;
    networkMode: NetworkMode;
    startedAt?: Date;
    endedAt?: Date;
    durationSeconds: number;
    clinicalNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface FollowUpEntity {
    id: string;
    patientId: string;
    doctorId: string;
    facilityId: string;
    appointmentId?: string;
    speciality: string;
    dueDate: string;
    mode: AppointmentMode;
    status: FollowUpStatus;
    priority: Priority;
    instructions: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface NotificationEntity {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}
export interface OtpSessionEntity {
    id: string;
    mobile: string;
    otpHash: string;
    attempts: number;
    maxAttempts: number;
    expiresAt: Date;
    lastSentAt: Date;
    used: boolean;
    createdAt: Date;
    updatedAt: Date;
}
