// HealthSure Recent Activity Stream Service

export interface HealthActivity {
  id: string;
  type: 'report' | 'appointment' | 'medicine' | 'cost';
  title: string;
  timestamp: string;
  status: 'Completed' | 'Confirmed' | 'Pending';
  details: string;
}

export const fetchRecentActivities = async (memberId: string = 'fam-1'): Promise<HealthActivity[]> => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const key = `healthsure_activities_${memberId}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }

  // Seed activities
  return [
    {
      id: 'act-1',
      type: 'report',
      title: 'Lab Report Decoded & Parsed',
      timestamp: 'Today, 08:30 AM',
      status: 'Completed',
      details: 'Lipid & Metabolic Diagnostic Panel decoded with 96% precision confidence.'
    },
    {
      id: 'act-2',
      type: 'appointment',
      title: 'Appointment Booked & Token Issued',
      timestamp: 'Yesterday, 04:15 PM',
      status: 'Confirmed',
      details: 'Dr. Balram Bhargava (Cardiologist) • Token #14 at AIIMS New Delhi.'
    },
    {
      id: 'act-3',
      type: 'medicine',
      title: 'Morning Rx Dosage Taken',
      timestamp: 'Today, 08:00 AM',
      status: 'Completed',
      details: 'Amlodipine 5mg & Multivitamin Complex recorded.'
    },
    {
      id: 'act-4',
      type: 'cost',
      title: 'Treatment Cost Estimate Run',
      timestamp: '3 Days Ago',
      status: 'Completed',
      details: 'Angioplasty / Stent estimate generated for Star Health plan.'
    }
  ];
};
