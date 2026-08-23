// HealthSure — Clinical Consultation Modal Component
// frontend/src/components/doctor/ConsultationModal.tsx

import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCw,
} from 'lucide-react';
import type { DoctorAppointmentSummary, DoctorConsultationForm } from '../../types/doctor';
import { doctorService } from '../../services/doctorService';

interface ConsultationModalProps {
  isOpen: boolean;
  appointment: DoctorAppointmentSummary | null;
  onClose: () => void;
  onConsultationCompleted: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onConsultationCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'prescriptions' | 'plan'>('clinical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [bp, setBp] = useState('134/86');
  const [pulse, setPulse] = useState('76');
  const [spo2, setSpo2] = useState('98');
  const [sugar, setSugar] = useState('112');
  const [symptoms, setSymptoms] = useState(appointment?.reasonForVisit || 'Exertional dyspnea on brisk walking');
  const [observations, setObservations] = useState('S1, S2 audible. No murmurs. Bilateral vesicular breath sounds clear. Mild bilateral pedal edema trace.');
  const [diagnosis, setDiagnosis] = useState('Grade 1 Hypertensive Heart Disease with early diastolic dysfunction');
  const [doctorNotes, setDoctorNotes] = useState('Advised low sodium diet, 30 min daily walking, 2D-Echocardiogram conducted in OPD.');

  const [prescriptions, setPrescriptions] = useState([
    {
      medicineName: 'Tab. Telmisartan',
      dosage: '40 mg',
      frequency: '1-0-0 (Once daily morning)',
      duration: '30 Days',
      instructions: 'Take after breakfast with water',
    },
    {
      medicineName: 'Tab. Amlodipine',
      dosage: '5 mg',
      frequency: '0-0-1 (Once daily night)',
      duration: '30 Days',
      instructions: 'Take after dinner',
    },
  ]);

  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '1-0-1', duration: '14 Days', instructions: '' });
  const [labTests, setLabTests] = useState(['2D-Echocardiography (Completed in OPD)', 'Serum Creatinine & Electrolytes', 'Fasting Lipid Profile']);
  const [newTest, setNewTest] = useState('');
  const [followUpDays, setFollowUpDays] = useState(30);
  const [followUpMode, setFollowUpMode] = useState<'in-person' | 'teleconsultation'>('in-person');

  if (!isOpen || !appointment) return null;

  const handleAddMed = () => {
    if (!newMed.name.trim()) return;
    setPrescriptions([
      ...prescriptions,
      {
        medicineName: newMed.name,
        dosage: newMed.dosage || 'Standard',
        frequency: newMed.frequency,
        duration: newMed.duration,
        instructions: newMed.instructions || 'As advised',
      },
    ]);
    setNewMed({ name: '', dosage: '', frequency: '1-0-1', duration: '14 Days', instructions: '' });
  };

  const handleRemoveMed = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleAddTest = () => {
    if (!newTest.trim()) return;
    setLabTests([...labTests, newTest.trim()]);
    setNewTest('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form: DoctorConsultationForm = {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      symptomsPresented: symptoms,
      clinicalObservations: observations,
      provisionalDiagnosis: diagnosis,
      vitals: {
        bloodPressure: bp,
        pulseRate: `${pulse} bpm`,
        spo2: `${spo2}%`,
        bloodSugar: `${sugar} mg/dL`,
      },
      prescriptions,
      labTestsOrdered: labTests,
      followUpAdvisedDays: followUpDays,
      followUpMode,
      doctorNotes,
    };

    await doctorService.submitConsultation(form);
    setIsSubmitting(false);
    setSavedSuccess(true);

    setTimeout(() => {
      setSavedSuccess(false);
      onConsultationCompleted();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#073B3A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-[#4FD1C5] flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">{appointment.patientName}</h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-mono text-[#A7D9CE]">
                  {appointment.patientId}
                </span>
              </div>
              <p className="text-xs text-[#A7D9CE]">
                {appointment.patientAge}y • {appointment.patientGender} • Village: {appointment.patientVillage} ({appointment.referringPHC})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DDE8E4] dark:border-[#1A3A3A] px-5 pt-3 bg-[#F5F9F7] dark:bg-[#072424] gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'clinical'
                ? 'border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5]'
                : 'border-transparent text-[#64748B] hover:text-[#17324D]'
            }`}
          >
            1. Clinical Notes & Vitals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'prescriptions'
                ? 'border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5]'
                : 'border-transparent text-[#64748B] hover:text-[#17324D]'
            }`}
          >
            2. Prescriptions (Rx) & Tests
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'plan'
                ? 'border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5]'
                : 'border-transparent text-[#64748B] hover:text-[#17324D]'
            }`}
          >
            3. PHC Care Plan & Follow-up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Consultation saved & synced to PHC Khed care record!</span>
            </div>
          )}

          {/* ── TAB 1: CLINICAL NOTES & VITALS ────────────────────────────── */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              {/* Triage Vitals Bar */}
              <div>
                <label className="block font-bold text-[#17324D] dark:text-[#E2EEF4] mb-1.5 uppercase tracking-wider text-[11px]">
                  Clinical Vitals Triage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
                    <span className="text-[10px] text-[#64748B] block">Blood Pressure (mmHg)</span>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full font-bold text-[#17324D] dark:text-[#E2EEF4] bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
                    <span className="text-[10px] text-[#64748B] block">Heart Rate (bpm)</span>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full font-bold text-[#17324D] dark:text-[#E2EEF4] bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
                    <span className="text-[10px] text-[#64748B] block">SpO2 (%)</span>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="w-full font-bold text-[#17324D] dark:text-[#E2EEF4] bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
                    <span className="text-[10px] text-[#64748B] block">Blood Sugar (mg/dL)</span>
                    <input
                      type="text"
                      value={sugar}
                      onChange={(e) => setSugar(e.target.value)}
                      className="w-full font-bold text-[#17324D] dark:text-[#E2EEF4] bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms Presented */}
              <div>
                <label className="block font-bold text-[#17324D] dark:text-[#E2EEF4] mb-1">
                  Symptoms & Chief Complaint
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                />
              </div>

              {/* Clinical Examination Observations */}
              <div>
                <label className="block font-bold text-[#17324D] dark:text-[#E2EEF4] mb-1">
                  Cardiovascular & Physical Examination Observations
                </label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                />
              </div>

              {/* Provisional Diagnosis */}
              <div>
                <label className="block font-bold text-[#17324D] dark:text-[#E2EEF4] mb-1">
                  Specialist Provisional Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4] font-bold"
                />
              </div>
            </div>
          )}

          {/* ── TAB 2: PRESCRIPTIONS & TESTS ───────────────────────────────── */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {/* Prescriptions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider text-[11px]">
                    Prescribed Medications (E-Prescription)
                  </label>
                  <span className="text-[10px] text-[#087F6D] dark:text-[#4FD1C5]">Syncs with PHC Dispensary</span>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">
                          {med.medicineName} ({med.dosage})
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                          {med.frequency} • {med.duration} — <em>{med.instructions}</em>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new Med item */}
                <div className="p-3 rounded-xl border border-dashed border-[#DDE8E4] dark:border-[#1A3A3A] space-y-2 bg-white dark:bg-[#0A2020]">
                  <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4] text-[11px]">Add Medication</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Tab. Atorvastatin)"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      className="sm:col-span-2 p-2 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929]"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 10 mg)"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="p-2 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929]"
                    />
                    <button
                      type="button"
                      onClick={handleAddMed}
                      className="py-2 px-3 rounded-lg bg-[#087F6D] text-white font-bold flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lab Tests Ordered */}
              <div className="space-y-2 pt-2 border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
                <label className="font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider text-[11px]">
                  Diagnostics & Pathology Investigations
                </label>

                <div className="flex flex-wrap gap-2">
                  {labTests.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-xs border border-[#087F6D]/20"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => setLabTests(labTests.filter((_, i) => i !== idx))}
                        className="text-[#087F6D] hover:text-rose-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Order new lab investigation..."
                    value={newTest}
                    onChange={(e) => setNewTest(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTest}
                    className="py-2 px-4 rounded-xl border border-[#087F6D] text-[#087F6D] font-bold"
                  >
                    Add Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: CARE PLAN & FOLLOW-UP ───────────────────────────────── */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-[#17324D] dark:text-[#E2EEF4] mb-1">
                  Doctor Clinical Advice & Dietary Guidelines
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                />
              </div>

              {/* Follow-up schedule */}
              <div className="p-4 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-3">
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#087F6D]" />
                  <span>Scheduled Follow-Up Review</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#64748B] block mb-1">Follow-up Interval</label>
                    <select
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4]"
                    >
                      <option value={7}>After 7 Days (1 Week)</option>
                      <option value={14}>After 14 Days (2 Weeks)</option>
                      <option value={30}>After 30 Days (1 Month)</option>
                      <option value={90}>After 90 Days (Quarterly Review)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#64748B] block mb-1">Recommended Mode</label>
                    <select
                      value={followUpMode}
                      onChange={(e) => setFollowUpMode(e.target.value as typeof followUpMode)}
                      className="w-full p-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4]"
                    >
                      <option value="in-person">In-Person at PHC Khed Outreach Camp</option>
                      <option value="teleconsultation">Teleconsultation via PHC Kiosk</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-[#DDE8E4] dark:border-[#1A3A3A] flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
              {activeTab === 'clinical' && 'Next: Add Prescriptions'}
              {activeTab === 'prescriptions' && 'Next: Set Care Plan & Follow-up'}
              {activeTab === 'plan' && 'Ready to complete consultation'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] font-semibold text-[#64748B]"
              >
                Cancel
              </button>

              {activeTab !== 'plan' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'clinical' ? 'prescriptions' : 'plan')}
                  className="py-2.5 px-5 rounded-xl bg-[#087F6D] text-white font-bold hover:bg-[#073B3A] transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white font-bold flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save & Complete Consultation</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
