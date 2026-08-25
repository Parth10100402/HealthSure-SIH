import type { UserEntity, PatientEntity, DoctorEntity, FacilityEntity, AppointmentEntity, SpecialistOutreachEntity, ReferralEntity, HealthRecordEntity, FollowUpEntity, DiagnosticServiceEntity, DiagnosticReportEntity, TeleconsultationEntity, NotificationEntity, OtpSessionEntity } from '../types/index.js';
export declare class DataStore {
    users: UserEntity[];
    patients: PatientEntity[];
    doctors: DoctorEntity[];
    facilities: FacilityEntity[];
    appointments: AppointmentEntity[];
    specialistOutreaches: SpecialistOutreachEntity[];
    outreachSchedules: SpecialistOutreachEntity[];
    referrals: ReferralEntity[];
    healthRecords: HealthRecordEntity[];
    followUps: FollowUpEntity[];
    diagnosticServices: DiagnosticServiceEntity[];
    diagnosticReports: DiagnosticReportEntity[];
    teleconsultations: TeleconsultationEntity[];
    notifications: NotificationEntity[];
    otpSessions: OtpSessionEntity[];
    initialAppointmentCount: number;
    isInitialized: boolean;
    constructor();
    seed(): void;
    bookOutreachSlot(outreachId: string, patientId: string, reasonForVisit?: string): {
        appointment: AppointmentEntity;
        outreach: SpecialistOutreachEntity;
    };
    initialize(): Promise<void>;
    getOtpSession(mobile: string): OtpSessionEntity | undefined;
    createOrUpdateOtpSession(mobile: string, otp: string, expirySeconds?: number, maxAttempts?: number): Promise<OtpSessionEntity>;
    recordFailedOtpAttempt(mobile: string): number;
    markOtpSessionUsed(mobile: string): void;
}
export declare const dataStore: DataStore;
