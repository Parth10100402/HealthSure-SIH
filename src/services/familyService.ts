import type { FamilyMember } from '../types/health';
import { MOCK_FAMILY_MEMBERS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/family-members`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as FamilyMember[];
      }
    }
  } catch (err) {
    console.warn('[familyService] Backend offline, using local family profiles:', err);
  }

  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_family_members') || '[]');
    if (cached.length > 0) return cached as FamilyMember[];
  } catch {
    // Ignore storage errors
  }

  return MOCK_FAMILY_MEMBERS;
}

export async function saveFamilyMember(member: FamilyMember): Promise<FamilyMember> {
  try {
    const res = await fetch(`${API_BASE_URL}/family-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as FamilyMember;
      }
    }
  } catch (err) {
    console.warn('[familyService] Backend offline, saving family member locally:', err);
  }

  try {
    const cached = JSON.parse(localStorage.getItem('healthsure_family_members') || '[]') as FamilyMember[];
    const index = cached.findIndex(m => m.id === member.id);
    let updated: FamilyMember[];
    if (index >= 0) {
      updated = [...cached];
      updated[index] = member;
    } else {
      updated = [member, ...cached];
    }
    localStorage.setItem('healthsure_family_members', JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return member;
}
