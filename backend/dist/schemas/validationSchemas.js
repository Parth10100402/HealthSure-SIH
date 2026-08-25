// HealthSure — Zod Validation Schemas
// backend/src/schemas/validationSchemas.ts
import { z } from 'zod';
export const loginSchema = z.object({
    identifier: z.string().min(1, 'Identifier (email, phone, or ID) is required'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['patient', 'doctor', 'hospital_staff', 'government_admin', 'PATIENT', 'DOCTOR', 'HOSPITAL_STAFF', 'ADMIN']).optional(),
});
export const sendOtpSchema = z.object({
    mobile: z.string().min(10, 'Valid mobile number is required'),
    purpose: z.enum(['login', 'registration']).optional().default('login'),
});
export const verifyOtpSchema = z.object({
    mobile: z.string().min(10, 'Valid mobile number is required'),
    otp: z.string().min(4, 'OTP must be at least 4 digits').max(8, 'OTP must be at most 8 digits'),
    role: z.string().optional(),
});
export const registerWithOtpSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().min(10, 'Valid 10-digit phone number is required'),
    otp: z.string().min(4, 'Valid OTP code is required').max(8),
    village: z.string().optional(),
    district: z.string().optional(),
    preferredLanguage: z.string().optional().default('en'),
});
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['PATIENT', 'DOCTOR', 'HOSPITAL_STAFF', 'ADMIN']).default('PATIENT'),
    preferredLang: z.string().default('en'),
});
export const createAppointmentSchema = z.object({
    patientId: z.string().optional(),
    doctorId: z.string(),
    facilityId: z.string(),
    outreachId: z.string().optional(),
    referralId: z.string().optional(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string().optional(),
    mode: z.enum(['IN_PERSON', 'OUTREACH', 'TELECONSULTATION']).default('IN_PERSON'),
    reasonForVisit: z.string().optional(),
});
export const bookOutreachSlotSchema = z.object({
    patientId: z.string().optional(),
    speciality: z.string().optional(),
    reasonForVisit: z.string().optional(),
});
export const createReferralSchema = z.object({
    patientId: z.string(),
    referringFacilityId: z.string(),
    receivingHospitalId: z.string(),
    speciality: z.string(),
    reason: z.string().min(3, 'Clinical reason is required'),
    priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
});
export const updateReferralStatusSchema = z.object({
    status: z.enum([
        'CREATED',
        'HOSPITAL_ACCEPTED',
        'APPOINTMENT_SCHEDULED',
        'PATIENT_VISIT',
        'CONSULTATION_COMPLETED',
        'FOLLOW_UP',
        'COMPLETED',
    ]),
    tokenNumber: z.string().optional(),
    appointmentDate: z.string().optional(),
    doctorId: z.string().optional(),
});
export const createHealthRecordSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    facilityId: z.string(),
    appointmentId: z.string().optional(),
    recordType: z.enum(['CONSULTATION', 'PRESCRIPTION', 'DIAGNOSTIC', 'REFERRAL', 'FOLLOW_UP']).default('CONSULTATION'),
    title: z.string(),
    date: z.string(),
    clinicalNotes: z.string(),
    diagnosis: z.string().optional(),
    vitals: z.record(z.any()).optional(),
    prescriptions: z.array(z.record(z.any())).optional(),
});
export const createFollowUpSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    facilityId: z.string(),
    appointmentId: z.string().optional(),
    speciality: z.string(),
    dueDate: z.string(),
    mode: z.enum(['IN_PERSON', 'TELECONSULTATION']).default('IN_PERSON'),
    priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
    instructions: z.string(),
    title: z.string(),
});
export const updateFollowUpStatusSchema = z.object({
    status: z.enum(['UPCOMING', 'DUE', 'COMPLETED', 'OVERDUE']),
});
export const updatePatientProfileSchema = z.object({
    fullName: z.string().min(2).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email().optional(),
    village: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    registeredPHC: z.string().optional(),
    emergencyContact: z.string().optional(),
    preferredLanguage: z.string().optional(),
    abhaNumber: z.string().optional(),
});
