import { analyzeSymptomsAPI, type GeminiSymptomTriage } from './geminiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SavedSymptomRecord extends GeminiSymptomTriage {
  id: string;
  familyMemberId?: string;
  familyMemberName?: string;
  timestamp: string;
}

export async function analyzeSymptoms(
  symptomsText: string,
  familyMemberId: string = 'mem-1',
  familyMemberName: string = 'Parth Sharma'
): Promise<SavedSymptomRecord> {
  try {
    const res = await fetch(`${API_BASE_URL}/symptoms/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptomText: symptomsText,
        familyMemberId,
        familyMemberName
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as SavedSymptomRecord;
      }
    }
  } catch (err) {
    console.warn('[symptomService] Backend server unavailable, executing client-side Gemini fallback:', err);
  }

  // Client fallback
  const aiResult = await analyzeSymptomsAPI(symptomsText);
  const fallbackRecord: SavedSymptomRecord = {
    id: 'TRG-' + Date.now(),
    familyMemberId,
    familyMemberName,
    timestamp: new Date().toISOString(),
    ...aiResult
  };

  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_symptoms') || '[]');
    localStorage.setItem('healthsure_symptoms', JSON.stringify([fallbackRecord, ...cached]));
  } catch {
    // Ignore storage error
  }

  return fallbackRecord;
}

export async function getSavedSymptoms(memberId?: string): Promise<SavedSymptomRecord[]> {
  try {
    const url = memberId ? `${API_BASE_URL}/symptoms/list?memberId=${memberId}` : `${API_BASE_URL}/symptoms/list`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as SavedSymptomRecord[];
      }
    }
  } catch (err) {
    console.warn('[symptomService] Error fetching saved symptoms from API:', err);
  }

  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_symptoms') || '[]');
    return cached as SavedSymptomRecord[];
  } catch {
    return [];
  }
}
