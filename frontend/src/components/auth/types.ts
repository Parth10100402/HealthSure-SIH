// HealthSure Authentication Types
// Phase 1 — Authentication Experience

export type UserRole = 'patient' | 'doctor' | 'hospital_staff' | 'government_admin';

export type AuthStep =
  | 'role-selection'
  | 'login'
  | 'otp-send'
  | 'otp-verify'
  | 'register'
  | 'forgot-password';

export type LoginMethod = 'password' | 'otp';

export type Language =
  | 'en' // English
  | 'hi' // Hindi
  | 'mr' // Marathi
  | 'bn' // Bengali
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'as' // Assamese
  | 'ur' // Urdu (RTL)
  | 'bho' // Bhojpuri
  | 'kok'; // Konkani

export type Theme = 'light' | 'dark';

export type AuthFormState = 'idle' | 'loading' | 'success' | 'error';

export interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  iconName: string; // Lucide icon name
  route: string;
}

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  isRTL?: boolean;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'patient',
    label: 'Patient',
    description: 'Access your healthcare journey',
    iconName: 'User',
    route: '/patient',
  },
  {
    id: 'doctor',
    label: 'Doctor',
    description: 'Manage patients and consultations',
    iconName: 'Stethoscope',
    route: '/doctor',
  },
  {
    id: 'hospital_staff',
    label: 'Hospital Staff',
    description: 'Manage hospital operations and referrals',
    iconName: 'Building2',
    route: '/hospital',
  },
  {
    id: 'government_admin',
    label: 'Government Admin',
    description: 'Monitor public healthcare services',
    iconName: 'BarChart3',
    route: '/admin',
  },
];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', isRTL: true },
  { code: 'bho', label: 'Bhojpuri', nativeLabel: 'भोजपुरी' },
  { code: 'kok', label: 'Konkani', nativeLabel: 'कोंकणी' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  hospital_staff: 'Hospital Staff',
  government_admin: 'Government Admin',
};
