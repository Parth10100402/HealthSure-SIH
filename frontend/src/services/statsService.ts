// HealthSure Platform Statistics Service (Hospitals, Doctors, Patients, Satisfaction)
import { MOCK_HOSPITALS, MOCK_DOCTORS, MOCK_FAMILY_MEMBERS } from '../data/mockData';

export interface PlatformStats {
  hospitalsCount: number;
  doctorsCount: number;
  patientsCount: number;
  satisfactionRate: number;
}

export const fetchPlatformStats = async (): Promise<PlatformStats> => {
  // Simulate concurrent database query
  await new Promise((resolve) => setTimeout(resolve, 150));

  return {
    hospitalsCount: Math.max(1000, MOCK_HOSPITALS.length * 50),
    doctorsCount: Math.max(5000, MOCK_DOCTORS.length * 1000),
    patientsCount: Math.max(100000, MOCK_FAMILY_MEMBERS.length * 33000),
    satisfactionRate: 98
  };
};
