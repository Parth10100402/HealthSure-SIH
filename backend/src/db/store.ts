// HealthSure — In-Memory Relational Data Store with Atomic Operations
// backend/src/db/store.ts

import bcrypt from 'bcryptjs';
import type {
  UserEntity,
  FacilityEntity,
  PatientEntity,
  DoctorEntity,
  SpecialistOutreachEntity,
  ReferralEntity,
  AppointmentEntity,
  HealthRecordEntity,
  DiagnosticServiceEntity,
  DiagnosticReportEntity,
  TeleconsultationEntity,
  FollowUpEntity,
  NotificationEntity,
  OtpSessionEntity,
  Role,
} from '../types/index.js';

class DataStore {
  public users: UserEntity[] = [];
  public facilities: FacilityEntity[] = [];
  public patients: PatientEntity[] = [];
  public doctors: DoctorEntity[] = [];
  public outreachSchedules: SpecialistOutreachEntity[] = [];
  public referrals: ReferralEntity[] = [];
  public appointments: AppointmentEntity[] = [];
  public healthRecords: HealthRecordEntity[] = [];
  public diagnosticServices: DiagnosticServiceEntity[] = [];
  public diagnosticReports: DiagnosticReportEntity[] = [];
  public teleconsultations: TeleconsultationEntity[] = [];
  public followUps: FollowUpEntity[] = [];
  public notifications: NotificationEntity[] = [];
  public otpSessions: OtpSessionEntity[] = [];

  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.seed();
    this.isInitialized = true;
    console.log('[DataStore] Seeded database with complete HealthSure demo data.');
  }

  public async seed(): Promise<void> {
    const passwordHash = await bcrypt.hash('demo1234', 10);

    // 1. Users
    const patientUser: UserEntity = {
      id: 'usr-patient-001',
      name: 'Ramesh Sharma',
      email: 'priya@example.com',
      phone: '+91 9876543210',
      passwordHash,
      role: 'PATIENT',
      status: 'ACTIVE',
      preferredLang: 'en',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const doctorUser: UserEntity = {
      id: 'usr-doctor-001',
      name: 'Dr. Ananya Mehta',
      email: 'dr.rajesh@healthsure.org',
      phone: '+91 9876543211',
      passwordHash,
      role: 'DOCTOR',
      status: 'ACTIVE',
      preferredLang: 'en',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const hospitalUser: UserEntity = {
      id: 'usr-hospital-001',
      name: 'Anita Sharma',
      email: 'anita@hospital.gov.in',
      phone: '+91 9876543212',
      passwordHash,
      role: 'HOSPITAL_STAFF',
      status: 'ACTIVE',
      preferredLang: 'en',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const adminUser: UserEntity = {
      id: 'usr-admin-001',
      name: 'Maharashtra State Health Administrator',
      email: 'admin.health@maharashtra.gov.in',
      phone: '+91 9876543213',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      preferredLang: 'en',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    this.users = [patientUser, doctorUser, hospitalUser, adminUser];

    // 2. Facilities
    const phcKhed: FacilityEntity = {
      id: 'fac-phc-01',
      facilityId: 'PHC-KHED-01',
      name: 'PHC Khed',
      type: 'PHC',
      district: 'Ratnagiri',
      taluka: 'Khed',
      state: 'Maharashtra',
      contactPhone: '02356-260124',
      status: 'OPERATIONAL',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const phcChiplun: FacilityEntity = {
      id: 'fac-phc-02',
      facilityId: 'PHC-CHIPLUN-01',
      name: 'PHC Chiplun',
      type: 'PHC',
      district: 'Ratnagiri',
      taluka: 'Chiplun',
      state: 'Maharashtra',
      contactPhone: '02355-252110',
      status: 'OPERATIONAL',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const phcDapoli: FacilityEntity = {
      id: 'fac-phc-03',
      facilityId: 'PHC-DAPOLI-01',
      name: 'PHC Dapoli',
      type: 'PHC',
      district: 'Ratnagiri',
      taluka: 'Dapoli',
      state: 'Maharashtra',
      contactPhone: '02358-282145',
      status: 'OPERATIONAL',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const phcGuhagar: FacilityEntity = {
      id: 'fac-phc-04',
      facilityId: 'PHC-GUHAGAR-01',
      name: 'PHC Guhagar',
      type: 'PHC',
      district: 'Ratnagiri',
      taluka: 'Guhagar',
      state: 'Maharashtra',
      contactPhone: '02359-240180',
      status: 'ATTENTION_REQUIRED',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const dhRatnagiri: FacilityEntity = {
      id: 'fac-dh-01',
      facilityId: 'DH-RAT-001',
      name: 'District Hospital Ratnagiri',
      type: 'DISTRICT_HOSPITAL',
      district: 'Ratnagiri',
      taluka: 'Ratnagiri',
      state: 'Maharashtra',
      contactPhone: '02352-222365',
      status: 'OPERATIONAL',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    const sdhSawantwadi: FacilityEntity = {
      id: 'fac-sdh-01',
      facilityId: 'SDH-SWT-001',
      name: 'Sub-District Hospital Sawantwadi',
      type: 'SUB_DISTRICT_HOSPITAL',
      district: 'Sindhudurg',
      taluka: 'Sawantwadi',
      state: 'Maharashtra',
      contactPhone: '02363-272044',
      status: 'OPERATIONAL',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    this.facilities = [phcKhed, phcChiplun, phcDapoli, phcGuhagar, dhRatnagiri, sdhSawantwadi];

    // 3. Patient Profile
    const patientProfile: PatientEntity = {
      id: 'pat-001',
      userId: patientUser.id,
      patientId: 'HS-10248',
      fullName: 'Ramesh Sharma',
      dateOfBirth: '1974-05-12',
      gender: 'Male',
      mobile: '+91 9876543210',
      email: 'priya@example.com',
      village: 'Khed Rural, Ratnagiri',
      district: 'Ratnagiri',
      state: 'Maharashtra',
      registeredPHC: 'PHC Khed',
      emergencyContact: 'Sunita Sharma (+91 9876543299)',
      preferredLanguage: 'en',
      abhaNumber: '91-4589-2041-8890',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    this.patients = [patientProfile];

    // 4. Doctor Profile
    const doctorProfile: DoctorEntity = {
      id: 'doc-001',
      userId: doctorUser.id,
      doctorId: 'DOC-CARD-1042',
      name: 'Dr. Ananya Mehta',
      speciality: 'Cardiology',
      registrationNumber: 'MCI-MH-2012-45891',
      hospitalId: dhRatnagiri.id,
      designation: 'Senior Consultant Cardiologist & Outreach Lead',
      status: 'active',
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-01'),
    };

    this.doctors = [doctorProfile];

    // 5. Specialist Outreach Schedules
    const outreach1: SpecialistOutreachEntity = {
      id: 'outreach-001',
      outreachId: 'OUT-MH-01',
      doctorId: doctorProfile.id,
      hospitalId: dhRatnagiri.id,
      destinationPHC: 'PHC Khed',
      speciality: 'Cardiology',
      date: '2026-08-28',
      startTime: '09:30 AM',
      endTime: '01:30 PM',
      totalSlots: 24,
      availableSlots: 6, // 18 already booked
      status: 'ACTIVE',
      mmuVehicleStatus: 'Operational (Van MH-08-AZ-4102)',
      createdAt: new Date('2026-08-10'),
      updatedAt: new Date('2026-08-10'),
    };

    const outreach2: SpecialistOutreachEntity = {
      id: 'outreach-002',
      outreachId: 'OUT-MH-02',
      doctorId: doctorProfile.id,
      hospitalId: dhRatnagiri.id,
      destinationPHC: 'PHC Chiplun',
      speciality: 'Cardiology & Internal Medicine',
      date: '2026-08-29',
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      totalSlots: 20,
      availableSlots: 8,
      status: 'SCHEDULED',
      mmuVehicleStatus: 'Operational',
      createdAt: new Date('2026-08-10'),
      updatedAt: new Date('2026-08-10'),
    };

    this.outreachSchedules = [outreach1, outreach2];

    // 6. Referral
    const referral1: ReferralEntity = {
      id: 'ref-001',
      referralId: 'HS-REF-7821',
      patientId: patientProfile.id,
      referringFacilityId: phcKhed.id,
      receivingHospitalId: dhRatnagiri.id,
      referringDoctorId: doctorProfile.id,
      speciality: 'Cardiology',
      reason: 'Persistent atypical chest discomfort with exertional dyspnea and ST-segment elevation on 12-lead ECG. Recommended for 2D-Echocardiography.',
      priority: 'NORMAL',
      status: 'HOSPITAL_ACCEPTED',
      tokenNumber: 'DH-CARD-14',
      turnaroundHours: 4.5,
      createdAt: new Date('2026-08-22T09:00:00Z'),
      updatedAt: new Date('2026-08-22T14:30:00Z'),
    };

    this.referrals = [referral1];

    // 7. Appointments
    const apt1: AppointmentEntity = {
      id: 'apt-001',
      appointmentId: 'HS-APT-1001',
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      facilityId: phcKhed.id,
      outreachId: outreach1.id,
      referralId: referral1.id,
      date: '2026-08-28',
      startTime: '10:30 AM',
      endTime: '11:00 AM',
      mode: 'OUTREACH',
      status: 'CONFIRMED',
      token: 'MMU-07',
      reasonForVisit: 'Specialist Outreach Cardiology Consultation & 2D Echo Examination',
      createdAt: new Date('2026-08-22T14:35:00Z'),
      updatedAt: new Date('2026-08-22T14:35:00Z'),
    };

    this.appointments = [apt1];

    // 8. Health Records
    const hr1: HealthRecordEntity = {
      id: 'hr-001',
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      facilityId: phcKhed.id,
      appointmentId: apt1.id,
      recordType: 'CONSULTATION',
      title: 'PHC Initial Triage & Cardiovascular Assessment',
      date: '2026-08-22',
      clinicalNotes: 'Patient presented with Grade II exertional dyspnea. Blood Pressure: 138/88 mmHg, Pulse: 78 bpm. Resting ECG showed ST deviations in V2-V4. Initiated Amlodipine 5mg OD. Initiated digital referral pass HS-REF-7821.',
      diagnosis: 'Hypertensive Heart Disease / Exertional Angina Suspect',
      vitalsJson: JSON.stringify({ bp: '138/88 mmHg', pulse: '78 bpm', spo2: '98%', temp: '98.4 F', weight: '68 kg' }),
      prescriptionJson: JSON.stringify([
        { medicine: 'Tab. Amlodipine 5mg', dosage: '1 Tab Daily (Morning)', duration: '30 Days' },
        { medicine: 'Tab. Aspirin 75mg', dosage: '1 Tab Daily (Post Meals)', duration: '30 Days' },
      ]),
      createdAt: new Date('2026-08-22T10:00:00Z'),
    };

    this.healthRecords = [hr1];

    // 9. Follow-Ups
    const fol1: FollowUpEntity = {
      id: 'fol-001',
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      facilityId: phcKhed.id,
      appointmentId: apt1.id,
      speciality: 'Cardiology',
      dueDate: '2026-08-28',
      mode: 'TELECONSULTATION',
      status: 'UPCOMING',
      priority: 'NORMAL',
      instructions: 'Review blood pressure log and post-outreach echocardiography findings via PHC tele-kiosk.',
      title: 'Post-Outreach Cardiology Review',
      createdAt: new Date('2026-08-22'),
      updatedAt: new Date('2026-08-22'),
    };

    this.followUps = [fol1];

    // 10. Teleconsultations
    const tele1: TeleconsultationEntity = {
      id: 'tele-001',
      appointmentId: apt1.id,
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      status: 'SCHEDULED',
      networkMode: 'ADAPTIVE_2G_AUDIO',
      durationSeconds: 0,
      clinicalNotes: 'Low-bandwidth adaptive node assigned.',
      createdAt: new Date('2026-08-22'),
      updatedAt: new Date('2026-08-22'),
    };

    this.teleconsultations = [tele1];

    // 11. Diagnostic Services
    this.diagnosticServices = [
      {
        id: 'diag-01',
        facilityId: phcKhed.id,
        name: 'Complete Blood Count (CBC)',
        category: 'Haematology',
        status: 'AVAILABLE',
        equipmentStatus: 'OPERATIONAL',
        estimatedTurnaround: '2 Hours',
        dailyVolume: 35,
        lastUpdated: new Date(),
      },
      {
        id: 'diag-02',
        facilityId: phcKhed.id,
        name: '12-Lead Electrocardiogram (ECG)',
        category: 'Cardiology',
        status: 'AVAILABLE',
        equipmentStatus: 'OPERATIONAL',
        estimatedTurnaround: '15 Minutes',
        dailyVolume: 18,
        lastUpdated: new Date(),
      },
      {
        id: 'diag-03',
        facilityId: phcKhed.id,
        name: '2D Echocardiography',
        category: 'Cardiology',
        status: 'REFERRAL_REQUIRED',
        equipmentStatus: 'OPERATIONAL',
        estimatedTurnaround: 'Teritary (District Hospital)',
        dailyVolume: 0,
        lastUpdated: new Date(),
      },
      {
        id: 'diag-04',
        facilityId: dhRatnagiri.id,
        name: '2D Echocardiography & Colour Doppler',
        category: 'Cardiology',
        status: 'AVAILABLE',
        equipmentStatus: 'OPERATIONAL',
        estimatedTurnaround: '45 Minutes',
        dailyVolume: 42,
        lastUpdated: new Date(),
      },
    ];

    // 12. Notifications
    this.notifications = [
      {
        id: 'notif-001',
        userId: patientUser.id,
        type: 'REFERRAL_ACCEPTED',
        title: 'Referral Accepted by District Hospital',
        message: 'Your cardiology referral HS-REF-7821 has been accepted by District Hospital Ratnagiri. Token: DH-CARD-14.',
        read: false,
        createdAt: new Date('2026-08-22T14:30:00Z'),
      },
      {
        id: 'notif-002',
        userId: patientUser.id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Specialist Outreach Slot Confirmed',
        message: 'Appointment reserved for Dr. Ananya Mehta on 28 August at PHC Khed.',
        read: false,
        createdAt: new Date('2026-08-22T14:35:00Z'),
      },
    ];
  }

  // ── Atomic Slot Booking Transaction ─────────────────────────────────────
  public bookOutreachSlot(outreachId: string, patientId: string, reason?: string): { appointment: AppointmentEntity; outreach: SpecialistOutreachEntity } {
    const outreach = this.outreachSchedules.find((o) => o.id === outreachId || o.outreachId === outreachId);
    if (!outreach) {
      throw new Error('Specialist outreach session not found.');
    }

    if (outreach.availableSlots <= 0) {
      throw new Error('Appointment slot is no longer available. All slots have been booked.');
    }

    const patient = this.patients.find((p) => p.id === patientId || p.userId === patientId);
    if (!patient) {
      throw new Error('Patient profile not found.');
    }

    // Atomic decrement
    outreach.availableSlots -= 1;
    outreach.updatedAt = new Date();

    const appointment: AppointmentEntity = {
      id: 'apt-' + Date.now(),
      appointmentId: `HS-APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      doctorId: outreach.doctorId,
      facilityId: outreach.hospitalId,
      outreachId: outreach.id,
      date: outreach.date,
      startTime: outreach.startTime,
      endTime: outreach.endTime,
      mode: 'OUTREACH',
      status: 'CONFIRMED',
      token: `MMU-${outreach.totalSlots - outreach.availableSlots}`,
      reasonForVisit: reason || `${outreach.speciality} Outreach Consultation at ${outreach.destinationPHC}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.appointments.unshift(appointment);

    // Create confirmation notification
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      userId: patient.userId,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Outreach Slot Confirmed',
      message: `Appointment confirmed with Dr. Ananya Mehta on ${outreach.date} at ${outreach.destinationPHC}. Token: ${appointment.token}`,
      read: false,
      createdAt: new Date(),
    });

    return { appointment, outreach };
  }

  // ─── OTP Session Management ────────────────────────────────────────────────
  public async createOrUpdateOtpSession(
    mobile: string,
    otp: string,
    expiresInSeconds = 300,
    maxAttempts = 5
  ): Promise<OtpSessionEntity> {
    const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
    const otpHash = await bcrypt.hash(otp, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

    const existingIdx = this.otpSessions.findIndex((s) => s.mobile === cleanNumber);

    const session: OtpSessionEntity = {
      id: `otp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mobile: cleanNumber,
      otpHash,
      attempts: 0,
      maxAttempts,
      expiresAt,
      lastSentAt: now,
      used: false,
      createdAt: now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      this.otpSessions[existingIdx] = session;
    } else {
      this.otpSessions.push(session);
    }

    return session;
  }

  public getOtpSession(mobile: string): OtpSessionEntity | undefined {
    const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
    return this.otpSessions.find((s) => s.mobile === cleanNumber);
  }

  public recordFailedOtpAttempt(mobile: string): number {
    const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
    const session = this.otpSessions.find((s) => s.mobile === cleanNumber);
    if (!session) return 0;
    session.attempts += 1;
    session.updatedAt = new Date();
    return session.attempts;
  }

  public markOtpSessionUsed(mobile: string): void {
    const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
    const session = this.otpSessions.find((s) => s.mobile === cleanNumber);
    if (session) {
      session.used = true;
      session.updatedAt = new Date();
    }
  }
}

export const dataStore = new DataStore();
