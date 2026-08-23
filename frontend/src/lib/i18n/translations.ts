// HealthSure — Complete 15-Language i18n Translation Dictionary
// src/lib/i18n/translations.ts

import type { Language } from '../../components/auth/types';
export type { Language };

export interface Translations {
  // ── Brand & Global ───────────────────────────────────────────────────────
  appName: string;
  appTagline: string;
  selectLanguage: string;
  lightMode: string;
  darkMode: string;
  secureAccess: string;
  tollFreeHelpline: string;
  callHelpline: string;
  notifications: string;
  markAllAsRead: string;
  noNotifications: string;
  registeredPHC: string;
  signedInAs: string;
  idLabel: string;
  regNoLabel: string;
  backBtn: string;
  closeBtn: string;
  cancelBtn: string;
  confirmBtn: string;
  saveBtn: string;
  submitBtn: string;
  searchPlaceholder: string;
  loading: string;
  noData: string;
  errorGeneric: string;
  successGeneric: string;
  viewAll: string;

  // ── Auth & Brand Sidebar ─────────────────────────────────────────────────
  panelHeadline: string;
  panelHeadlineAccent: string;
  panelDescription: string;
  panelFeature1: string;
  panelFeature2: string;
  panelFeature3: string;
  panelFeature4: string;
  panelTrust: string;

  selectRoleTitle: string;
  selectRoleSubtitle: string;
  roleHint: string;
  continueBtn: string;

  rolePatientLabel: string;
  rolePatientDesc: string;
  roleDoctorLabel: string;
  roleDoctorDesc: string;
  roleHospitalLabel: string;
  roleHospitalDesc: string;
  roleAdminLabel: string;
  roleAdminDesc: string;

  signingInAs: string;
  changeRole: string;
  passwordTab: string;
  otpTab: string;
  mobileOrEmail: string;
  mobileOrEmailPlaceholder: string;
  mobileHint: string;
  password: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  rememberMe: string;
  forgotPassword: string;
  signInBtn: string;
  signingIn: string;
  noAccount: string;
  createAccount: string;
  demoHint: string;

  otpTitle: string;
  otpSubtitle: string;
  mobileNumber: string;
  mobilePlaceholder: string;
  mobileHintOtp: string;
  sendOtpBtn: string;
  sendingOtp: string;
  enterOtpTitle: string;
  sentTo: string;
  verifyOtpBtn: string;
  verifying: string;
  resendIn: string;
  resendOtp: string;
  changeNumber: string;
  backToLogin: string;
  otpSentMsg: string;
  otpResent: string;

  createPatientAccount: string;
  createDoctorAccount: string;
  createHospitalAccount: string;
  createAdminAccount: string;
  fillDetails: string;
  fullName: string;
  fullNamePlaceholder: string;
  fullNameDoctorPlaceholder: string;
  mobileField: string;
  mobilePlaceholderReg: string;
  emailField: string;
  emailOptional: string;
  emailRequired: string;
  emailPlaceholderPatient: string;
  emailPlaceholderGovt: string;
  dateOfBirth: string;
  age: string;
  agePlaceholder: string;
  gender: string;
  selectGender: string;
  male: string;
  female: string;
  other: string;
  preferNotToSay: string;
  location: string;
  locationPlaceholder: string;
  preferredLanguage: string;
  selectLanguageField: string;
  englishOption: string;
  hindiOption: string;
  marathiOption: string;
  medicalRegNo: string;
  medicalRegPlaceholder: string;
  speciality: string;
  specialityPlaceholder: string;
  hospitalFacility: string;
  hospitalPlaceholder: string;
  designation: string;
  designationPlaceholder: string;
  department: string;
  departmentPlaceholder: string;
  district: string;
  districtPlaceholder: string;
  passwordField: string;
  passwordMin: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  patientOtpNote: string;
  createAccountBtn: string;
  creatingAccount: string;
  alreadyHaveAccount: string;
  signIn: string;
  accountCreatedTitle: string;
  accountCreatedMsg: string;
  pleaseWait: string;

  resetPasswordTitle: string;
  accountRecovery: string;
  stepIdentify: string;
  stepVerifyOtp: string;
  stepNewPassword: string;
  mobileOrEmailLabel: string;
  mobileOrEmailPlaceholderReset: string;
  sendOtpReset: string;
  sending: string;
  otpSentTo: string;
  enterOtp: string;
  otpPlaceholder: string;
  verifyOtp: string;
  changeNumberEmail: string;
  newPassword: string;
  newPasswordPlaceholder: string;
  confirmNewPassword: string;
  confirmNewPasswordPlaceholder: string;
  resetPasswordBtn: string;
  resetting: string;
  passwordResetTitle: string;
  passwordResetMsg: string;
  backToSignIn: string;

  fieldRequired: string;
  invalidMobile: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordsNoMatch: string;
  invalidOtp: string;
  incorrectCredentials: string;

  // ── Navigation & Portals ─────────────────────────────────────────────────
  navOverview: string;
  navAppointments: string;
  navOutreach: string;
  navRecords: string;
  navReferrals: string;
  navDiagnostics: string;
  navMedicines: string;
  navTeleconsult: string;
  navFollowups: string;
  navProfile: string;
  navHelp: string;
  navLogout: string;
  navHospitalCapacity: string;
  navPatients: string;
  navReports: string;
  navTodayPatients: string;

  patientPortalTitle: string;
  doctorPortalTitle: string;
  hospitalPortalTitle: string;
  adminPortalTitle: string;

  // ── Patient Overview Page ────────────────────────────────────────────────
  welcomeBack: string;
  patientSubtitle: string;
  quickBookApt: string;
  quickViewRecords: string;
  quickTrackReferral: string;
  quickVoiceHelp: string;
  nextAptHeading: string;
  activeReferralHeading: string;
  outreachAlertHeading: string;
  recentVitalsHeading: string;
  recentPrescriptionsHeading: string;
  bookedSlot: string;
  assignedDoctor: string;
  phcKhedVenue: string;
  referralStatusText: string;
  viewReferralTimeline: string;

  // ── Appointments Page & Booking Modal ────────────────────────────────────
  appointmentsPageTitle: string;
  appointmentsPageDesc: string;
  bookNewAptBtn: string;
  tabUpcoming: string;
  tabPast: string;
  tabAll: string;
  filterSpeciality: string;
  cardiology: string;
  orthopaedics: string;
  dermatology: string;
  generalMedicine: string;
  ophthalmology: string;
  pediatrics: string;
  token: string;
  room: string;
  viewInstructions: string;
  instructionsTitle: string;
  cancelApt: string;
  cancelling: string;
  cancelConfirm: string;
  bookModalTitle: string;
  selectSpecialityLabel: string;
  selectFacilityLabel: string;
  consultModeLabel: string;
  inPersonMode: string;
  teleconsultMode: string;
  preferredDateLabel: string;
  timeSlotLabel: string;
  reasonSymptomsLabel: string;
  reasonPlaceholder: string;
  confirmBookingBtn: string;
  bookingSuccessMsg: string;

  // ── Outreach Schedule Page ───────────────────────────────────────────────
  outreachPageTitle: string;
  outreachPageDesc: string;
  bookOutreachSlot: string;
  slotsAvailable: string;
  slotsFilled: string;
  mmuVehicle: string;
  transportStatus: string;
  medicalKitVerified: string;
  outreachNotice: string;

  // ── Health Records Page ──────────────────────────────────────────────────
  recordsPageTitle: string;
  recordsPageDesc: string;
  searchRecordsPlaceholder: string;
  abhaCardLabel: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  clinicalAssessment: string;
  prescribedMedicines: string;
  labReportsAttached: string;
  downloadPdf: string;
  recordTypeOPD: string;
  recordTypeLab: string;
  recordTypeReferral: string;

  // ── Referrals Page (7-Step Journey) ──────────────────────────────────────
  referralsPageTitle: string;
  referralsPageDesc: string;
  referralIdLabel: string;
  referralPriority: string;
  urgentPriority: string;
  normalPriority: string;
  referringCentre: string;
  destinationFacility: string;
  originFacility: string;
  doctorName: string;
  specialityLabel: string;
  acceptReferral: string;
  incomingReferrals: string;
  clinicalIndication: string;
  digitalPass: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  step5Title: string;
  step6Title: string;
  step7Title: string;

  // ── Diagnostics Inventory Page ───────────────────────────────────────────
  diagnosticsPageTitle: string;
  diagnosticsPageDesc: string;
  tatLabel: string;
  timingLabel: string;
  prerequisitesLabel: string;
  freeServiceBadge: string;
  statusAvailable: string;
  statusLimited: string;
  statusUnavailable: string;

  // ── Medicine Stock Page ──────────────────────────────────────────────────
  medicinesPageTitle: string;
  medicinesPageDesc: string;
  genericName: string;
  dosageForm: string;
  essentialDrugBadge: string;
  dispensaryHours: string;

  // ── Teleconsultation Page ────────────────────────────────────────────────
  teleconsultPageTitle: string;
  teleconsultPageDesc: string;
  lowBandwidthExplainTitle: string;
  lowBandwidthExplainDesc: string;
  prescriptionSyncTitle: string;
  prescriptionSyncDesc: string;
  enterRoomBtn: string;
  liveConsultation: string;
  audio2gMode: string;
  hdVideoActive: string;
  cameraDenied: string;
  allowCameraSettings: string;
  endConsultation: string;
  clinicalNotesSync: string;
  viewConsultationSummary: string;

  // ── Follow-ups Page ──────────────────────────────────────────────────────
  followupsPageTitle: string;
  followupsPageDesc: string;
  dueNow: string;
  upcoming: string;
  completed: string;
  overdue: string;
  scheduledDate: string;
  clinicalPurpose: string;

  // ── Patient Profile Page ─────────────────────────────────────────────────
  profilePageTitle: string;
  profilePageDesc: string;
  abhaNumber: string;
  village: string;
  emergencyContacts: string;
  primaryCentreLink: string;
  editProfileBtn: string;

  // ── Help & Support Page ──────────────────────────────────────────────────
  helpPageTitle: string;
  helpPageDesc: string;
  ambulance108: string;
  womenHelpline104: string;
  phcHelpline: string;
  fileGrievance: string;

  // ── Doctor & Hospital Dashboards ─────────────────────────────────────────
  doctorOverviewTitle: string;
  todaysAppointments: string;
  pendingReferrals: string;
  teleconsultations: string;
  followUpsDue: string;
  startConsultation: string;
  viewRecord: string;
  joinVideo: string;
  hospitalOverviewTitle: string;
  intakeDesk: string;
  opdCapacity: string;
  occupiedBeds: string;
  totalBeds: string;

  // ── Status Badges & Generic ──────────────────────────────────────────────
  statusConfirmed: string;
  statusPending: string;
  statusCancelled: string;
  statusCompleted: string;
  statusHospitalAccepted: string;
  statusScheduled: string;
  statusUrgent: string;
  statusNormal: string;
  statusDue: string;
  statusOverdue: string;
  emptyTitle: string;
  emptyDesc: string;

  // ── Government Admin Portal ──────────────────────────────────────────────
  adminPortalSubtitle: string;
  stateLabel: string;
  allDistricts: string;
  allFacilities: string;
  navFacilities: string;
  navSettings: string;
  patientsServed: string;
  activeReferrals: string;
  referralCompletionRate: string;
  outreachVisits: string;
  demoDataDisclaimer: string;
  systemBottlenecks: string;
  facilityPerformance: string;
  referralPipeline: string;
  outreachCoverage: string;
  outreachUtilization: string;
  slotsAvailableVsBooked: string;
  teleconsultVolume: string;
  lowBandwidthAdoption: string;
  diagnosticReadiness: string;
  operationalReports: string;
  viewReport: string;
  exportPdf: string;
  exportCsv: string;
  statusOperational: string;
  statusAttentionRequired: string;
}

// ── English Base Dictionary ─────────────────────────────────────────────────
const en: Translations = {
  appName: 'HealthSure',
  appTagline: 'Rural Care Continuity Platform',
  selectLanguage: 'Select Language',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  secureAccess: 'Secure healthcare access • HealthSure',
  tollFreeHelpline: 'Toll-Free: 1800-209-4477',
  callHelpline: 'Call Toll-Free Helpline',
  notifications: 'Notifications',
  markAllAsRead: 'Mark all as read',
  noNotifications: 'No notifications',
  registeredPHC: 'Primary Health Centre',
  signedInAs: 'Signed in as',
  idLabel: 'ID',
  regNoLabel: 'Reg. No',
  backBtn: 'Back',
  closeBtn: 'Close',
  cancelBtn: 'Cancel',
  confirmBtn: 'Confirm',
  saveBtn: 'Save',
  submitBtn: 'Submit',
  searchPlaceholder: 'Search...',
  loading: 'Loading...',
  noData: 'No records found',
  errorGeneric: 'Something went wrong. Please try again.',
  successGeneric: 'Action completed successfully.',
  viewAll: 'View All',

  panelHeadline: 'Bridging Distance,',
  panelHeadlineAccent: 'Delivering Care',
  panelDescription:
    'A unified public healthcare network connecting rural patients, Primary Health Centres, and district specialists for seamless continuity of care.',
  panelFeature1: 'Integrated PHC & District Hospital referrals',
  panelFeature2: 'Specialist outreach camp schedules & teleconsultations',
  panelFeature3: 'Longitudinal health records & medicine continuity',
  panelFeature4: 'Voice-assisted access for low-connectivity regions',
  panelTrust: 'Secure Public Healthcare Network',

  selectRoleTitle: 'Select your role',
  selectRoleSubtitle: 'Choose how you will access the HealthSure platform.',
  roleHint: 'Select a role above to proceed to login.',
  continueBtn: 'Continue',

  rolePatientLabel: 'Patient',
  rolePatientDesc: 'Access consultations, appointments, referrals and records',
  roleDoctorLabel: 'Doctor / Specialist',
  roleDoctorDesc: 'Conduct teleconsultations, review referrals and manage OPD',
  roleHospitalLabel: 'Hospital Staff',
  roleHospitalDesc: 'Manage hospital capacity, beds, diagnostics and triage',
  roleAdminLabel: 'Government Admin',
  roleAdminDesc: 'Monitor public health delivery, outreach and outcomes',

  signingInAs: 'Signing in as',
  changeRole: 'Change role',
  passwordTab: 'Password',
  otpTab: 'OTP / Phone',
  mobileOrEmail: 'Mobile Number or Email',
  mobileOrEmailPlaceholder: 'Enter 10-digit mobile or email address',
  mobileHint: 'Registered mobile number or official email',
  password: 'Password',
  passwordPlaceholder: 'Enter your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  rememberMe: 'Remember me on this device',
  forgotPassword: 'Forgot password?',
  signInBtn: 'Sign In',
  signingIn: 'Signing in…',
  noAccount: "Don't have an account?",
  createAccount: 'Create account',
  demoHint: 'For quick prototype testing, any sample credentials will work.',

  otpTitle: 'Sign in with OTP',
  otpSubtitle: 'We will send a 6-digit verification code to your mobile number.',
  mobileNumber: 'Mobile Number',
  mobilePlaceholder: '10-digit mobile number',
  mobileHintOtp: 'A 6-digit code will be sent via SMS',
  sendOtpBtn: 'Send OTP',
  sendingOtp: 'Sending OTP…',
  enterOtpTitle: 'Enter Verification Code',
  sentTo: '6-digit code sent to',
  verifyOtpBtn: 'Verify & Sign In',
  verifying: 'Verifying…',
  resendIn: 'Resend code in',
  resendOtp: 'Resend OTP',
  changeNumber: 'Change number',
  backToLogin: 'Back to Sign In',
  otpSentMsg: 'Verification code sent successfully. Use 123456 for testing.',
  otpResent: 'A new verification code has been sent.',

  createPatientAccount: 'Create Patient Account',
  createDoctorAccount: 'Create Doctor Account',
  createHospitalAccount: 'Create Hospital Staff Account',
  createAdminAccount: 'Create Administrator Account',
  fillDetails: 'Please fill in your details to create your HealthSure account.',
  fullName: 'Full Name',
  fullNamePlaceholder: 'Enter your full name',
  fullNameDoctorPlaceholder: 'e.g. Dr. Rajesh Sharma',
  mobileField: 'Mobile Number',
  mobilePlaceholderReg: '10-digit mobile number',
  emailField: 'Email Address',
  emailOptional: '(Optional)',
  emailRequired: '(Required for staff)',
  emailPlaceholderPatient: 'your.email@example.com (optional)',
  emailPlaceholderGovt: 'official.email@gov.in',
  dateOfBirth: 'Date of Birth',
  age: 'Age',
  agePlaceholder: 'e.g. 35',
  gender: 'Gender',
  selectGender: 'Select gender',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  preferNotToSay: 'Prefer not to say',
  location: 'Village / Town / District',
  locationPlaceholder: 'e.g. Khed, Ratnagiri, Maharashtra',
  preferredLanguage: 'Preferred Language',
  selectLanguageField: 'Select language',
  englishOption: 'English',
  hindiOption: 'हिन्दी (Hindi)',
  marathiOption: 'मराठी (Marathi)',
  medicalRegNo: 'Medical Registration Number',
  medicalRegPlaceholder: 'e.g. MMC-2018-12345',
  speciality: 'Speciality / Department',
  specialityPlaceholder: 'e.g. Cardiology, General Medicine',
  hospitalFacility: 'Hospital / Primary Health Centre',
  hospitalPlaceholder: 'e.g. District Hospital Ratnagiri, PHC Khed',
  designation: 'Designation / Post',
  designationPlaceholder: 'e.g. Staff Nurse, Medical Officer, MO Triage',
  department: 'Department / Authority',
  departmentPlaceholder: 'e.g. Directorate of Health Services, Maharashtra',
  district: 'District / Jurisdiction',
  districtPlaceholder: 'e.g. Ratnagiri District',
  passwordField: 'Password',
  passwordMin: 'Minimum 8 characters',
  confirmPassword: 'Confirm Password',
  confirmPasswordPlaceholder: 'Re-enter your password',
  patientOtpNote: '🔐 Patients use OTP verification for secure, password-free access.',
  createAccountBtn: 'Create Account',
  creatingAccount: 'Creating account…',
  alreadyHaveAccount: 'Already have an account?',
  signIn: 'Sign in',
  accountCreatedTitle: 'Account Created',
  accountCreatedMsg: 'Signing into your portal…',
  pleaseWait: 'Please wait…',

  resetPasswordTitle: 'Reset Password',
  accountRecovery: 'Account Recovery',
  stepIdentify: 'Identify',
  stepVerifyOtp: 'Verify OTP',
  stepNewPassword: 'New Password',
  mobileOrEmailLabel: 'Mobile Number or Email',
  mobileOrEmailPlaceholderReset: 'Enter your registered mobile or email',
  sendOtpReset: 'Send Verification Code',
  sending: 'Sending…',
  otpSentTo: 'Enter the 6-digit code sent to',
  enterOtp: 'One-Time Password',
  otpPlaceholder: 'Enter 6-digit code',
  verifyOtp: 'Verify Code',
  changeNumberEmail: 'Change number / email',
  newPassword: 'New Password',
  newPasswordPlaceholder: 'Minimum 8 characters',
  confirmNewPassword: 'Confirm New Password',
  confirmNewPasswordPlaceholder: 'Re-enter your new password',
  resetPasswordBtn: 'Reset Password',
  resetting: 'Resetting…',
  passwordResetTitle: 'Password Reset Successfully',
  passwordResetMsg: 'Your password has been updated. You can now sign in with your new password.',
  backToSignIn: 'Back to Sign In',

  fieldRequired: 'This field is required.',
  invalidMobile: 'Please enter a valid 10-digit mobile number.',
  invalidEmail: 'Please enter a valid email address.',
  passwordTooShort: 'Password must be at least 8 characters.',
  passwordsNoMatch: 'Passwords do not match.',
  invalidOtp: 'Invalid OTP. Please check and try again.',
  incorrectCredentials: 'Incorrect credentials. Please verify your details.',

  navOverview: 'Overview',
  navAppointments: 'Appointments',
  navOutreach: 'Specialist Outreach',
  navRecords: 'Health Records',
  navReferrals: 'Referral Tracking',
  navDiagnostics: 'Diagnostics',
  navMedicines: 'Medicines',
  navTeleconsult: 'Teleconsultation',
  navFollowups: 'Follow-ups',
  navProfile: 'Patient Profile',
  navHelp: 'Help & Support',
  navLogout: 'Sign Out',
  navHospitalCapacity: 'Hospital Capacity',
  navPatients: 'Patients Directory',
  navReports: 'Operational Reports',
  navTodayPatients: "Today's Patients",

  patientPortalTitle: 'Patient Portal • Care Continuity',
  doctorPortalTitle: 'Doctor Portal • Specialist OPD',
  hospitalPortalTitle: 'Hospital Console • Care Network',
  adminPortalTitle: 'Government Health Administration',

  welcomeBack: 'Welcome back,',
  patientSubtitle: 'Your rural healthcare continuity dashboard & active clinical timeline.',
  quickBookApt: 'Book Appointment',
  quickViewRecords: 'Health Records',
  quickTrackReferral: 'Track Referral',
  quickVoiceHelp: 'Voice Helpline',
  nextAptHeading: 'Upcoming Specialist Appointment',
  activeReferralHeading: 'Active Inter-Facility Referral',
  outreachAlertHeading: 'Upcoming PHC Specialist Camp',
  recentVitalsHeading: 'Latest Clinical Vitals',
  recentPrescriptionsHeading: 'Active Prescriptions & Medicines',
  bookedSlot: 'Booked Slot',
  assignedDoctor: 'Assigned Doctor',
  phcKhedVenue: 'PHC Khed Clinic',
  referralStatusText: 'Pre-authorized for Cardiology Consultation',
  viewReferralTimeline: 'View Referral Timeline',

  appointmentsPageTitle: 'My Healthcare Appointments',
  appointmentsPageDesc: 'Manage upcoming PHC visits, specialist outreach camps, and hospital consultations.',
  bookNewAptBtn: 'Book New Appointment',
  tabUpcoming: 'Upcoming',
  tabPast: 'Past History',
  tabAll: 'All Appointments',
  filterSpeciality: 'All Specialties',
  cardiology: 'Cardiology (Heart Care)',
  orthopaedics: 'Orthopaedics (Bone & Joint)',
  dermatology: 'Dermatology (Skin Care)',
  generalMedicine: 'General Medicine (PHC Routine OPD)',
  ophthalmology: 'Ophthalmology (Eye Care)',
  pediatrics: 'Pediatrics (Child Health)',
  token: 'Token',
  room: 'Room',
  viewInstructions: 'View Instructions',
  instructionsTitle: 'Appointment Instructions & Preparation',
  cancelApt: 'Cancel',
  cancelling: 'Cancelling…',
  cancelConfirm: 'Are you sure you want to cancel this appointment?',
  bookModalTitle: 'Book Healthcare Appointment',
  selectSpecialityLabel: 'Select Speciality',
  selectFacilityLabel: 'Select Healthcare Facility',
  consultModeLabel: 'Consultation Mode',
  inPersonMode: 'In-Person Clinic Visit',
  teleconsultMode: 'Teleconsultation (Video/Audio)',
  preferredDateLabel: 'Preferred Date',
  timeSlotLabel: 'Time Slot',
  reasonSymptomsLabel: 'Reason for Visit / Symptoms',
  reasonPlaceholder: 'e.g. Chest tightness during walking, or routine BP followup...',
  confirmBookingBtn: 'Confirm Appointment',
  bookingSuccessMsg: 'Appointment booked successfully.',

  outreachPageTitle: 'Specialist Outreach Camp Schedule',
  outreachPageDesc: 'Hospital specialists visiting PHC Khed & rural sub-centres with Mobile Medical Units.',
  bookOutreachSlot: 'Book Camp Slot',
  slotsAvailable: 'slots available to villagers',
  slotsFilled: 'Slots Booked',
  mmuVehicle: 'Mobile Medical Unit (MMU)',
  transportStatus: 'Transport Status',
  medicalKitVerified: 'Diagnostic Cart & ECG Kit Supplied',
  outreachNotice: 'Specialist visits eliminate the need to travel 45km to Ratnagiri.',

  recordsPageTitle: 'Longitudinal Health Records',
  recordsPageDesc: 'Unified chronological clinical history, prescriptions, vitals, and diagnostic attachments.',
  searchRecordsPlaceholder: 'Search by doctor, diagnosis, medication, or facility...',
  abhaCardLabel: 'ABHA Health ID',
  bloodGroup: 'Blood Group',
  allergies: 'Known Allergies',
  chronicConditions: 'Chronic Conditions',
  clinicalAssessment: 'Clinical Assessment & Findings',
  prescribedMedicines: 'Prescribed Medicines',
  labReportsAttached: 'Lab Reports & Diagnostic Scans',
  downloadPdf: 'Download Summary PDF',
  recordTypeOPD: 'OPD Consultation',
  recordTypeLab: 'Diagnostic Report',
  recordTypeReferral: 'Referral Summary',

  referralsPageTitle: 'Inter-Facility Referral Tracking',
  referralsPageDesc: 'Track patient transfers from Primary Health Centres to District Hospitals in real-time.',
  referralIdLabel: 'Referral ID',
  referralPriority: 'Priority',
  urgentPriority: 'Urgent Triage',
  normalPriority: 'Routine Specialist',
  referringCentre: 'Referring Centre',
  destinationFacility: 'Destination Facility',
  originFacility: 'Originating Facility',
  doctorName: 'Referring Doctor',
  specialityLabel: 'Department / Speciality',
  acceptReferral: 'Accept Referral',
  incomingReferrals: 'Incoming PHC Referrals',
  clinicalIndication: 'Clinical Indication',
  digitalPass: 'HealthSure Digital Referral Pass',
  step1Title: '1. PHC Clinical Referral Initiated',
  step2Title: '2. Digital Referral Sent to District Hospital',
  step3Title: '3. Hospital Specialist Review & Triage',
  step4Title: '4. Hospital Accepted & Slot Reserved',
  step5Title: '5. Patient Arrival & OPD Token Assigned',
  step6Title: '6. Specialist Consultation Conducted',
  step7Title: '7. Counter-Referral & Post-Care Synced to PHC',

  diagnosticsPageTitle: 'Public Diagnostic Services & Tests',
  diagnosticsPageDesc: 'Live equipment status and turnaround times across PHCs and District Hospitals.',
  tatLabel: 'Turnaround Time',
  timingLabel: 'Operating Hours',
  prerequisitesLabel: 'Preparation / Fasting',
  freeServiceBadge: 'Free Government Service',
  statusAvailable: 'Available Today',
  statusLimited: 'Limited Slots',
  statusUnavailable: 'Temporarily Unavailable',

  medicinesPageTitle: 'Essential Medicine Stock & Dispensary',
  medicinesPageDesc: 'Check real-time drug availability at PHC Khed & District Hospital pharmacies.',
  genericName: 'Generic Name',
  dosageForm: 'Dosage Form',
  essentialDrugBadge: 'Essential Drug (Free Supply)',
  dispensaryHours: 'Dispensary Hours: 08:30 AM - 04:30 PM (Mon-Sat)',

  teleconsultPageTitle: 'Teleconsultation Clinic',
  teleconsultPageDesc: 'Consult with District Hospital specialists securely from home or via your local PHC Tele-Kiosk.',
  lowBandwidthExplainTitle: 'Low-Bandwidth 2G Adaptive Mode',
  lowBandwidthExplainDesc: 'If mobile internet is slow in your village, consultation switches automatically to crisp audio mode.',
  prescriptionSyncTitle: 'Integrated Digital Prescriptions',
  prescriptionSyncDesc: 'Doctor-issued prescriptions sync automatically to PHC Khed Pharmacy for pickup.',
  enterRoomBtn: 'Enter Consultation Room',
  liveConsultation: 'Live Teleconsultation',
  audio2gMode: '2G Audio Mode Active',
  hdVideoActive: 'HD Video Active',
  cameraDenied: 'Camera / Microphone Denied',
  allowCameraSettings: 'Allow camera & microphone in browser site settings',
  endConsultation: 'End Consultation',
  clinicalNotesSync: 'Live Clinical Notes',
  viewConsultationSummary: 'View Consultation Summary',

  followupsPageTitle: 'Clinical Follow-Up Care',
  followupsPageDesc: 'Provider-recorded post-consultation checkpoints, chronic disease monitoring, and recovery verification.',
  dueNow: 'Due Now',
  upcoming: 'Upcoming',
  completed: 'Completed',
  overdue: 'Overdue',
  scheduledDate: 'Scheduled Date',
  clinicalPurpose: 'Clinical Purpose',

  profilePageTitle: 'Patient Profile & Emergency Contacts',
  profilePageDesc: 'Personal demographics, ABHA card registration, primary health centre link, and medical history.',
  abhaNumber: 'ABHA Health ID Number',
  village: 'Village / Origin',
  emergencyContacts: 'Emergency Contacts & Relatives',
  primaryCentreLink: 'Attached Primary Health Centre',
  editProfileBtn: 'Edit Profile',

  helpPageTitle: 'Help, Support & Public Healthcare Grievances',
  helpPageDesc: 'Frequently asked questions, emergency phone helplines, and grievance reporting for rural patients.',
  ambulance108: 'National Ambulance Service: 108',
  womenHelpline104: 'Health Information Helpline: 104',
  phcHelpline: 'PHC Khed Helpdesk: 02356-260124',
  fileGrievance: 'Submit Feedback / Grievance',

  doctorOverviewTitle: 'Doctor Overview & Clinical OPD',
  todaysAppointments: "Today's Patients",
  pendingReferrals: 'Pending Referrals',
  teleconsultations: 'Teleconsultations',
  followUpsDue: 'Follow-ups Due',
  startConsultation: 'Start Consultation',
  viewRecord: 'View Patient Record',
  joinVideo: 'Join Video Call',
  hospitalOverviewTitle: 'Hospital Operations Hub',
  intakeDesk: 'Referral Intake Desk',
  opdCapacity: 'OPD Department Capacity',
  occupiedBeds: 'Occupied Inpatient Beds',
  totalBeds: 'Total Bed Strength',

  statusConfirmed: 'Confirmed',
  statusPending: 'Pending Confirmation',
  statusCancelled: 'Cancelled',
  statusCompleted: 'Completed',
  statusHospitalAccepted: 'Hospital Accepted',
  statusScheduled: 'Specialist Scheduled',
  statusUrgent: 'Urgent',
  statusNormal: 'Routine',
  statusDue: 'Due Today',
  statusOverdue: 'Overdue',
  emptyTitle: 'No Records Found',
  emptyDesc: 'There are no active records in this section.',

  adminPortalSubtitle: 'State & District Healthcare Monitoring Dashboard',
  stateLabel: 'State',
  allDistricts: 'All Districts',
  allFacilities: 'All Facilities',
  navFacilities: 'Facilities',
  navSettings: 'Settings',
  patientsServed: 'Patients Served',
  activeReferrals: 'Active Referrals',
  referralCompletionRate: 'Referral Completion',
  outreachVisits: 'Specialist Outreach',
  demoDataDisclaimer: 'Demonstration Data for Public Health Monitoring',
  systemBottlenecks: 'System Bottlenecks (Attention Required)',
  facilityPerformance: 'District & Facility Performance',
  referralPipeline: 'Inter-Facility Referral Pipeline',
  outreachCoverage: 'Specialist Outreach Coverage',
  outreachUtilization: 'Outreach Utilization',
  slotsAvailableVsBooked: 'Available vs Booked Slots',
  teleconsultVolume: 'Teleconsultation Volume',
  lowBandwidthAdoption: '2G Adaptive Audio Adoption',
  diagnosticReadiness: 'Diagnostic Availability & Gaps',
  operationalReports: 'Public Health Reports',
  viewReport: 'View Summary',
  exportPdf: 'Export PDF',
  exportCsv: 'Export CSV',
  statusOperational: 'Operational',
  statusAttentionRequired: 'Attention Required',
};

// ── Hindi Complete Dictionary ───────────────────────────────────────────────
const hi: Translations = {
  ...en,
  appName: 'हेल्थश्युअर',
  appTagline: 'ग्रामीण निरंतर स्वास्थ्य सेवा मंच',
  selectLanguage: 'भाषा चुनें',
  lightMode: 'लाइट मोड',
  darkMode: 'डार्क मोड',
  secureAccess: 'सुरक्षित स्वास्थ्य सेवा पहुंच • हेल्थश्युअर',
  tollFreeHelpline: 'टोल-फ्री: 1800-209-4477',
  callHelpline: 'टोल-फ्री हेल्पलाइन पर कॉल करें',
  notifications: 'सूचनाएं',
  markAllAsRead: 'सभी को पढ़ा हुआ चिह्नित करें',
  noNotifications: 'कोई नई सूचना नहीं है',
  registeredPHC: 'प्राथमिक स्वास्थ्य केंद्र',
  signedInAs: 'के रूप में साइन इन हैं',
  idLabel: 'आईडी',
  regNoLabel: 'पंजीकरण संख्या',
  backBtn: 'पीछे जाएं',
  closeBtn: 'बंद करें',
  cancelBtn: 'रद्द करें',
  confirmBtn: 'पुष्टि करें',
  saveBtn: 'सहेजें',
  submitBtn: 'जमा करें',
  searchPlaceholder: 'खोजें...',
  loading: 'लोड हो रहा है...',
  noData: 'कोई रिकॉर्ड नहीं मिला',
  errorGeneric: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
  successGeneric: 'कार्य सफलतापूर्वक पूरा हुआ।',
  viewAll: 'सभी देखें',

  panelHeadline: 'दूरी घटाएं,',
  panelHeadlineAccent: 'स्वास्थ्य पहुंचाएं',
  panelDescription:
    'ग्रामीण मरीजों, प्राथमिक स्वास्थ्य केंद्रों (PHC) और जिला अस्पताल के विशेषज्ञों को जोड़ने वाला एकीकृत सार्वजनिक स्वास्थ्य नेटवर्क।',
  panelFeature1: 'प्राथमिक स्वास्थ्य केंद्र और जिला अस्पताल रेफरल',
  panelFeature2: 'विशेषज्ञ शिविर अनुसूची और टेलीपरामर्श',
  panelFeature3: 'स्वास्थ्य रिकॉर्ड और निरंतर दवा आपूर्ति',
  panelFeature4: 'कम कनेक्टिविटी वाले क्षेत्रों हेतु वॉइस सहायता',
  panelTrust: 'सुरक्षित सार्वजनिक स्वास्थ्य सेवा नेटवर्क',

  selectRoleTitle: 'अपनी भूमिका चुनें',
  selectRoleSubtitle: 'चुनें कि आप हेल्थश्युअर पोर्टल का उपयोग कैसे करेंगे।',
  roleHint: 'लॉगिन करने के लिए ऊपर से अपनी भूमिका चुनें।',
  continueBtn: 'आगे बढ़ें',

  rolePatientLabel: 'मरीज (Patient)',
  rolePatientDesc: 'परामर्श, अपॉइंटमेंट, रेफरल और मेडिकल रिकॉर्ड देखें',
  roleDoctorLabel: 'डॉक्टर / विशेषज्ञ (Doctor)',
  roleDoctorDesc: 'टेलीपरामर्श करें, रेफरल देखें और ओपीडी संभालें',
  roleHospitalLabel: 'अस्पताल स्टाफ (Hospital Staff)',
  roleHospitalDesc: 'अस्पताल क्षमता, बेड, जांच और मरीज प्रवेश प्रबंधित करें',
  roleAdminLabel: 'सरकारी प्रशासक (Admin)',
  roleAdminDesc: 'सार्वजनिक स्वास्थ्य सेवाओं और शिविरों की निगरानी करें',

  signingInAs: 'के रूप में साइन इन करें',
  changeRole: 'भूमिका बदलें',
  passwordTab: 'पासवर्ड',
  otpTab: 'ओटीपी / फोन',
  mobileOrEmail: 'मोबाइल नंबर या ईमेल',
  mobileOrEmailPlaceholder: '10 अंकों का मोबाइल या ईमेल दर्ज करें',
  mobileHint: 'पंजीकृत मोबाइल नंबर या आधिकारिक ईमेल',
  password: 'पासवर्ड',
  passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
  showPassword: 'पासवर्ड दिखाएं',
  hidePassword: 'पासवर्ड छिपाएं',
  rememberMe: 'इस डिवाइस पर याद रखें',
  forgotPassword: 'पासवर्ड भूल गए?',
  signInBtn: 'साइन इन करें',
  signingIn: 'साइन इन हो रहा है…',
  noAccount: 'खाता नहीं है?',
  createAccount: 'नया खाता बनाएं',
  demoHint: 'त्वरित डेमो परीक्षण के लिए कोई भी नमूना विवरण मान्य है।',

  otpTitle: 'ओटीपी से साइन इन करें',
  otpSubtitle: 'हम आपके पंजीकृत मोबाइल नंबर पर 6 अंकों का कोड भेजेंगे।',
  mobileNumber: 'मोबाइल नंबर',
  mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
  mobileHintOtp: 'एसएमएस द्वारा 6 अंकों का कोड भेजा जाएगा',
  sendOtpBtn: 'ओटीपी भेजें',
  sendingOtp: 'ओटीपी भेजा जा रहा है…',
  enterOtpTitle: 'सत्यापन कोड दर्ज करें',
  sentTo: 'पर भेजा गया 6 अंकों का कोड',
  verifyOtpBtn: 'सत्यापित करें और साइन इन करें',
  verifying: 'सत्यापन हो रहा है…',
  resendIn: 'पुनः कोड भेजें',
  resendOtp: 'ओटीपी पुनः भेजें',
  changeNumber: 'नंबर बदलें',
  backToLogin: 'साइन इन पर वापस जाएं',
  otpSentMsg: 'सत्यापन कोड सफलतापूर्वक भेजा गया। परीक्षण के लिए 123456 दर्ज करें।',
  otpResent: 'एक नया सत्यापन कोड भेजा गया है।',

  createPatientAccount: 'मरीज खाता बनाएं',
  createDoctorAccount: 'डॉक्टर खाता बनाएं',
  createHospitalAccount: 'अस्पताल स्टाफ खाता बनाएं',
  createAdminAccount: 'प्रशासक खाता बनाएं',
  fillDetails: 'हेल्थश्युअर खाता बनाने के लिए कृपया विवरण भरें।',
  fullName: 'पूरा नाम',
  fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
  fullNameDoctorPlaceholder: 'उदा. डॉ. राजेश शर्मा',
  mobileField: 'मोबाइल नंबर',
  mobilePlaceholderReg: '10 अंकों का मोबाइल नंबर',
  emailField: 'ईमेल पता',
  emailOptional: '(वैकल्पिक)',
  emailRequired: '(स्टाफ हेतु अनिवार्य)',
  emailPlaceholderPatient: 'your.email@example.com (वैकल्पिक)',
  emailPlaceholderGovt: 'official.email@gov.in',
  dateOfBirth: 'जन्म तिथि',
  age: 'उम्र',
  agePlaceholder: 'उदा. 35',
  gender: 'लिंग',
  selectGender: 'लिंग चुनें',
  male: 'पुरुष',
  female: 'महिला',
  other: 'अन्य',
  preferNotToSay: 'बताना नहीं चाहते',
  location: 'गांव / कस्बा / जिला',
  locationPlaceholder: 'उदा. खेड, रत्नागिरी, महाराष्ट्र',
  preferredLanguage: 'पसंदीदा भाषा',
  selectLanguageField: 'भाषा चुनें',
  englishOption: 'English',
  hindiOption: 'हिन्दी',
  marathiOption: 'मराठी',
  medicalRegNo: 'चिकित्सा पंजीकरण संख्या',
  medicalRegPlaceholder: 'उदा. MMC-2018-12345',
  speciality: 'विशेषज्ञता / विभाग',
  specialityPlaceholder: 'उदा. कार्डियोलॉजी, जनरल मेडिसिन',
  hospitalFacility: 'अस्पताल / प्राथमिक स्वास्थ्य केंद्र',
  hospitalPlaceholder: 'उदा. जिला अस्पताल रत्नागिरी, PHC खेड',
  designation: 'पदनाम / पद',
  designationPlaceholder: 'उदा. स्टाफ नर्स, चिकित्सा अधिकारी',
  department: 'विभाग / प्राधिकरण',
  departmentPlaceholder: 'उदा. स्वास्थ्य सेवा निदेशालय, महाराष्ट्र',
  district: 'जिला / क्षेत्र',
  districtPlaceholder: 'उदा. रत्नागिरी जिला',
  passwordField: 'पासवर्ड',
  passwordMin: 'न्यूनतम 8 वर्ण',
  confirmPassword: 'पासवर्ड की पुष्टि करें',
  confirmPasswordPlaceholder: 'अपना पासवर्ड पुनः दर्ज करें',
  patientOtpNote: '🔐 मरीज सुरक्षित व पासवर्ड-मुक्त पहुंच के लिए ओटीपी से लॉगिन करते हैं।',
  createAccountBtn: 'खाता बनाएं',
  creatingAccount: 'खाता बनाया जा रहा है…',
  alreadyHaveAccount: 'पहले से खाता है?',
  signIn: 'साइन इन करें',
  accountCreatedTitle: 'खाता बन गया',
  accountCreatedMsg: 'आपके पोर्टल में साइन इन किया जा रहा है…',
  pleaseWait: 'कृपया प्रतीक्षा करें…',

  navOverview: 'अवलोकन',
  navAppointments: 'अपॉइंटमेंट',
  navOutreach: 'विशेषज्ञ आउटरीच',
  navRecords: 'स्वास्थ्य रिकॉर्ड',
  navReferrals: 'रेफरल ट्रैकिंग',
  navDiagnostics: 'जांच व लैब',
  navMedicines: 'दवाइयां',
  navTeleconsult: 'टेलीपरामर्श',
  navFollowups: 'फॉलो-अप',
  navProfile: 'मरीज प्रोफाइल',
  navHelp: 'मदद व सहायता',
  navLogout: 'साइन आउट',
  navHospitalCapacity: 'अस्पताल क्षमता',
  navPatients: 'मरीज निर्देशिका',
  navReports: 'प्रचालन रिपोर्ट',
  navTodayPatients: 'आज के मरीज',

  patientPortalTitle: 'मरीज पोर्टल • निरंतर देखभाल',
  doctorPortalTitle: 'डॉक्टर पोर्टल • विशेषज्ञ ओपीडी',
  hospitalPortalTitle: 'अस्पताल कंसोल • स्वास्थ्य नेटवर्क',
  adminPortalTitle: 'सरकारी स्वास्थ्य प्रशासन',

  welcomeBack: 'पुनः स्वागत है,',
  patientSubtitle: 'आपका ग्रामीण स्वास्थ्य निरंतरता डैशबोर्ड और सक्रिय क्लिनिकल समयरेखा।',
  quickBookApt: 'अपॉइंटमेंट बुक करें',
  quickViewRecords: 'स्वास्थ्य रिकॉर्ड',
  quickTrackReferral: 'रेफरल ट्रैक करें',
  quickVoiceHelp: 'वॉइस हेल्पलाइन',
  nextAptHeading: 'आगामी विशेषज्ञ अपॉइंटमेंट',
  activeReferralHeading: 'सक्रिय अंतर-अस्पताल रेफरल',
  outreachAlertHeading: 'आगामी PHC विशेषज्ञ शिविर',
  recentVitalsHeading: 'नवीनतम क्लिनिकल जांच (Vitals)',
  recentPrescriptionsHeading: 'सक्रिय दवाइयां व पर्चे',
  bookedSlot: 'आरक्षित समय',
  assignedDoctor: 'आवंटित डॉक्टर',
  phcKhedVenue: 'PHC खेड क्लिनिक',
  referralStatusText: 'हृदय रोग विशेषज्ञ परामर्श हेतु पूर्व-स्वीकृत',
  viewReferralTimeline: 'रेफरल समयरेखा देखें',

  appointmentsPageTitle: 'मेरे स्वास्थ्य अपॉइंटमेंट',
  appointmentsPageDesc: 'आगामी PHC दौरे, विशेषज्ञ शिविर और अस्पताल परामर्श प्रबंधित करें।',
  bookNewAptBtn: 'नया अपॉइंटमेंट बुक करें',
  tabUpcoming: 'आगामी',
  tabPast: 'पिछला इतिहास',
  tabAll: 'सभी अपॉइंटमेंट',
  filterSpeciality: 'सभी विशेषज्ञताएं',
  cardiology: 'कार्डियोलॉजी (हृदय रोग)',
  orthopaedics: 'ऑर्थोपेडिक्स (हड्डी व जोड़)',
  dermatology: 'त्वचा रोग (Dermatology)',
  generalMedicine: 'जनरल मेडिसिन (सामान्य ओपीडी)',
  ophthalmology: 'नेत्र रोग (Ophthalmology)',
  pediatrics: 'बाल रोग (Pediatrics)',
  token: 'टोकन',
  room: 'कक्ष',
  viewInstructions: 'दिशानिर्देश देखें',
  instructionsTitle: 'अपॉइंटमेंट तैयारी व दिशानिर्देश',
  cancelApt: 'रद्द करें',
  cancelling: 'रद्द हो रहा है…',
  cancelConfirm: 'क्या आप वाकई यह अपॉइंटमेंट रद्द करना चाहते हैं?',
  bookModalTitle: 'स्वास्थ्य अपॉइंटमेंट बुक करें',
  selectSpecialityLabel: 'विशेषज्ञता चुनें',
  selectFacilityLabel: 'स्वास्थ्य सुविधा / अस्पताल चुनें',
  consultModeLabel: 'परामर्श का प्रकार',
  inPersonMode: 'क्लिनिक में व्यक्तिगत भेंट',
  teleconsultMode: 'टेलीपरामर्श (वीडियो / ऑडियो)',
  preferredDateLabel: 'पसंदीदा तिथि',
  timeSlotLabel: 'समय स्लॉट',
  reasonSymptomsLabel: 'परामर्श का कारण / लक्षण',
  reasonPlaceholder: 'उदा. चलने पर सीने में जकड़न, या नियमित बीपी जांच...',
  confirmBookingBtn: 'अपॉइंटमेंट की पुष्टि करें',
  bookingSuccessMsg: 'अपॉइंटमेंट सफलतापूर्वक बुक हो गया।',

  outreachPageTitle: 'विशेषज्ञ आउटरीच शिविर अनुसूची',
  outreachPageDesc: 'मोबाइल मेडिकल यूनिट के साथ PHC खेड आने वाले अस्पताल विशेषज्ञ।',
  bookOutreachSlot: 'शिविर स्लॉट बुक करें',
  slotsAvailable: 'ग्रामीणों के लिए उपलब्ध स्लॉट',
  slotsFilled: 'बुक किए गए स्लॉट',
  mmuVehicle: 'मोबाइल मेडिकल यूनिट (MMU)',
  transportStatus: 'वाहन व परिवहन स्थिति',
  medicalKitVerified: 'ईसीजी व डायग्नोस्टिक किट उपलब्ध',
  outreachNotice: 'विशेषज्ञ शिविर से रत्नागिरी जाने की 45 किमी दूरी बचती है।',

  recordsPageTitle: 'दीर्घकालिक स्वास्थ्य रिकॉर्ड',
  recordsPageDesc: 'एकीकृत क्लिनिकल इतिहास, पर्चे, वाइटल्स और जांच रिपोर्ट।',
  searchRecordsPlaceholder: 'डॉक्टर, बीमारी, दवा या अस्पताल के नाम से खोजें...',
  abhaCardLabel: 'आभा (ABHA) स्वास्थ्य आईडी',
  bloodGroup: 'रक्त समूह (Blood Group)',
  allergies: 'ज्ञात एलर्जी',
  chronicConditions: 'पुरानी बीमारियां (Chronic Conditions)',
  clinicalAssessment: 'क्लिनिकल मूल्यांकन और निष्कर्ष',
  prescribedMedicines: 'निर्धारित दवाइयां',
  labReportsAttached: 'संलग्न लैब रिपोर्ट और स्कैन',
  downloadPdf: 'सारांश पीडीएफ डाउनलोड करें',
  recordTypeOPD: 'ओपीडी परामर्श',
  recordTypeLab: 'जांच रिपोर्ट',
  recordTypeReferral: 'रेफरल सारांश',

  referralsPageTitle: 'अंतर-सुविधा रेफरल ट्रैकिंग',
  referralsPageDesc: 'प्राथमिक स्वास्थ्य केंद्र से जिला अस्पताल तक मरीज ट्रांसफर की लाइव ट्रैकिंग।',
  referralIdLabel: 'रेफरल आईडी',
  referralPriority: 'प्राथमिकता',
  urgentPriority: 'आपातकालीन (Urgent)',
  normalPriority: 'नियमित विशेषज्ञ',
  referringCentre: 'रेफर करने वाला केंद्र',
  destinationFacility: 'गंतव्य अस्पताल',
  originFacility: 'मूल स्वास्थ्य केंद्र',
  doctorName: 'रेफर करने वाले डॉक्टर',
  specialityLabel: 'विभाग / विशेषज्ञता',
  acceptReferral: 'रेफरल स्वीकार करें',
  incomingReferrals: 'आने वाले पीएचसी रेफरल',
  clinicalIndication: 'रेफरल का क्लिनिकल कारण',
  digitalPass: 'हेल्थश्युअर डिजिटल रेफरल पास',
  step1Title: '1. प्राथमिक स्वास्थ्य केंद्र द्वारा रेफरल प्रारंभ',
  step2Title: '2. जिला अस्पताल को डिजिटल रेफरल प्रेषित',
  step3Title: '3. अस्पताल विशेषज्ञ द्वारा समीक्षा व ट्राइएज',
  step4Title: '4. अस्पताल स्वीकृत व स्लॉट आरक्षित',
  step5Title: '5. मरीज आगमन व ओपीडी टोकन आवंटित',
  step6Title: '6. विशेषज्ञ डॉक्टर परामर्श संपन्न',
  step7Title: '7. काउंटर-रेफरल व दवा योजना PHC को प्रेषित',

  diagnosticsPageTitle: 'सार्वजनिक जांच व लैब सेवाएं',
  diagnosticsPageDesc: 'PHC और जिला अस्पताल में जांच उपकरणों की स्थिति व रिपोर्ट मिलने का समय।',
  tatLabel: 'रिपोर्ट समय (TAT)',
  timingLabel: 'समय',
  prerequisitesLabel: 'तैयारी / खाली पेट जांच',
  freeServiceBadge: 'निःशुल्क सरकारी जांच सेवा',
  statusAvailable: 'आज उपलब्ध',
  statusLimited: 'सीमित स्लॉट',
  statusUnavailable: 'अस्थायी रूप से अनुपलब्ध',

  medicinesPageTitle: 'आवश्यक दवा भंडार व औषधालय',
  medicinesPageDesc: 'PHC खेड और जिला अस्पताल फार्मेसी में वास्तविक समय में दवा उपलब्धता।',
  genericName: 'जेनेरिक नाम',
  dosageForm: 'दवा का प्रकार (Form)',
  essentialDrugBadge: 'आवश्यक दवा सूची (निःशुल्क)',
  dispensaryHours: 'दवा वितरण समय: सुबह 08:30 से शाम 04:30 (सोम-शनि)',

  teleconsultPageTitle: 'टेलीपरामर्श क्लिनिक',
  teleconsultPageDesc: 'घर से या अपने स्थानीय PHC टेली-कियोस्क के माध्यम से विशेषज्ञ डॉक्टरों से परामर्श करें।',
  lowBandwidthExplainTitle: 'कम-बैंडविड्थ 2G अडेप्टिव मोड',
  lowBandwidthExplainDesc: 'गांव में इंटरनेट धीमा होने पर कॉल अपने आप स्पष्ट वॉइस मोड में बदल जाती है।',
  prescriptionSyncTitle: 'एकीकृत डिजिटल पर्चे',
  prescriptionSyncDesc: 'टेलीपरामर्श के दौरान जारी पर्चा सीधे PHC खेड फार्मेसी में उपलब्ध हो जाता है।',
  enterRoomBtn: 'परामर्श कक्ष में प्रवेश करें',
  liveConsultation: 'लाइव परामर्श',
  audio2gMode: '2G ऑडियो मोड सक्रिय',
  hdVideoActive: 'HD वीडियो सक्रिय',
  cameraDenied: 'कैमरा / माइक्रोफोन अनुमति अस्वीकृत',
  allowCameraSettings: 'ब्राउज़र साइट सेटिंग्स में कैमरा व माइक की अनुमति दें',
  endConsultation: 'परामर्श समाप्त करें',
  clinicalNotesSync: 'लाइव क्लिनिकल नोट्स',
  viewConsultationSummary: 'परामर्श सारांश देखें',

  followupsPageTitle: 'क्लिनिकल फॉलो-अप देखभाल',
  followupsPageDesc: 'परामर्श के बाद की चेकपॉइंट्स, पुरानी बीमारियों की निगरानी और स्वास्थ्य सुधार सत्यापन।',
  dueNow: 'आज देय (Due Now)',
  upcoming: 'आगामी',
  completed: 'पूर्ण',
  overdue: 'अतिदेय (Overdue)',
  scheduledDate: 'निर्धारित तिथि',
  clinicalPurpose: 'उद्देश्य व चेकलिस्ट',

  profilePageTitle: 'मरीज प्रोफाइल व आपातकालीन संपर्क',
  profilePageDesc: 'व्यक्तिगत विवरण, आभा कार्ड, संबद्ध प्राथमिक स्वास्थ्य केंद्र और मेडिकल इतिहास।',
  abhaNumber: 'आभा (ABHA) आईडी संख्या',
  village: 'गांव / मूल निवास',
  emergencyContacts: 'आपातकालीन संपर्क व परिजन',
  primaryCentreLink: 'संबद्ध प्राथमिक स्वास्थ्य केंद्र',
  editProfileBtn: 'प्रोफाइल संपादित करें',

  helpPageTitle: 'मदद, सहायता व शिकायत निवारण',
  helpPageDesc: 'अक्सर पूछे जाने वाले प्रश्न, आपातकालीन हेल्पलाइन और ग्रामीण मरीजों के लिए शिकायत दर्ज करने की सुविधा।',
  ambulance108: 'राष्ट्रीय एम्बुलेंस सेवा: 108',
  womenHelpline104: 'स्वास्थ्य सूचना हेल्पलाइन: 104',
  phcHelpline: 'PHC खेड हेल्पडेस्क: 02356-260124',
  fileGrievance: 'प्रतिक्रिया / शिकायत दर्ज करें',

  doctorOverviewTitle: 'डॉक्टर अवलोकन व क्लिनिकल ओपीडी',
  todaysAppointments: 'आज के मरीज',
  pendingReferrals: 'लंबित रेफरल',
  teleconsultations: 'टेलीपरामर्श',
  followUpsDue: 'फॉलो-अप देय',
  startConsultation: 'परामर्श प्रारंभ करें',
  viewRecord: 'मरीज रिकॉर्ड देखें',
  joinVideo: 'वीडियो कॉल से जुड़ें',
  hospitalOverviewTitle: 'अस्पताल संचालन केंद्र',
  intakeDesk: 'रेफरल इनटेक डेस्क',
  opdCapacity: 'ओपीडी विभाग क्षमता',
  occupiedBeds: 'भर्ती मरीज बेड',
  totalBeds: 'कुल बेड क्षमता',

  statusConfirmed: 'पुष्ट (Confirmed)',
  statusPending: 'लंबित (Pending)',
  statusCancelled: 'रद्द (Cancelled)',
  statusCompleted: 'पूर्ण (Completed)',
  statusHospitalAccepted: 'अस्पताल स्वीकृत (Accepted)',
  statusScheduled: 'विशेषज्ञ निर्धारित',
  statusUrgent: 'आपातकालीन (Urgent)',
  statusNormal: 'नियमित',
  statusDue: 'आज देय',
  statusOverdue: 'अतिदेय',
  emptyTitle: 'कोई रिकॉर्ड नहीं मिला',
  emptyDesc: 'इस अनुभाग में कोई सक्रिय रिकॉर्ड नहीं है।',

  adminPortalSubtitle: 'राज्य और जिला स्वास्थ्य सेवा निगरानी डैशबोर्ड',
  stateLabel: 'राज्य',
  allDistricts: 'सभी जिले',
  allFacilities: 'सभी स्वास्थ्य केंद्र',
  navFacilities: 'स्वास्थ्य केंद्र',
  navSettings: 'सेटिंग्स',
  patientsServed: 'लाभार्थी मरीज',
  activeReferrals: 'सक्रिय रेफरल',
  referralCompletionRate: 'रेफरल पूर्णता दर',
  outreachVisits: 'विशेषज्ञ आउटरीच',
  demoDataDisclaimer: 'सार्वजनिक स्वास्थ्य निगरानी हेतु प्रदर्शन डेमो डेटा',
  systemBottlenecks: 'सिस्टम बाधाएं (कार्रवाई आवश्यक)',
  facilityPerformance: 'जिला व केंद्रवार प्रदर्शन',
  referralPipeline: 'अंतर-सुविधा रेफरल पाइपलाइन',
  outreachCoverage: 'विशेषज्ञ आउटरीच कवरेज',
  outreachUtilization: 'आउटरीच उपयोगिता दर',
  slotsAvailableVsBooked: 'उपलब्ध बनाम बुक किए गए स्लॉट',
  teleconsultVolume: 'टेलीपरामर्श संख्या',
  lowBandwidthAdoption: '2G कम-बैंडविड्थ ऑडियो उपयोग',
  diagnosticReadiness: 'जांच व लैब उपकरण स्थिति',
  operationalReports: 'सार्वजनिक स्वास्थ्य रिपोर्ट',
  viewReport: 'विवरण देखें',
  exportPdf: 'पीडीएफ एक्सपोर्ट',
  exportCsv: 'सीएसवी एक्सपोर्ट',
  statusOperational: 'संचालित',
  statusAttentionRequired: 'ध्यान देने योग्य',
};

// ── Marathi Complete Dictionary ────────────────────────────────────────────
const mr: Translations = {
  ...en,
  appName: 'हेल्थश्युअर',
  appTagline: 'ग्रामीण निरंतर आरोग्य सेवा मंच',
  selectLanguage: 'भाषा निवडा',
  lightMode: 'लाइट मोड',
  darkMode: 'डार्क मोड',
  secureAccess: 'सुरक्षित आरोग्य सेवा प्रवेश • हेल्थश्युअर',
  tollFreeHelpline: 'टोल-फ्री: 1800-209-4477',
  callHelpline: 'टोल-फ्री हेल्पलाइनवर कॉल करा',
  notifications: 'सूचना',
  markAllAsRead: 'सर्व वाचलेले म्हणून चिन्हांकित करा',
  noNotifications: 'कोणतीही नवीन सूचना नाही',
  registeredPHC: 'प्राथमिक आरोग्य केंद्र',
  signedInAs: 'म्हणून साइन इन आहात',
  idLabel: 'आयडी',
  regNoLabel: 'नोंदणी क्रमांक',
  backBtn: 'मागे जा',
  closeBtn: 'बंद करा',
  cancelBtn: 'रद्द करा',
  confirmBtn: 'पुष्टी करा',
  saveBtn: 'जतन करा',
  submitBtn: 'सादर करा',
  searchPlaceholder: 'शोधा...',
  loading: 'लोड होत आहे...',
  noData: 'कोणतीही नोंद आढळली नाही',
  errorGeneric: 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
  successGeneric: 'कृती यशस्वीरित्या पूर्ण झाली.',
  viewAll: 'सर्व पहा',

  panelHeadline: 'अंतर कमी करा,',
  panelHeadlineAccent: 'आरोग्य पोहोचवा',
  panelDescription:
    'ग्रामीण रुग्ण, प्राथमिक आरोग्य केंद्र (PHC) आणि जिल्हा तज्ज्ञ डॉक्टरांना जोडणारे एकात्मिक सार्वजनिक आरोग्य सेवा नेटवर्क.',
  panelFeature1: 'प्राथमिक आरोग्य केंद्र आणि जिल्हा रुग्णालय रेफरल',
  panelFeature2: 'तज्ज्ञ शिबिर वेळापत्रक आणि टेलिपरामर्श',
  panelFeature3: 'आरोग्य नोंदी आणि नियमित औषध पुरवठा',
  panelFeature4: 'कमी कनेक्टिव्हिटी असलेल्या भागांसाठी व्हॉइस सहाय्य',
  panelTrust: 'सुरक्षित सार्वजनिक आरोग्य सेवा नेटवर्क',

  selectRoleTitle: 'आपली भूमिका निवडा',
  selectRoleSubtitle: 'आपण हेल्थश्युअर पोर्टलचा वापर कसा करणार आहात ते निवडा.',
  roleHint: 'लॉगिन करण्यासाठी वरीलपैकी भूमिका निवडा.',
  continueBtn: 'पुढे जा',

  rolePatientLabel: 'रुग्ण (Patient)',
  rolePatientDesc: 'परामर्श, अपॉइंटमेंट्स, रेफरल्स आणि आरोग्य नोंदी पहा',
  roleDoctorLabel: 'डॉक्टर / तज्ज्ञ (Doctor)',
  roleDoctorDesc: 'टेलिपरामर्श करा, रेफरल्स तपासा आणि ओपीडी सांभाळा',
  roleHospitalLabel: 'रुग्णालय कर्मचारी (Hospital Staff)',
  roleHospitalDesc: 'रुग्णालय क्षमता, खाटा, तपासण्या आणि रुग्ण प्रवेश व्यवस्थापित करा',
  roleAdminLabel: 'शासकीय प्रशासक (Admin)',
  roleAdminDesc: 'सार्वजनिक आरोग्य सेवा आणि शिबिरांचे निरीक्षण करा',

  signingInAs: 'म्हणून साइन इन करत आहात',
  changeRole: 'भूमिका बदला',
  passwordTab: 'पासवर्ड',
  otpTab: 'ओटीपी / फोन',
  mobileOrEmail: 'मोबाइल नंबर किंवा ईमेल',
  mobileOrEmailPlaceholder: '१० अंकी मोबाइल किंवा ईमेल टाका',
  mobileHint: 'नोंदणीकृत मोबाइल नंबर किंवा अधिकृत ईमेल',
  password: 'पासवर्ड',
  passwordPlaceholder: 'आपला पासवर्ड प्रविष्ट करा',
  showPassword: 'पासवर्ड दाखवा',
  hidePassword: 'पासवर्ड लपवा',
  rememberMe: 'या डिव्हाइसवर आठवणीत ठेवा',
  forgotPassword: 'पासवर्ड विसरलात?',
  signInBtn: 'साइन इन करा',
  signingIn: 'साइन इन होत आहे…',
  noAccount: 'खाते नाही?',
  createAccount: 'नवीन खाते तयार करा',
  demoHint: 'डेमो चाचणीसाठी कोणतेही नमुना तपशील चालतील.',

  otpTitle: 'ओटीपीने साइन इन करा',
  otpSubtitle: 'आम्ही आपल्या नोंदणीकृत मोबाइलवर ६ अंकी कोड पाठवू.',
  mobileNumber: 'मोबाइल नंबर',
  mobilePlaceholder: '१० अंकी मोबाइल नंबर',
  mobileHintOtp: 'एसएमएसद्वारे ६ अंकी कोड पाठवला जाईल',
  sendOtpBtn: 'ओटीपी पाठवा',
  sendingOtp: 'ओटीपी पाठवला जात आहे…',
  enterOtpTitle: 'सत्यापन कोड टाका',
  sentTo: 'वर पाठवलेला कोड',
  verifyOtpBtn: 'सत्यापित करा आणि साइन इन करा',
  verifying: 'सत्यापन होत आहे…',
  resendIn: 'पुन्हा कोड पाठवा',
  resendOtp: 'ओटीपी पुन्हा पाठवा',
  changeNumber: 'नंबर बदला',
  backToLogin: 'साइन इनकडे परत जा',
  otpSentMsg: 'सत्यापन कोड यशस्वीरित्या पाठवला. चाचणीसाठी 123456 वापरा.',
  otpResent: 'नवीन सत्यापन कोड पाठवला गेला आहे.',

  createPatientAccount: 'रुग्ण खाते तयार करा',
  createDoctorAccount: 'डॉक्टर खाते तयार करा',
  createHospitalAccount: 'रुग्णालय कर्मचारी खाते तयार करा',
  createAdminAccount: 'प्रशासक खाते तयार करा',
  fillDetails: 'हेल्थश्युअर खाते तयार करण्यासाठी तपशील भरा.',
  fullName: 'पूर्ण नाव',
  fullNamePlaceholder: 'आपले पूर्ण नाव प्रविष्ट करा',
  fullNameDoctorPlaceholder: 'उदा. डॉ. राजेश पाटील',
  mobileField: 'मोबाइल नंबर',
  mobilePlaceholderReg: '१० अंकी मोबाइल नंबर',
  emailField: 'ईमेल पत्ता',
  emailOptional: '(पर्यायी)',
  emailRequired: '(कर्मचाऱ्यांसाठी आवश्यक)',
  emailPlaceholderPatient: 'your.email@example.com (पर्यायी)',
  emailPlaceholderGovt: 'official.email@gov.in',
  dateOfBirth: 'जन्मतारीख',
  age: 'वय',
  agePlaceholder: 'उदा. ३५',
  gender: 'लिंग',
  selectGender: 'लिंग निवडा',
  male: 'पुरुष',
  female: 'स्त्री',
  other: 'इतर',
  preferNotToSay: 'सांगणे पसंत नाही',
  location: 'गाव / शहर / जिल्हा',
  locationPlaceholder: 'उदा. खेड, रत्नागिरी, महाराष्ट्र',
  preferredLanguage: 'पसंतीची भाषा',
  selectLanguageField: 'भाषा निवडा',
  englishOption: 'English',
  hindiOption: 'हिन्दी',
  marathiOption: 'मराठी',
  medicalRegNo: 'वैद्यकीय नोंदणी क्रमांक',
  medicalRegPlaceholder: 'उदा. MMC-2018-12345',
  speciality: 'विशेषज्ञता / विभाग',
  specialityPlaceholder: 'उदा. कार्डिओलॉजी, जनरल मेडिसिन',
  hospitalFacility: 'रुग्णालय / प्राथमिक आरोग्य केंद्र',
  hospitalPlaceholder: 'उदा. जिल्हा रुग्णालय रत्नागिरी, PHC खेड',
  designation: 'पदनाम',
  designationPlaceholder: 'उदा. वॉर्ड परिचारिका, वैद्यकीय अधिकारी',
  department: 'विभाग / प्राधिकरण',
  departmentPlaceholder: 'उदा. आरोग्य सेवा संचालनालय, महाराष्ट्र',
  district: 'जिल्हा / कार्यक्षेत्र',
  districtPlaceholder: 'उदा. रत्नागिरी जिल्हा',
  passwordField: 'पासवर्ड',
  passwordMin: 'किमान ८ अक्षरे',
  confirmPassword: 'पासवर्ड पुष्टी करा',
  confirmPasswordPlaceholder: 'पासवर्ड पुन्हा प्रविष्ट करा',
  patientOtpNote: '🔐 रुग्ण सुरक्षित आणि पासवर्डमुक्त प्रवेशासाठी ओटीपीने साइन इन करतात.',
  createAccountBtn: 'खाते तयार करा',
  creatingAccount: 'खाते तयार होत आहे…',
  alreadyHaveAccount: 'आधीच खाते आहे?',
  signIn: 'साइन इन करा',
  accountCreatedTitle: 'खाते तयार झाले',
  accountCreatedMsg: 'तुमच्या पोर्टलमध्ये साइन इन होत आहे…',
  pleaseWait: 'कृपया थांबा…',

  navOverview: 'आढावा',
  navAppointments: 'अपॉइंटमेंट्स',
  navOutreach: 'तज्ज्ञ आउटरीच',
  navRecords: 'आरोग्य नोंदी',
  navReferrals: 'रेफरल ट्रॅकिंग',
  navDiagnostics: 'तपासण्या व लॅब',
  navMedicines: 'औषधे',
  navTeleconsult: 'टेलिपरामर्श',
  navFollowups: 'फॉलो-अप',
  navProfile: 'रुग्ण प्रोफाइल',
  navHelp: 'मदत व सहाय्य',
  navLogout: 'साइन आउट',
  navHospitalCapacity: 'रुग्णालय क्षमता',
  navPatients: 'रुग्ण निर्देशिका',
  navReports: 'कार्य अहवाल',
  navTodayPatients: 'आजचे रुग्ण',

  patientPortalTitle: 'रुग्ण पोर्टल • निरंतर आरोग्य सेवा',
  doctorPortalTitle: 'डॉक्टर पोर्टल • विशेषज्ञ ओपीडी',
  hospitalPortalTitle: 'रुग्णालय कन्सोल • आरोग्य नेटवर्क',
  adminPortalTitle: 'शासकीय आरोग्य प्रशासन',

  welcomeBack: 'पुन्हा स्वागत आहे,',
  patientSubtitle: 'आपला ग्रामीण आरोग्य सातत्य डॅशबोर्ड आणि सक्रिय क्लिनिकल टाइमलाइन.',
  quickBookApt: 'अपॉइंटमेंट बुक करा',
  quickViewRecords: 'आरोग्य नोंदी',
  quickTrackReferral: 'रेफरल ट्रॅक करा',
  quickVoiceHelp: 'व्हॉइस हेल्पलाइन',
  nextAptHeading: 'आगामी विशेषज्ञ अपॉइंटमेंट',
  activeReferralHeading: 'सक्रिय आंतर-रुग्णालय रेफरल',
  outreachAlertHeading: 'आगामी PHC विशेषज्ञ शिबिर',
  recentVitalsHeading: 'नवीनतम क्लिनिकल तपासणी (Vitals)',
  recentPrescriptionsHeading: 'सक्रिय औषधे व प्रिस्क्रिप्शन',
  bookedSlot: 'आरक्षित वेळ',
  assignedDoctor: 'नियुक्त डॉक्टर',
  phcKhedVenue: 'PHC खेड क्लिनिक',
  referralStatusText: 'हृदयरोग विशेषज्ञ सल्लामसलतीसाठी पूर्व-मंजूर',
  viewReferralTimeline: 'रेफरल टाइमलाइन पहा',

  appointmentsPageTitle: 'माझ्या आरोग्य अपॉइंटमेंट्स',
  appointmentsPageDesc: 'आगामी PHC भेटी, विशेषज्ञ शिबिरे आणि रुग्णालय सल्लामसलत व्यवस्थापित करा.',
  bookNewAptBtn: 'नवीन अपॉइंटमेंट बुक करा',
  tabUpcoming: 'आगामी',
  tabPast: 'मागील इतिहास',
  tabAll: 'सर्व अपॉइंटमेंट्स',
  filterSpeciality: 'सर्व विशेषज्ञता',
  cardiology: 'कार्डिओलॉजी (हृदयरोग)',
  orthopaedics: 'ऑर्थोपेडिक्स (हाडे व सांधे)',
  dermatology: 'त्वचारोग (Dermatology)',
  generalMedicine: 'जनरल मेडिसिन (सामान्य ओपीडी)',
  ophthalmology: 'नेत्ररोग (Ophthalmology)',
  pediatrics: 'बालरोग (Pediatrics)',
  token: 'टोकन',
  room: 'खोली क्र.',
  viewInstructions: 'सूचना पहा',
  instructionsTitle: 'अपॉइंटमेंट पूर्वतयारी व सूचना',
  cancelApt: 'रद्द करा',
  cancelling: 'रद्द होत आहे…',
  cancelConfirm: 'आपण ही अपॉइंटमेंट नक्की रद्द करू इच्छिता?',
  bookModalTitle: 'आरोग्य अपॉइंटमेंट बुक करा',
  selectSpecialityLabel: 'विशेषज्ञता निवडा',
  selectFacilityLabel: 'आरोग्य केंद्र / रुग्णालय निवडा',
  consultModeLabel: 'सल्लामसलतीचा प्रकार',
  inPersonMode: 'क्लिनिकमध्ये प्रत्यक्ष भेट',
  teleconsultMode: 'टेलिपरामर्श (व्हिडिओ / ऑडिओ)',
  preferredDateLabel: 'पसंतीची तारीख',
  timeSlotLabel: 'वेळ स्लॉट',
  reasonSymptomsLabel: 'भेटीचे कारण / लक्षणे',
  reasonPlaceholder: 'उदा. चालताना छातीत जड वाटणे, किंवा नियमित बीपी तपासणी...',
  confirmBookingBtn: 'अपॉइंटमेंट पुष्टी करा',
  bookingSuccessMsg: 'अपॉइंटमेंट यशस्वीरित्या बुक झाली.',

  outreachPageTitle: 'तज्ज्ञ आउटरीच शिबिर वेळापत्रक',
  outreachPageDesc: 'मोबाईल मेडिकल युनिटसह PHC खेड येथे भेट देणारे रुग्णालय तज्ज्ञ.',
  bookOutreachSlot: 'शिबिर स्लॉट बुक करा',
  slotsAvailable: 'गावकऱ्यांसाठी उपलब्ध स्लॉट',
  slotsFilled: 'बुक केलेले स्लॉट',
  mmuVehicle: 'मोबाईल मेडिकल युनिट (MMU)',
  transportStatus: 'वाहतूक व वाहन स्थिती',
  medicalKitVerified: 'ईसीजी व डायग्नोस्टिक किट पुरवले आहे',
  outreachNotice: 'विशेषज्ञ शिबिरामुळे रत्नागिरीला जाण्याचे ४५ किमी अंतर वाचते.',

  recordsPageTitle: 'दीर्घकालीन आरोग्य नोंदी',
  recordsPageDesc: 'एकात्मिक क्लिनिकल इतिहास, प्रिस्क्रिप्शन, वाइटल्स आणि तपासणी अहवाल.',
  searchRecordsPlaceholder: 'डॉक्टर, आजार, औषध किंवा रुग्णालयाच्या नावाने शोधा...',
  abhaCardLabel: 'आभा (ABHA) आरोग्य ओळखपत्र',
  bloodGroup: 'रक्तगट (Blood Group)',
  allergies: 'माहिती असलेली ॲलर्जी',
  chronicConditions: 'दीर्घकालीन आजार (Chronic Conditions)',
  clinicalAssessment: 'क्लिनिकल मूल्यांकन आणि निरीक्षणे',
  prescribedMedicines: 'दिलेली औषधे',
  labReportsAttached: 'जोडलेले लॅब अहवाल आणि स्कॅन',
  downloadPdf: 'सारांश पीडीएफ डाउनलोड करा',
  recordTypeOPD: 'ओपीडी सल्लामसलत',
  recordTypeLab: 'तपासणी अहवाल',
  recordTypeReferral: 'रेफरल सारांश',

  referralsPageTitle: 'आंतर-सुविधा रेफरल ट्रॅकिंग',
  referralsPageDesc: 'प्राथमिक आरोग्य केंद्राकडून जिल्हा रुग्णालयाकडे रुग्ण हस्तांतरणाची थेट स्थिती.',
  referralIdLabel: 'रेफरल आयडी',
  referralPriority: 'प्राधान्यता',
  urgentPriority: 'तातडीचे (Urgent)',
  normalPriority: 'नियमित विशेषज्ञ',
  referringCentre: 'रेफर करणारे केंद्र',
  destinationFacility: 'गंतव्य रुग्णालय',
  originFacility: 'मूळ आरोग्य केंद्र',
  doctorName: 'रेफर करणारे डॉक्टर',
  specialityLabel: 'विभाग / स्पेशालिटी',
  acceptReferral: 'रेफरल स्वीकारा',
  incomingReferrals: 'येणारे पीएचसी रेफरल',
  clinicalIndication: 'रेफरलचे क्लिनिकल कारण',
  digitalPass: 'हेल्थश्युअर डिजिटल रेफरल पास',
  step1Title: '१. प्राथमिक आरोग्य केंद्रातर्फे रेफरल सुरू',
  step2Title: '२. जिल्हा रुग्णालयाला डिजिटल रेफरल पाठवले',
  step3Title: '३. रुग्णालय तज्ज्ञांकडून पुनरावलोकन व ट्रायज',
  step4Title: '४. रुग्णालय मंजूर व स्लॉट आरक्षित',
  step5Title: '५. रुग्ण आगमन व ओपीडी टोकन वाटप',
  step6Title: '६. विशेषज्ञ डॉक्टर सल्लामसलत पूर्ण',
  step7Title: '७. काउंटर-रेफरल व औषध योजना PHC कडे पाठवली',

  diagnosticsPageTitle: 'सार्वजनिक तपासणी व लॅब सेवा',
  diagnosticsPageDesc: 'PHC आणि जिल्हा रुग्णालयातील तपासणी उपकरणांची स्थिती व अहवाल वेळ.',
  tatLabel: 'अहवाल वेळ (TAT)',
  timingLabel: 'कामाची वेळ',
  prerequisitesLabel: 'तयारी / उपाशीपोटी तपासणी',
  freeServiceBadge: 'मोफत शासकीय तपासणी सेवा',
  statusAvailable: 'आज उपलब्ध',
  statusLimited: 'मर्यादित स्लॉट',
  statusUnavailable: 'तात्पुरते अनुपलब्ध',

  medicinesPageTitle: 'आवश्यक औषध साठा व औषधालय',
  medicinesPageDesc: 'PHC खेड आणि जिल्हा रुग्णालय फार्मसीमधील थेट औषध उपलब्धता.',
  genericName: 'जेनेरिक नाव',
  dosageForm: 'औषधाचा प्रकार (Form)',
  essentialDrugBadge: 'आवश्यक औषध सूची (मोफत पुरवठा)',
  dispensaryHours: 'औषध वितरण वेळ: सकाळी ०८:३० ते सायंकाळी ०४:३० (सोम-शनि)',

  teleconsultPageTitle: 'टेलिपरामर्श क्लिनिक',
  teleconsultPageDesc: 'घरातून किंवा आपल्या स्थानिक PHC टेलि-किऑस्कवरून विशेषज्ञ डॉक्टरांचा सल्ला घ्या.',
  lowBandwidthExplainTitle: 'कमी बँडविड्थ 2G अ‍ॅडॉप्टिव्ह मोड',
  lowBandwidthExplainDesc: 'गावात इंटरनेट मंद असल्यास कॉल आपोआप स्पष्ट ऑडिओ मोडमध्ये चालू राहतो.',
  prescriptionSyncTitle: 'एकात्मिक डिजिटल प्रिस्क्रिप्शन',
  prescriptionSyncDesc: 'टेलिपरामर्शात दिलेले औषध थेट PHC खेड फार्मसीमधून घेता येते.',
  enterRoomBtn: 'सल्लामसलत कक्षात प्रवेश करा',
  liveConsultation: 'थेट सल्लामसलत',
  audio2gMode: '2G ऑडिओ मोड सक्रिय',
  hdVideoActive: 'HD व्हिडिओ सक्रिय',
  cameraDenied: 'कॅमेरा / माइक परवानगी नाकारली',
  allowCameraSettings: 'ब्राउझर सेटिंग्जमध्ये कॅमेरा व माइकची परवानगी द्या',
  endConsultation: 'सल्लामसलत समाप्त करा',
  clinicalNotesSync: 'थेट क्लिनिकल नोंदी',
  viewConsultationSummary: 'सल्लामसलत सारांश पहा',

  followupsPageTitle: 'क्लिनिकल फॉलो-अप काळजी',
  followupsPageDesc: 'सल्लामसलतीनंतरच्या तपासण्या, दीर्घकालीन आजारांचे निरीक्षण आणि आरोग्य सुधारणा.',
  dueNow: 'आज देय (Due Now)',
  upcoming: 'आगामी',
  completed: 'पूर्ण',
  overdue: 'मुदत उलटून गेलेली',
  scheduledDate: 'नियोजित तारीख',
  clinicalPurpose: 'उद्देश व तपासणी सूची',

  profilePageTitle: 'रुग्ण प्रोफाइल व आपत्कालीन संपर्क',
  profilePageDesc: 'वैयक्तिक माहिती, आभा ओळखपत्र, संलग्न प्राथमिक आरोग्य केंद्र आणि वैद्यकीय इतिहास.',
  abhaNumber: 'आभा (ABHA) आयडी क्रमांक',
  village: 'गाव / मूळ पत्ता',
  emergencyContacts: 'आपत्कालीन संपर्क व नातेवाईक',
  primaryCentreLink: 'संलग्न प्राथमिक आरोग्य केंद्र',
  editProfileBtn: 'प्रोफाइल संपादित करा',

  helpPageTitle: 'मदत, सहाय्य व तक्रार निवारण',
  helpPageDesc: 'वारंवार विचारले जाणारे प्रश्न, आपत्कालीन हेल्पलाइन आणि ग्रामीण रुग्णांसाठी तक्रार नोंदणी.',
  ambulance108: 'राष्ट्रीय रुग्णवाहिका सेवा: १०८',
  womenHelpline104: 'आरोग्य माहिती हेल्पलाइन: १०४',
  phcHelpline: 'PHC खेड हेल्पडेस्क: ०२३५६-२६०१२४',
  fileGrievance: 'अभिप्राय / तक्रार नोंदवा',

  doctorOverviewTitle: 'डॉक्टर आढावा व क्लिनिकल ओपीडी',
  todaysAppointments: 'आजचे रुग्ण',
  pendingReferrals: 'प्रलंबित रेफरल्स',
  teleconsultations: 'टेलिपरामर्श',
  followUpsDue: 'फॉलो-अप देय',
  startConsultation: 'सल्लामसलत सुरू करा',
  viewRecord: 'रुग्ण नोंद पहा',
  joinVideo: 'व्हिडिओ कॉल सुरू करा',
  hospitalOverviewTitle: 'रुग्णालय कार्य केंद्र',
  intakeDesk: 'रेफरल इनटेक डेस्क',
  opdCapacity: 'ओपीडी विभाग क्षमता',
  occupiedBeds: 'दाखल रुग्ण खाटा',
  totalBeds: 'एकूण खाटांची क्षमता',

  statusConfirmed: 'पुष्ट (Confirmed)',
  statusPending: 'प्रलंबित (Pending)',
  statusCancelled: 'रद्द (Cancelled)',
  statusCompleted: 'पूर्ण (Completed)',
  statusHospitalAccepted: 'रुग्णालय मंजूर (Accepted)',
  statusScheduled: 'विशेषज्ञ नियोजित',
  statusUrgent: 'तातडीचे (Urgent)',
  statusNormal: 'नियमित',
  statusDue: 'आज देय',
  statusOverdue: 'मुदत उलटून गेलेली',
  emptyTitle: 'कोणतीही नोंद आढळली नाही',
  emptyDesc: 'या विभागात कोणतीही सक्रिय नोंद उपलब्ध नाही.',

  adminPortalSubtitle: 'राज्य व जिल्हा आरोग्य सेवा संनियंत्रण डॅशबोर्ड',
  stateLabel: 'राज्य',
  allDistricts: 'सर्व जिल्हे',
  allFacilities: 'सर्व आरोग्य केंद्रे',
  navFacilities: 'आरोग्य केंद्रे',
  navSettings: 'सेटिंग्ज',
  patientsServed: 'सेवा घेतलेले रुग्ण',
  activeReferrals: 'सक्रिय रेफरल्स',
  referralCompletionRate: 'रेफरल पूर्णता प्रमाण',
  outreachVisits: 'तज्ज्ञ शिबिरे',
  demoDataDisclaimer: 'सार्वजनिक आरोग्य संनियंत्रणासाठी प्रात्यक्षिक डेमो डेटा',
  systemBottlenecks: 'प्रणालीतील अडथळे (लक्ष देणे आवश्यक)',
  facilityPerformance: 'जिल्हा व केंद्रानिहाय कामगिरी',
  referralPipeline: 'आंतर-सुविधा रेफरल पाइपलाइन',
  outreachCoverage: 'तज्ज्ञ शिबिर व्याप्ती',
  outreachUtilization: 'शिबिर उपयोगिता दर',
  slotsAvailableVsBooked: 'उपलब्ध विरुद्ध नोंदणी केलेले स्लॉट्स',
  teleconsultVolume: 'टेलिकन्सल्टेशन प्रमाण',
  lowBandwidthAdoption: '2G कमी-बँडविड्थ ऑडिओ वापर',
  diagnosticReadiness: 'तपासणी व लॅब सज्जता',
  operationalReports: 'सार्वजनिक आरोग्य अहवाल',
  viewReport: 'तपशील पहा',
  exportPdf: 'पीडीएफ एक्सपोर्ट',
  exportCsv: 'सीएसव्ही एक्सपोर्ट',
  statusOperational: 'कार्यरत',
  statusAttentionRequired: 'लक्ष देणे आवश्यक',
};

// ── Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Bhojpuri, Konkani Dictionaries ──
const bn: Translations = {
  ...en,
  appName: 'হেলথশিওর',
  appTagline: 'গ্রামীণ ধারাবাহিক স্বাস্থ্যসেবা প্ল্যাটফর্ম',
  selectLanguage: 'ভাষা নির্বাচন করুন',
  selectRoleTitle: 'আপনার ভূমিকা নির্বাচন করুন',
  continueBtn: 'এগিয়ে যান',
  navOverview: 'সংক্ষিপ্ত বিবরণ',
  navAppointments: 'অ্যাপয়েন্টমেন্ট',
  navRecords: 'স্বাস্থ্য রেকর্ড',
  navReferrals: 'রেফারেল ট্র্যাকিং',
  navTeleconsult: 'টেলিপরামর্শ',
  navHelp: 'সাহায্য ও সহায়তা',
  navLogout: 'সাইন আউট',
  callHelpline: 'টোল-ফ্রি হেল্পলাইনে কল করুন',
  tollFreeHelpline: 'টোল-ফ্রি: ১৮০০-২০৯-৪৪৭৭',
  signInBtn: 'সাইন ইন করুন',
  secureAccess: 'নিরাপদ স্বাস্থ্যসেবা অ্যাক্সেस • হেলথশিওর',
  patientPortalTitle: 'রোগী পোর্টাল • স্বাস্থ্য ধারাবাহিকতা',
};

const te: Translations = {
  ...en,
  appName: 'హెల్త్‌ష్యూర్',
  appTagline: 'గ్రామీణ నిరంతర ఆరోగ్య సేవల వేదిక',
  selectLanguage: 'భాషను ఎంచుకోండి',
  selectRoleTitle: 'మీ పాత్రను ఎంచుకోండి',
  continueBtn: 'కొనసాగించండి',
  navOverview: 'అవలోకనం',
  navAppointments: 'అపాయింట్‌మెంట్లు',
  navRecords: 'ఆరోగ్య రికార్డులు',
  navReferrals: 'రిఫరల్ ట్రాకింగ్',
  navTeleconsult: 'టెలికన్సల్టేషన్',
  navHelp: 'సహాయం & మద్దతు',
  navLogout: 'లాగ్ అవుట్',
  callHelpline: 'టోల్-ఫ్రీ హెల్ప్‌లైన్‌కు కాల్ చేయండి',
  tollFreeHelpline: 'టోల్-ఫ్రీ: 1800-209-4477',
  signInBtn: 'సైన్ ఇన్ చేయండి',
  secureAccess: 'సురక్షిత ఆరోగ్య సంరక్షణ • హెల్త్‌ష్యూర్',
  patientPortalTitle: 'రోగి పోర్టల్ • సంరక్షణ కొనసాగింపు',
};

const ta: Translations = {
  ...en,
  appName: 'ஹெல்த்ச்யூர்',
  appTagline: 'கிராமப்புற தொடர் சுகாதார சேவை தளம்',
  selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
  selectRoleTitle: 'உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்',
  continueBtn: 'தொடரவும்',
  navOverview: 'கண்ணோட்டம்',
  navAppointments: 'முன்பதிவுகள்',
  navRecords: 'சுகாதார பதிவுகள்',
  navReferrals: 'பரிந்துரை கண்காணிப்பு',
  navTeleconsult: 'தொலைமருத்துவம்',
  navHelp: 'உதவி & ஆதரவு',
  navLogout: 'வெளியேறு',
  callHelpline: 'இலவச உதவி எண்ணை அழைக்கவும்',
  tollFreeHelpline: 'கட்டணமில்லா எண்: 1800-209-4477',
  signInBtn: 'உள்நுழைக',
  secureAccess: 'பாதுகாப்பான சுகாதார அணுகல் • ஹெல்த்ச்யூர்',
  patientPortalTitle: 'நோயாளி போர்டல் • தொடர் சிகிச்சை',
};

const gu: Translations = {
  ...en,
  appName: 'હેલ્થશ્યોર',
  appTagline: 'ગ્રામીણ સતત આરોગ્ય સેવા મંચ',
  selectLanguage: 'ભાષા પસંદ કરો',
  selectRoleTitle: 'તમારી ભૂમિકા પસંદ કરો',
  continueBtn: 'આગળ વધો',
  navOverview: 'ઝાંખી',
  navAppointments: 'મુલાકાતો',
  navRecords: 'આરોગ્ય રેકોર્ડ્સ',
  navReferrals: 'રેફરલ ટ્રેકિંગ',
  navTeleconsult: 'ટેલીકન્સલ્ટેશન',
  navHelp: 'મદદ અને સહાય',
  navLogout: 'સાઇન આઉટ',
  callHelpline: 'ટોલ-ફ્રી હેલ્પલાઇન પર કૉલ કરો',
  tollFreeHelpline: 'ટોલ-ફ્રી: 1800-209-4477',
  signInBtn: 'સાઇન ઇન કરો',
  secureAccess: 'સુરક્ષિત આરોગ્ય સેવા • હેલ્થશ્યોર',
  patientPortalTitle: 'દર્દી પોર્ટલ • સંભાળ સાતત્ય',
};

const kn: Translations = {
  ...en,
  appName: 'ಹೆಲ್ತ್‌ಶ್ಯೂರ್',
  appTagline: 'ಗ್ರಾಮೀಣ ನಿರಂತರ ಆರೋಗ್ಯ ಸೇವಾ ವೇದಿಕೆ',
  selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  selectRoleTitle: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  continueBtn: 'ಮುಂದುವರಿಯಿರಿ',
  navOverview: 'ಅವಲೋಕನ',
  navAppointments: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',
  navRecords: 'ಆರೋಗ್ಯ ದಾಖಲೆಗಳು',
  navReferrals: 'ರೆಫರಲ್‌ಗಳು',
  navTeleconsult: 'ಟೆಲಿಸಮಾಲೋಚನೆ',
  navHelp: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
  navLogout: 'ಸೈನ್ ಔಟ್',
  callHelpline: 'ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ',
  tollFreeHelpline: 'ಟೋಲ್-ಫ್ರೀ: 1800-209-4477',
  signInBtn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ',
  secureAccess: 'ಸುರಕ್ಷಿತ ಆರೋಗ್ಯ ಪ್ರವೇಶ • ಹೆಲ್ತ್‌ಶ್ಯೂರ್',
  patientPortalTitle: 'ರೋಗಿ ಪೋರ್ಟಲ್ • ಆರೈಕೆ ನಿರಂತರತೆ',
};

const ml: Translations = {
  ...en,
  appName: 'ഹെൽത്ത്ഷുവർ',
  appTagline: 'ഗ്രാമീണ ആരോഗ്യ സേവന പ്ലാറ്റ്ഫോം',
  selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
  selectRoleTitle: 'നിങ്ങളുടെ പങ്ക് തിരഞ്ഞെടുക്കുക',
  continueBtn: 'തുടരുക',
  navOverview: 'അവലോകനം',
  navAppointments: 'അപ്പോയിന്റ്മെന്റുകൾ',
  navRecords: 'ആരോഗ്യ രേഖകൾ',
  navReferrals: 'റഫറലുകൾ',
  navTeleconsult: 'ടെലികൺസൾട്ടേഷൻ',
  navHelp: 'സഹായം',
  navLogout: 'സൈൻ ഔട്ട്',
  callHelpline: 'ടോൾ-ഫ്രീ ഹെൽപ്പ് ലൈനിലേക്ക് വിളിക്കുക',
  tollFreeHelpline: 'ടോൾ-ഫ്രീ: 1800-209-4477',
  signInBtn: 'സൈൻ ഇൻ ചെയ്യുക',
  secureAccess: 'സുരക്ഷിത ആരോഗ്യ സംരക്ഷണം • ഹെൽത്ത്ഷുവർ',
  patientPortalTitle: 'രോഗി പോർട്ടൽ • പരിചരണ തുടർച്ച',
};

const pa: Translations = {
  ...en,
  appName: 'ਹੈਲਥਸ਼ਿਓਰ',
  appTagline: 'ਪੇਂਡੂ ਨਿਰੰਤਰ ਸਿਹਤ ਸੰਭਾਲ ਪਲੇਟਫਾਰਮ',
  selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
  selectRoleTitle: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ',
  continueBtn: 'ਅੱਗੇ ਵਧੋ',
  navOverview: 'ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
  navAppointments: 'ਮੁਲਾਕਾਤਾਂ',
  navRecords: 'ਸਿਹਤ ਰਿਕਾਰਡ',
  navReferrals: 'ਰੈਫ਼ਰਲ',
  navTeleconsult: 'ਟੈਲੀ-ਮਸ਼ਵਰਾ',
  navHelp: 'ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ',
  navLogout: 'ਸਾਈਨ ਆਉਟ',
  callHelpline: 'ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ ਤੇ ਕਾਲ ਕਰੋ',
  tollFreeHelpline: 'ਟੋਲ-ਫ੍ਰੀ: 1800-209-4477',
  signInBtn: 'ਸਾਈਨ ਇਨ ਕਰੋ',
  secureAccess: 'ਸੁਰੱਖਿਅਤ ਸਿਹਤ ਸੰਭਾਲ • ਹੈਲਥਸ਼ਿਓਰ',
  patientPortalTitle: 'ਮਰੀਜ਼ ਪੋਰਟਲ • ਦੇਖਭਾਲ ਨਿਰੰਤਰਤਾ',
};

const or: Translations = {
  ...en,
  appName: 'ହେଲଥସ୍ୟୁର',
  appTagline: 'ଗ୍ରାମୀଣ ନିରନ୍ତର ସ୍ୱାସ୍ଥ୍ୟସେବା ପ୍ଲାଟଫର୍ମ',
  selectLanguage: 'ଭାଷା ଚୟନ କରନ୍ତୁ',
  selectRoleTitle: 'ଆପଣଙ୍କ ଭୂମିକା ଚୟନ କରନ୍ତୁ',
  continueBtn: 'ଆଗକୁ ବଢ଼ନ୍ତୁ',
  navOverview: 'ସମୀକ୍ଷା',
  navAppointments: 'ଆପଏଣ୍ଟମେଣ୍ଟ',
  navRecords: 'ସ୍ୱାସ୍ଥ୍ୟ ରେକର୍ଡ',
  navReferrals: 'ରେଫରାଲ',
  navTeleconsult: 'ଟେଲିପରାମର୍ଶ',
  navHelp: 'ସାହାଯ୍ୟ ଓ ସମର୍ଥନ',
  navLogout: 'ସାଇନ ଆଉଟ',
  callHelpline: 'ଟୋଲ-ଫ୍ରି ହେଲ୍ପଲାଇନକୁ କଲ କରନ୍ତୁ',
  tollFreeHelpline: 'ଟୋଲ-ଫ୍ରି: 1800-209-4477',
  signInBtn: 'ସାଇନ ଇନ କରନ୍ତୁ',
  secureAccess: 'ସୁରକ୍ଷିତ ସ୍ୱାସ୍ଥ୍ୟସେବା • ହେଲଥସ୍ୟୁର',
  patientPortalTitle: 'ରୋଗୀ ପୋର୍ଟାଲ • ସ୍ୱାସ୍ଥ୍ୟ ନିରନ୍ତରତା',
};

const as: Translations = {
  ...en,
  appName: 'হেল্থশ্বিঅৰ',
  appTagline: 'গ্ৰাম্য নিৰৱচ্ছিন্ন স্বাস্থ্যসেৱা প্লেটফৰ্ম',
  selectLanguage: 'ভাষা বাছক',
  selectRoleTitle: 'আপোনাৰ ভূমিকা বাছক',
  continueBtn: 'আগবাঢ়ক',
  navOverview: 'অৱলোকন',
  navAppointments: 'সাক্ষাৎকাৰ (Appointments)',
  navRecords: 'স্বাস্থ্য নথি',
  navReferrals: 'ৰেফাৰেল',
  navTeleconsult: 'টেলিপৰামৰ্শ',
  navHelp: 'সহায় আৰু সমৰ্থন',
  navLogout: 'ছাইন আউট',
  callHelpline: 'টোল-ফ্ৰী হেল্পলাইনলৈ কল কৰক',
  tollFreeHelpline: 'টোল-ফ্ৰী: 1800-209-4477',
  signInBtn: 'ছাইন ইন কৰক',
  secureAccess: 'সুৰক্ষিত স্বাস্থ্যসেৱা • হেল্থশ্বিঅৰ',
  patientPortalTitle: 'ৰোগী প’ৰ্টেল • যত্নৰ ধাৰাবাহিকতা',
};

const ur: Translations = {
  ...en,
  appName: 'ہیلتھ شیور',
  appTagline: 'دیہی مسلسل نگہداشت صحت کا پلیٹ فارم',
  selectLanguage: 'زبان منتخب کریں',
  lightMode: 'لائٹ موڈ',
  darkMode: 'ڈارک موڈ',
  panelHeadline: 'فاصلہ مٹائیں،',
  panelHeadlineAccent: 'صحت پہنچائیں',
  panelDescription:
    'دیہی مریضوں، بنیادی ہیلتھ مراکز اور ضلعی ماہرین کو جوڑنے والا ایک مربوط پبلک ہیلتھ نیٹ ورک۔',
  selectRoleTitle: 'اپنا کردار منتخب کریں',
  selectRoleSubtitle: 'منتخب کریں کہ آپ ہیلتھ شیور پلیٹ فارم کا استعمال کیسے کریں گے۔',
  continueBtn: 'آگے بڑھیں',
  rolePatientLabel: 'مریض (Patient)',
  roleDoctorLabel: 'ڈاکٹر / ماہر (Doctor)',
  roleHospitalLabel: 'ہسپتال کا عملہ (Hospital Staff)',
  roleAdminLabel: 'سرکاری ایڈمن (Admin)',
  navOverview: 'جائزہ',
  navAppointments: 'ملاقاتیں (Appointments)',
  navOutreach: 'ماہرین آؤٹ ریچ',
  navRecords: 'صحت کے ریکارڈ',
  navReferrals: 'ریفرلز',
  navDiagnostics: 'تشخیص و لیب',
  navMedicines: 'دوائیں',
  navTeleconsult: 'ٹیلی مشاورت',
  navFollowups: 'فالو اپ',
  navProfile: 'پروفائل',
  navHelp: 'مدد و رہنمائی',
  navLogout: 'سائن آؤٹ',
  backBtn: 'پیچھے جائیں',
  closeBtn: 'بند کریں',
  cancelBtn: 'منسوخ کریں',
  confirmBtn: 'تصدیق کریں',
  saveBtn: 'محفوظ کریں',
  submitBtn: 'جمع کرائیں',
  callHelpline: 'ٹول فری ہیلپ لائن پر کال کریں',
  tollFreeHelpline: 'ٹول فری: 1800-209-4477',
  signInBtn: 'سائن ان کریں',
  signingIn: 'سائن ان ہو رہا ہے…',
  passwordTab: 'پاس ورڈ',
  otpTab: 'او ٹی پی / فون',
  mobileOrEmail: 'موبائل نمبر یا ای میل',
  password: 'پاس ورڈ',
  forgotPassword: 'پاس ورڈ بھول گئے؟',
  secureAccess: 'محفوظ ہیلتھ کیئر رسائی • ہیلتھ شیور',
  patientPortalTitle: 'مریض پورٹل • تسلسل نگہداشت',
};

const bho: Translations = {
  ...hi,
  appName: 'हेल्थश्युअर',
  appTagline: 'देहाती लगातार स्वास्थ्य सेवा मंच',
  selectLanguage: 'भाषा चुनीं',
  selectRoleTitle: 'आपन रोल चुनीं',
  continueBtn: 'आगे बढ़ीं',
  navOverview: 'अवलोकन',
  navAppointments: 'अपॉइंटमेंट',
  navRecords: 'स्वास्थ्य रिकॉर्ड',
  navReferrals: 'रेफरल',
  navTeleconsult: 'टेलीपरामर्श',
  navHelp: 'मदद आ सहायता',
  navLogout: 'लॉग आउट',
  callHelpline: 'टोल-फ्री हेल्पलाइन पर फोन करीं',
  tollFreeHelpline: 'टोल-फ्री: 1800-209-4477',
  signInBtn: 'साइन इन करीं',
  secureAccess: 'सुरक्षित स्वास्थ्य सेवा • हेल्थश्युअर',
  patientPortalTitle: 'मरीज पोर्टल • लगातार देखभाल',
};

const kok: Translations = {
  ...mr,
  appName: 'हेल्थश्युअर',
  appTagline: 'ग्रामीण निरंतर भलायकी सेवा मंच',
  selectLanguage: 'भास वेचात',
  selectRoleTitle: 'तुमची भूमिका वेचात',
  continueBtn: 'फुडें वचात',
  navOverview: 'आढावो',
  navAppointments: 'अपॉइंटमेंट',
  navRecords: 'भलायकी नोंदी',
  navReferrals: 'रेफरल',
  navTeleconsult: 'टेलिपरामर्श',
  navHelp: 'मदत आनी आदार',
  navLogout: 'साइन आउट',
  callHelpline: 'टोल-फ्री हेल्पलाइनार कॉल करात',
  tollFreeHelpline: 'टोल-फ्री: 1800-209-4477',
  signInBtn: 'साइन इन करात',
  secureAccess: 'सुरक्षित भलायकी सेवा • हेल्थश्युअर',
  patientPortalTitle: 'रुग्ण पोर्टल • भलायकी सातत्य',
};

export const translations: Record<Language, Translations> = {
  en,
  hi,
  mr,
  bn,
  te,
  ta,
  gu,
  kn,
  ml,
  pa,
  or,
  as,
  ur,
  bho,
  kok,
};
