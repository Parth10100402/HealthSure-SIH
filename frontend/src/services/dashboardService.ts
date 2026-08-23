import { fetchPlatformStats } from './statsService';
import type { PlatformStats } from './statsService';
import { fetchRecentActivities } from './activityService';
import type { HealthActivity } from './activityService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface DashboardOverview {
  activePatientName: string;
  greetingTime: 'Good Morning' | 'Good Afternoon' | 'Good Evening';
  healthScore: number;
  latestReport: { title: string; date: string };
  upcomingConsultation: { doctor: string; token: number | string; time: string };
  pendingRxRemindersCount: number;
  stats: PlatformStats;
  activities: HealthActivity[];
}

export const fetchDashboardData = async (
  patientName: string = 'Parth Sharma',
  memberId: string = 'fam-1'
): Promise<DashboardOverview> => {
  // Attempt Express REST API first
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview?patientName=${encodeURIComponent(patientName)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as DashboardOverview;
      }
    }
  } catch (err) {
    console.warn('[dashboardService] Express server offline, using local aggregator fallback:', err);
  }

  const currentHour = new Date().getHours();
  let greeting: 'Good Morning' | 'Good Afternoon' | 'Good Evening' = 'Good Morning';
  if (currentHour >= 12 && currentHour < 18) greeting = 'Good Afternoon';
  if (currentHour >= 18) greeting = 'Good Evening';

  // Concurrent Execution via Promise.all
  const [stats, activities] = await Promise.all([
    fetchPlatformStats(),
    fetchRecentActivities(memberId)
  ]);

  return {
    activePatientName: patientName,
    greetingTime: greeting,
    healthScore: 92,
    latestReport: {
      title: 'Complete Blood Count (CBC)',
      date: new Date().toLocaleDateString()
    },
    upcomingConsultation: {
      doctor: 'Dr. Rajesh Kumar (Cardiologist)',
      token: 12,
      time: 'Today, 04:30 PM'
    },
    pendingRxRemindersCount: 1,
    stats,
    activities
  };
};
