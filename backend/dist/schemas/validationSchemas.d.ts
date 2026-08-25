import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["patient", "doctor", "hospital_staff", "government_admin", "PATIENT", "DOCTOR", "HOSPITAL_STAFF", "ADMIN"]>>;
}, "strip", z.ZodTypeAny, {
    identifier: string;
    password: string;
    role?: "PATIENT" | "DOCTOR" | "HOSPITAL_STAFF" | "ADMIN" | "patient" | "doctor" | "hospital_staff" | "government_admin" | undefined;
}, {
    identifier: string;
    password: string;
    role?: "PATIENT" | "DOCTOR" | "HOSPITAL_STAFF" | "ADMIN" | "patient" | "doctor" | "hospital_staff" | "government_admin" | undefined;
}>;
export declare const sendOtpSchema: z.ZodObject<{
    mobile: z.ZodString;
    purpose: z.ZodDefault<z.ZodOptional<z.ZodEnum<["login", "registration"]>>>;
}, "strip", z.ZodTypeAny, {
    mobile: string;
    purpose: "login" | "registration";
}, {
    mobile: string;
    purpose?: "login" | "registration" | undefined;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    mobile: z.ZodString;
    otp: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mobile: string;
    otp: string;
    role?: string | undefined;
}, {
    mobile: string;
    otp: string;
    role?: string | undefined;
}>;
export declare const registerWithOtpSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    otp: z.ZodString;
    village: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    preferredLanguage: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    otp: string;
    fullName: string;
    phone: string;
    preferredLanguage: string;
    village?: string | undefined;
    district?: string | undefined;
}, {
    otp: string;
    fullName: string;
    phone: string;
    village?: string | undefined;
    district?: string | undefined;
    preferredLanguage?: string | undefined;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["PATIENT", "DOCTOR", "HOSPITAL_STAFF", "ADMIN"]>>;
    preferredLang: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    role: "PATIENT" | "DOCTOR" | "HOSPITAL_STAFF" | "ADMIN";
    name: string;
    preferredLang: string;
    phone?: string | undefined;
    email?: string | undefined;
}, {
    password: string;
    name: string;
    role?: "PATIENT" | "DOCTOR" | "HOSPITAL_STAFF" | "ADMIN" | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    preferredLang?: string | undefined;
}>;
export declare const createAppointmentSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    doctorId: z.ZodString;
    facilityId: z.ZodString;
    outreachId: z.ZodOptional<z.ZodString>;
    referralId: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    mode: z.ZodDefault<z.ZodEnum<["IN_PERSON", "OUTREACH", "TELECONSULTATION"]>>;
    reasonForVisit: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    doctorId: string;
    facilityId: string;
    mode: "IN_PERSON" | "OUTREACH" | "TELECONSULTATION";
    date?: string | undefined;
    patientId?: string | undefined;
    outreachId?: string | undefined;
    referralId?: string | undefined;
    scheduledAt?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    reasonForVisit?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    doctorId: string;
    facilityId: string;
    date?: string | undefined;
    patientId?: string | undefined;
    outreachId?: string | undefined;
    referralId?: string | undefined;
    scheduledAt?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    mode?: "IN_PERSON" | "OUTREACH" | "TELECONSULTATION" | undefined;
    reasonForVisit?: string | undefined;
    idempotencyKey?: string | undefined;
}>;
export declare const bookOutreachSlotSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    speciality: z.ZodOptional<z.ZodString>;
    reasonForVisit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId?: string | undefined;
    reasonForVisit?: string | undefined;
    speciality?: string | undefined;
}, {
    patientId?: string | undefined;
    reasonForVisit?: string | undefined;
    speciality?: string | undefined;
}>;
export declare const createReferralSchema: z.ZodObject<{
    patientId: z.ZodString;
    referringFacilityId: z.ZodString;
    receivingHospitalId: z.ZodString;
    speciality: z.ZodString;
    reason: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["NORMAL", "URGENT"]>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    speciality: string;
    referringFacilityId: string;
    receivingHospitalId: string;
    reason: string;
    priority: "NORMAL" | "URGENT";
}, {
    patientId: string;
    speciality: string;
    referringFacilityId: string;
    receivingHospitalId: string;
    reason: string;
    priority?: "NORMAL" | "URGENT" | undefined;
}>;
export declare const updateReferralStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["CREATED", "HOSPITAL_ACCEPTED", "APPOINTMENT_SCHEDULED", "PATIENT_VISIT", "CONSULTATION_COMPLETED", "FOLLOW_UP", "COMPLETED"]>;
    tokenNumber: z.ZodOptional<z.ZodString>;
    appointmentDate: z.ZodOptional<z.ZodString>;
    doctorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "COMPLETED" | "CREATED" | "HOSPITAL_ACCEPTED" | "APPOINTMENT_SCHEDULED" | "PATIENT_VISIT" | "CONSULTATION_COMPLETED" | "FOLLOW_UP";
    doctorId?: string | undefined;
    tokenNumber?: string | undefined;
    appointmentDate?: string | undefined;
}, {
    status: "COMPLETED" | "CREATED" | "HOSPITAL_ACCEPTED" | "APPOINTMENT_SCHEDULED" | "PATIENT_VISIT" | "CONSULTATION_COMPLETED" | "FOLLOW_UP";
    doctorId?: string | undefined;
    tokenNumber?: string | undefined;
    appointmentDate?: string | undefined;
}>;
export declare const createHealthRecordSchema: z.ZodObject<{
    patientId: z.ZodString;
    doctorId: z.ZodString;
    facilityId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    recordType: z.ZodDefault<z.ZodEnum<["CONSULTATION", "PRESCRIPTION", "DIAGNOSTIC", "REFERRAL", "FOLLOW_UP"]>>;
    title: z.ZodString;
    date: z.ZodString;
    clinicalNotes: z.ZodString;
    diagnosis: z.ZodOptional<z.ZodString>;
    vitals: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prescriptions: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    patientId: string;
    doctorId: string;
    facilityId: string;
    recordType: "FOLLOW_UP" | "CONSULTATION" | "PRESCRIPTION" | "DIAGNOSTIC" | "REFERRAL";
    title: string;
    clinicalNotes: string;
    appointmentId?: string | undefined;
    diagnosis?: string | undefined;
    vitals?: Record<string, any> | undefined;
    prescriptions?: Record<string, any>[] | undefined;
}, {
    date: string;
    patientId: string;
    doctorId: string;
    facilityId: string;
    title: string;
    clinicalNotes: string;
    appointmentId?: string | undefined;
    recordType?: "FOLLOW_UP" | "CONSULTATION" | "PRESCRIPTION" | "DIAGNOSTIC" | "REFERRAL" | undefined;
    diagnosis?: string | undefined;
    vitals?: Record<string, any> | undefined;
    prescriptions?: Record<string, any>[] | undefined;
}>;
export declare const createFollowUpSchema: z.ZodObject<{
    patientId: z.ZodString;
    doctorId: z.ZodString;
    facilityId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    speciality: z.ZodString;
    dueDate: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["IN_PERSON", "TELECONSULTATION"]>>;
    priority: z.ZodDefault<z.ZodEnum<["NORMAL", "URGENT"]>>;
    instructions: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    doctorId: string;
    facilityId: string;
    mode: "IN_PERSON" | "TELECONSULTATION";
    speciality: string;
    priority: "NORMAL" | "URGENT";
    title: string;
    dueDate: string;
    instructions: string;
    appointmentId?: string | undefined;
}, {
    patientId: string;
    doctorId: string;
    facilityId: string;
    speciality: string;
    title: string;
    dueDate: string;
    instructions: string;
    mode?: "IN_PERSON" | "TELECONSULTATION" | undefined;
    priority?: "NORMAL" | "URGENT" | undefined;
    appointmentId?: string | undefined;
}>;
export declare const updateFollowUpStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["UPCOMING", "DUE", "COMPLETED", "OVERDUE"]>;
}, "strip", z.ZodTypeAny, {
    status: "COMPLETED" | "UPCOMING" | "DUE" | "OVERDUE";
}, {
    status: "COMPLETED" | "UPCOMING" | "DUE" | "OVERDUE";
}>;
export declare const updatePatientProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    mobile: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    village: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    registeredPHC: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
    preferredLanguage: z.ZodOptional<z.ZodString>;
    abhaNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mobile?: string | undefined;
    fullName?: string | undefined;
    village?: string | undefined;
    district?: string | undefined;
    preferredLanguage?: string | undefined;
    email?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: string | undefined;
    state?: string | undefined;
    registeredPHC?: string | undefined;
    emergencyContact?: string | undefined;
    abhaNumber?: string | undefined;
}, {
    mobile?: string | undefined;
    fullName?: string | undefined;
    village?: string | undefined;
    district?: string | undefined;
    preferredLanguage?: string | undefined;
    email?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: string | undefined;
    state?: string | undefined;
    registeredPHC?: string | undefined;
    emergencyContact?: string | undefined;
    abhaNumber?: string | undefined;
}>;
