// HealthSure — Production In-Memory Database Store with Demo Seed Data
// backend/src/db/store.ts
import bcrypt from 'bcryptjs';
class DataStore {
    users = [];
    patients = [];
    doctors = [];
    facilities = [];
    appointments = [];
    specialistOutreaches = [];
    outreachSchedules = [];
    referrals = [];
    healthRecords = [];
    followUps = [];
    diagnosticServices = [];
    diagnosticReports = [];
    teleconsultations = [];
    notifications = [];
    otpSessions = [];
    initialAppointmentCount = 1;
    isInitialized = false;
    constructor() {
        this.seed();
        this.isInitialized = true;
    }
    seed() {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync('demo1234', salt);
        // 1. Users
        const patientUser = {
            id: 'usr-patient-001',
            name: 'Parth Sharma',
            email: 'priya@example.com',
            phone: '+91 9876543210',
            passwordHash,
            role: 'PATIENT',
            status: 'ACTIVE',
            preferredLang: 'en',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doctorUser = {
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
        const hospitalUser = {
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
        const adminUser = {
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
        const phcKhed = {
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
        const phcChiplun = {
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
        const phcDapoli = {
            id: 'fac-phc-03',
            facilityId: 'PHC-DAPOLI-01',
            name: 'PHC Dapoli',
            type: 'PHC',
            district: 'Ratnagiri',
            taluka: 'Dapoli',
            state: 'Maharashtra',
            contactPhone: '02358-282033',
            status: 'OPERATIONAL',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const phcGuhagar = {
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
        const dhRatnagiri = {
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
        const dhPune = {
            id: 'fac-dh-02',
            facilityId: 'DH-PUN-001',
            name: 'District Hospital Pune',
            type: 'DISTRICT_HOSPITAL',
            district: 'Pune',
            taluka: 'Pune',
            state: 'Maharashtra',
            contactPhone: '020-26123456',
            status: 'OPERATIONAL',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const sdhSawantwadi = {
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
        this.facilities = [phcKhed, phcChiplun, phcDapoli, phcGuhagar, dhRatnagiri, dhPune, sdhSawantwadi];
        // 3. Patient Profile
        const patientProfile = {
            id: 'pat-001',
            userId: patientUser.id,
            patientId: 'HS-10248',
            fullName: 'Parth Sharma',
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
        // 4. Doctor Profiles (8 Specialists)
        const doc1 = {
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
        const doc2 = {
            id: 'doc-002',
            userId: 'usr-doctor-002',
            doctorId: 'DOC-MED-2019',
            name: 'Dr. Rahul Verma',
            speciality: 'General Medicine',
            registrationNumber: 'MCI-MH-2014-67210',
            hospitalId: dhPune.id,
            designation: 'Consultant Physician & Rural Outreach Specialist',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doc3 = {
            id: 'doc-003',
            userId: 'usr-doctor-003',
            doctorId: 'DOC-GYN-3041',
            name: 'Dr. Priya Nair',
            speciality: 'Gynecology',
            registrationNumber: 'MCI-MH-2016-89412',
            hospitalId: sdhSawantwadi.id,
            designation: 'Maternal Health Specialist & Obstetrician',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doc4 = {
            id: 'doc-004',
            userId: 'usr-doctor-004',
            doctorId: 'DOC-PED-4082',
            name: 'Dr. Arjun Kapoor',
            speciality: 'Pediatrics',
            registrationNumber: 'MCI-MH-2015-38914',
            hospitalId: dhRatnagiri.id,
            designation: 'Senior Pediatrician & Child Health Nodal Officer',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doc5 = {
            id: 'doc-005',
            userId: 'usr-doctor-005',
            doctorId: 'DOC-DERM-5104',
            name: 'Dr. Neha Sharma',
            speciality: 'Dermatology',
            registrationNumber: 'MCI-MH-2018-51203',
            hospitalId: dhRatnagiri.id,
            designation: 'Consultant Dermatologist & Teledermatology Lead',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doc6 = {
            id: 'doc-006',
            userId: 'usr-doctor-006',
            doctorId: 'DOC-ORTHO-6192',
            name: 'Dr. Vivek Rao',
            speciality: 'Orthopedics',
            registrationNumber: 'MCI-MH-2011-92314',
            hospitalId: dhRatnagiri.id,
            designation: 'Senior Orthopedic Surgeon & Trauma Lead',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doc7 = {
            id: 'doc-007',
            userId: 'usr-doctor-007',
            doctorId: 'DOC-ENT-7201',
            name: 'Dr. Kavita Joshi',
            speciality: 'ENT',
            registrationNumber: 'MCI-MH-2017-41890',
            hospitalId: sdhSawantwadi.id,
            designation: 'Consultant ENT & Audiology Specialist',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        const doc8 = {
            id: 'doc-008',
            userId: 'usr-doctor-008',
            doctorId: 'DOC-NEUR-8305',
            name: 'Dr. Sameer Khan',
            speciality: 'Neurology',
            registrationNumber: 'MCI-MH-2010-74120',
            hospitalId: dhRatnagiri.id,
            designation: 'Senior Consultant Neurologist & Stroke Specialist',
            status: 'active',
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
        };
        this.doctors = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8];
        // 5. Specialist Outreach Schedules (8 Specialist Sessions)
        const outreach1 = {
            id: 'outreach-001',
            outreachId: 'OUT-MH-01',
            doctorId: doc1.id,
            hospitalId: dhRatnagiri.id,
            destinationPHC: 'PHC Khed',
            speciality: 'Cardiology',
            date: '2026-08-28',
            startTime: '09:30 AM',
            endTime: '01:30 PM',
            totalSlots: 24,
            availableSlots: 6,
            status: 'ACTIVE',
            mmuVehicleStatus: 'Operational (Van MH-08-AZ-4102)',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        const outreach2 = {
            id: 'outreach-002',
            outreachId: 'OUT-MH-02',
            doctorId: doc2.id,
            hospitalId: dhPune.id,
            destinationPHC: 'PHC Chiplun',
            speciality: 'General Medicine',
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
        const outreach3 = {
            id: 'outreach-003',
            outreachId: 'OUT-MH-03',
            doctorId: doc3.id,
            hospitalId: sdhSawantwadi.id,
            destinationPHC: 'PHC Khed',
            speciality: 'Gynecology',
            date: '2026-08-30',
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            totalSlots: 18,
            availableSlots: 5,
            status: 'SCHEDULED',
            mmuVehicleStatus: 'Operational',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        const outreach4 = {
            id: 'outreach-004',
            outreachId: 'OUT-MH-04',
            doctorId: doc4.id,
            hospitalId: dhRatnagiri.id,
            destinationPHC: 'PHC Chiplun',
            speciality: 'Pediatrics',
            date: '2026-08-31',
            startTime: '10:00 AM',
            endTime: '02:00 PM',
            totalSlots: 20,
            availableSlots: 12,
            status: 'SCHEDULED',
            mmuVehicleStatus: 'Operational',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        const outreach5 = {
            id: 'outreach-005',
            outreachId: 'OUT-MH-05',
            doctorId: doc5.id,
            hospitalId: dhRatnagiri.id,
            destinationPHC: 'PHC Khed',
            speciality: 'Dermatology',
            date: '2026-09-01',
            startTime: '09:30 AM',
            endTime: '01:30 PM',
            totalSlots: 15,
            availableSlots: 7,
            status: 'SCHEDULED',
            mmuVehicleStatus: 'Operational',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        const outreach6 = {
            id: 'outreach-006',
            outreachId: 'OUT-MH-06',
            doctorId: doc6.id,
            hospitalId: dhRatnagiri.id,
            destinationPHC: 'PHC Dapoli',
            speciality: 'Orthopedics',
            date: '2026-09-02',
            startTime: '10:00 AM',
            endTime: '02:00 PM',
            totalSlots: 20,
            availableSlots: 9,
            status: 'SCHEDULED',
            mmuVehicleStatus: 'Operational',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        const outreach7 = {
            id: 'outreach-007',
            outreachId: 'OUT-MH-07',
            doctorId: doc7.id,
            hospitalId: sdhSawantwadi.id,
            destinationPHC: 'PHC Guhagar',
            speciality: 'ENT',
            date: '2026-09-03',
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            totalSlots: 16,
            availableSlots: 4,
            status: 'SCHEDULED',
            mmuVehicleStatus: 'Operational',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        const outreach8 = {
            id: 'outreach-008',
            outreachId: 'OUT-MH-08',
            doctorId: doc8.id,
            hospitalId: dhRatnagiri.id,
            destinationPHC: 'District Hospital Ratnagiri',
            speciality: 'Neurology',
            date: '2026-09-04',
            startTime: '11:00 AM',
            endTime: '03:00 PM',
            totalSlots: 15,
            availableSlots: 6,
            status: 'SCHEDULED',
            mmuVehicleStatus: 'Operational',
            createdAt: new Date('2026-08-10'),
            updatedAt: new Date('2026-08-10'),
        };
        this.outreachSchedules = [
            outreach1,
            outreach2,
            outreach3,
            outreach4,
            outreach5,
            outreach6,
            outreach7,
            outreach8,
        ];
        this.specialistOutreaches = this.outreachSchedules;
        // 6. Referral
        const referral1 = {
            id: 'ref-001',
            referralId: 'HS-REF-7821',
            patientId: patientProfile.id,
            referringFacilityId: phcKhed.id,
            receivingHospitalId: dhRatnagiri.id,
            referringDoctorId: doc1.id,
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
        const apt1 = {
            id: 'apt-001',
            appointmentId: 'HS-APT-1001',
            patientId: patientProfile.id,
            doctorId: doc1.id,
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
        this.initialAppointmentCount = 1;
        // 8. Health Records
        const hr1 = {
            id: 'hr-001',
            patientId: patientProfile.id,
            doctorId: doc1.id,
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
        const fol1 = {
            id: 'fol-001',
            patientId: patientProfile.id,
            doctorId: doc1.id,
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
        // 10. Diagnostic Services
        this.diagnosticServices = [
            {
                id: 'diag-001',
                facilityId: phcKhed.id,
                name: 'Digital 12-Lead ECG with Cloud Tele-Analysis',
                category: 'Cardiology Diagnostics',
                status: 'AVAILABLE',
                equipmentStatus: 'OPERATIONAL',
                estimatedTurnaround: '15 mins',
                dailyVolume: 18,
                lastUpdated: new Date('2026-08-24'),
            },
            {
                id: 'diag-002',
                facilityId: phcKhed.id,
                name: 'HbA1c & Fasting Blood Sugar Rapid Screening',
                category: 'Pathology & Biochemistry',
                status: 'AVAILABLE',
                equipmentStatus: 'OPERATIONAL',
                estimatedTurnaround: '30 mins',
                dailyVolume: 42,
                lastUpdated: new Date('2026-08-24'),
            },
        ];
        // 11. Diagnostic Reports
        this.diagnosticReports = [
            {
                id: 'rep-001',
                patientId: patientProfile.id,
                facilityId: phcKhed.id,
                testName: 'Digital 12-Lead Electrocardiogram (ECG)',
                category: 'Cardiology',
                date: '2026-08-22',
                status: 'READY',
                resultsSummary: 'Sinus rhythm, HR 78 bpm. Mild ST elevation in V2-V3. Correlate clinically with exertional symptoms.',
                reportReference: 'https://healthsure.gov.in/reports/ECG-7821.pdf',
                createdAt: new Date('2026-08-22T09:30:00Z'),
            },
        ];
        // 12. Teleconsultations (Session ID = tele-001)
        const tele1 = {
            id: 'tele-001',
            appointmentId: apt1.id,
            patientId: patientProfile.id,
            doctorId: doc1.id,
            status: 'SCHEDULED',
            networkMode: 'ADAPTIVE_2G_AUDIO',
            durationSeconds: 0,
            clinicalNotes: 'Scheduled follow-up for ECG and 2D-Echo assessment.',
            createdAt: new Date('2026-08-22T14:40:00Z'),
            updatedAt: new Date('2026-08-22T14:40:00Z'),
        };
        this.teleconsultations = [tele1];
        // 13. Notifications
        this.notifications = [
            {
                id: 'notif-001',
                userId: patientUser.id,
                type: 'REFERRAL_ACCEPTED',
                title: 'Referral Confirmed by District Hospital',
                message: 'Your cardiology referral pass HS-REF-7821 has been accepted. Token: DH-CARD-14.',
                read: false,
                createdAt: new Date('2026-08-22T14:30:00Z'),
            },
        ];
        console.log('[DataStore] Seeded database with complete HealthSure demo data (8 Specialists).');
    }
    // Atomic Slot Booking with Transaction Protection
    bookOutreachSlot(outreachId, patientId, reasonForVisit) {
        const outreach = this.outreachSchedules.find((o) => o.id === outreachId || o.outreachId === outreachId);
        if (!outreach) {
            throw new Error('Specialist outreach session not found.');
        }
        if (outreach.availableSlots <= 0) {
            throw new Error('Selected specialist outreach slot is no longer available.');
        }
        // Atomic decrement
        outreach.availableSlots -= 1;
        outreach.updatedAt = new Date();
        const patient = this.patients.find((p) => p.id === patientId || p.userId === patientId) || this.patients[0];
        const doc = this.doctors.find((d) => d.id === outreach.doctorId);
        const aptId = 'apt-' + Date.now();
        const tokenNum = `MMU-${Math.floor(10 + Math.random() * 90)}`;
        const newAppointment = {
            id: aptId,
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
            token: tokenNum,
            reasonForVisit: reasonForVisit || `Specialist Outreach Consultation - ${outreach.speciality}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.appointments.unshift(newAppointment);
        return { appointment: newAppointment, outreach };
    }
    async initialize() {
        if (this.isInitialized && this.patients.length > 0)
            return;
        this.seed();
        this.isInitialized = true;
    }
    getOtpSession(mobile) {
        return this.otpSessions.find((s) => s.mobile === mobile);
    }
    async createOrUpdateOtpSession(mobile, otp, expirySeconds = 300, maxAttempts = 5) {
        const salt = bcrypt.genSaltSync(8);
        const otpHash = bcrypt.hashSync(otp, salt);
        const expiresAt = new Date(Date.now() + expirySeconds * 1000);
        const existingIndex = this.otpSessions.findIndex((s) => s.mobile === mobile);
        const session = {
            id: 'otp-' + Date.now(),
            mobile,
            otpHash,
            attempts: 0,
            maxAttempts,
            expiresAt,
            lastSentAt: new Date(),
            used: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (existingIndex >= 0) {
            this.otpSessions[existingIndex] = session;
        }
        else {
            this.otpSessions.push(session);
        }
        return session;
    }
    recordFailedOtpAttempt(mobile) {
        const session = this.getOtpSession(mobile);
        if (session) {
            session.attempts += 1;
            session.updatedAt = new Date();
            return session.attempts;
        }
        return 0;
    }
    markOtpSessionUsed(mobile) {
        const session = this.getOtpSession(mobile);
        if (session) {
            session.used = true;
            session.updatedAt = new Date();
        }
    }
}
export const dataStore = new DataStore();
