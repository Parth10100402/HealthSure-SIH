// HealthSure — Patient Profile & Digital ABHA Card Page (Fully Localized)
// frontend/src/pages/patient/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Edit3,
  Heart,
  X,
  RotateCw,
} from 'lucide-react';
import type { PatientProfile } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const ProfilePage: React.FC = () => {
  const t = useTranslation();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PatientProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    patientService.getProfile().then((data) => {
      setProfile(data);
      setEditForm(data);
    });
  }, []);

  if (!profile) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = await patientService.updateProfile(editForm);
    setProfile(updated);
    setIsSaving(false);
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            {t.profilePageTitle}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditForm(profile);
            setEditModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs sm:text-sm font-bold px-4 py-2.5 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>{t.editProfileBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── DIGITAL ABHA CARD & HEALTH IDENTITY ──────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Card Mock */}
          <div className="rounded-3xl bg-gradient-to-br from-[#073B3A] via-[#0A4B43] to-[#0D5950] text-white p-6 shadow-md border border-[#087F6D]/30 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4FD1C5]" />
                <span className="font-bold text-xs tracking-wider uppercase">{t.appName} {t.abhaCardLabel}</span>
              </div>
              <span className="text-[10px] font-mono text-[#A7D9CE]">{t.statusConfirmed}</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] text-[#A7D9CE]">{t.fullName}</div>
                <div className="text-lg font-extrabold">{profile.fullName}</div>
                <div className="text-xs text-[#A7D9CE] mt-0.5">
                  {profile.gender} • {profile.age} Years ({t.dateOfBirth}: {profile.dateOfBirth})
                </div>
              </div>

              <div className="w-14 h-14 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-[#073B3A]" />
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A7D9CE]">{t.idLabel}:</span>
                <span className="font-mono font-bold text-white">{profile.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7D9CE]">{t.abhaNumber}:</span>
                <span className="font-mono font-bold text-[#4FD1C5]">{profile.abhaId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7D9CE]">{t.registeredPHC}:</span>
                <span className="font-semibold text-white truncate max-w-[150px]">{profile.registeredFacility}</span>
              </div>
            </div>
          </div>

          {/* Clinical quick alerts */}
          <div className="rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] p-4 space-y-3 text-xs shadow-xs">
            <div className="font-bold text-[#17324D] dark:text-[#E2EEF4] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{t.clinicalAssessment}</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                <div className="font-bold text-rose-700 dark:text-rose-300">{t.allergies}:</div>
                <p className="text-rose-600 dark:text-rose-400 mt-0.5">{profile.allergies.join(', ') || 'No known allergies'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="font-bold text-amber-800 dark:text-amber-300">{t.chronicConditions}:</div>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">{profile.chronicConditions.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PERSONAL & CONTACT DETAILS ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] p-5 sm:p-6 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              {t.profilePageTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.fullName}</span>
                <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">{profile.fullName}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.mobileField}</span>
                <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">{profile.phone}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.emailField}</span>
                <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4]">{profile.email || 'Not provided'}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.bloodGroup}</span>
                <div className="font-bold text-sm text-[#087F6D] dark:text-[#4FD1C5]">{profile.bloodGroup}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.village}</span>
                <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4]">{profile.village}, {profile.taluka}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.location}</span>
                <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4]">{profile.district}, {profile.state}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.preferredLanguage}</span>
                <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4] uppercase">{profile.preferredLanguage}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.primaryCentreLink}</span>
                <div className="font-semibold text-[#087F6D] dark:text-[#4FD1C5]">{profile.registeredFacility}</div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-3">
              <h4 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
                {t.emergencyContacts}
              </h4>

              <div className="p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4] text-sm">{profile.emergencyContact.name}</strong>
                  <span className="text-[#64748B] dark:text-[#7B9EA8]"> ({profile.emergencyContact.relationship})</span>
                </div>
                <div className="font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  {profile.emergencyContact.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.editProfileBtn}</h3>
              <button type="button" onClick={() => setEditModalOpen(false)} className="text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.fullName}</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.mobileField}</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.emailField}</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.village}</label>
                  <input
                    type="text"
                    value={editForm.village || ''}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.district}</label>
                  <input
                    type="text"
                    value={editForm.district || ''}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] font-semibold text-[#64748B]"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSaving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <span>{t.saveBtn}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
