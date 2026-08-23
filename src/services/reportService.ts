import { analyzeReportAPI } from './geminiService';
import type { 
  MedicalReport,
  ExtendedFollowUpStatus, 
  FollowUpPriority, 
  FollowUpTimelineEvent, 
  AIFollowUpRecommendation 
} from '../types/health';
import { MOCK_REPORTS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SavedReportRecord extends MedicalReport {
  familyMemberId?: string;
  familyMemberName?: string;
  createdAt?: string;
}

export async function analyzeReport(
  fileOrTitle: string,
  familyMemberId: string = 'mem-1',
  familyMemberName: string = 'Parth Sharma'
): Promise<SavedReportRecord> {
  // Attempt Express REST API first
  try {
    const res = await fetch(`${API_BASE_URL}/reports/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportTitle: fileOrTitle,
        reportText: fileOrTitle,
        familyMemberId,
        familyMemberName
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as SavedReportRecord;
      }
    }
  } catch (err) {
    console.warn('[reportService] Backend server unavailable, executing client-side Gemini fallback:', err);
  }

  // Client-Side Gemini Fallback
  const aiResult = await analyzeReportAPI(fileOrTitle);
  const fallbackRecord: SavedReportRecord = {
    id: 'REP-' + Date.now(),
    title: fileOrTitle || aiResult.reportType,
    date: new Date().toLocaleDateString(),
    status: 'Requires Attention',
    familyMemberId,
    familyMemberName,
    ...aiResult,
    parameters: (aiResult.parameters || []).map((p: any) => ({
      name: p.name,
      value: p.value,
      unit: p.unit,
      referenceRange: p.refRange || p.referenceRange || 'Normal',
      status: p.status
    })),
    createdAt: new Date().toISOString()
  };

  // Local storage caching
  try {
    const existing = JSON.parse(localStorage.getItem('healthsure_reports') || '[]');
    localStorage.setItem('healthsure_reports', JSON.stringify([fallbackRecord, ...existing]));
  } catch (e) {
    // Ignore storage errors
  }

  return fallbackRecord;
}

export async function updateReportFollowUp(
  reportId: string,
  payload: {
    followUpStatus: ExtendedFollowUpStatus;
    clinicianNote?: string;
    nextFollowUpDate?: string;
    assignedSpecialist?: string;
    priority?: FollowUpPriority;
    followUpReason?: string;
    resolutionNote?: string;
    resolvedDate?: string;
    aiFollowUpRecommendation?: AIFollowUpRecommendation;
    followUpTimeline?: FollowUpTimelineEvent[];
  }
): Promise<SavedReportRecord> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}/follow-up`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Also update local storage if present
        try {
          const cached = JSON.parse(localStorage.getItem('healthsure_reports') || '[]');
          const updated = cached.map((r: any) => r.id === reportId ? { ...r, ...payload } : r);
          localStorage.setItem('healthsure_reports', JSON.stringify(updated));
        } catch {
          // ignore
        }

        return json.data as SavedReportRecord;
      }
    }
  } catch (err) {
    console.warn('[reportService] Error updating follow-up via API, saving to localStorage:', err);
  }

  // Fallback to updating localStorage directly
  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_reports') || '[]');
    const updated = cached.map((r: any) => r.id === reportId ? { ...r, ...payload } : r);
    localStorage.setItem('healthsure_reports', JSON.stringify(updated));
  } catch {
    // ignore
  }

  return { id: reportId, ...payload } as any;
}

export async function getReports(): Promise<SavedReportRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as SavedReportRecord[];
      }
    }
  } catch (err) {
    console.warn('[reportService] Error fetching reports from API, loading local fallback:', err);
  }

  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_reports') || '[]');
    return cached as SavedReportRecord[];
  } catch {
    return [];
  }
}

export async function getReportById(reportId: string): Promise<SavedReportRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as SavedReportRecord;
      }
    }
  } catch (err) {
    console.warn(`[reportService] API error fetching report ${reportId}:`, err);
  }

  // Fallback 1: Local Storage
  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_reports') || '[]');
    const found = cached.find((r: any) => r.id === reportId);
    if (found) return found as SavedReportRecord;
  } catch {
    // ignore
  }

  // Fallback 2: Pre-seeded MOCK_REPORTS dataset
  const mockFound = MOCK_REPORTS.find((r: any) => r.id === reportId);
  if (mockFound) return (mockFound as unknown) as SavedReportRecord;

  return null;
}

// Lightweight 4-second Polling Synchronization across tabs/devices
export function subscribeReports(
  callback: (reports: SavedReportRecord[]) => void,
  intervalMs: number = 4000
): () => void {
  let isSubscribed = true;

  const poll = async () => {
    if (!isSubscribed) return;
    const reports = await getReports();
    if (isSubscribed && reports && reports.length > 0) {
      callback(reports);
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);

  return () => {
    isSubscribed = false;
    clearInterval(timer);
  };
}

