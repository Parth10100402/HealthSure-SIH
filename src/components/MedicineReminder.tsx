import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Trash2
} from 'lucide-react';
import type { MedicineSchedule } from '../types/health';
import { useAuth } from '../context/AuthContext';

const INITIAL_MEDICINES: MedicineSchedule[] = [
  {
    id: 'med-1',
    medicineName: 'Paracetamol 500mg',
    dosage: '1 Tablet (500mg)',
    frequency: 'After Food',
    timeOfDay: '8:00 PM',
    takenToday: false,
    prescribedBy: 'Dr. Anita Sharma',
    instructions: 'Take with warm water after dinner.'
  },
  {
    id: 'med-2',
    medicineName: 'Amoxicillin 250mg',
    dosage: '1 Capsule',
    frequency: 'Twice Daily',
    timeOfDay: '9:00 AM',
    takenToday: true,
    prescribedBy: 'Dr. Rajesh Kumar',
    instructions: 'Complete full 5-day course.'
  }
];

export const MedicineReminder: React.FC = () => {
  const { user } = useAuth();
  const storageKey = user?.email ? `healthsure_medicines_${user.email}` : 'healthsure_medicines_default';

  const [medicines, setMedicines] = useState<MedicineSchedule[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MEDICINES;
      }
    }
    return INITIAL_MEDICINES;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('After Food');
  const [newTime, setNewTime] = useState('8:00 PM');
  const [newInstructions, setNewInstructions] = useState('');

  // Persist medicines to user-isolated localStorage on every change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(medicines));
  }, [medicines, storageKey]);

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMed: MedicineSchedule = {
      id: `med-${Date.now()}`,
      medicineName: newName,
      dosage: newDosage || '1 Unit',
      frequency: newFrequency,
      timeOfDay: newTime,
      takenToday: false,
      instructions: newInstructions || 'Take as prescribed.'
    };

    setMedicines(prev => [newMed, ...prev]);
    setNewName('');
    setNewDosage('');
    setNewInstructions('');
    setIsAddModalOpen(false);
  };

  const toggleTaken = (id: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER & ADD MEDICINE TRIGGER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider border border-teal-500/20">
            <Pill className="w-3.5 h-3.5" /> Rx Telemetry & Reminders
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Medicine <span className="text-teal-600 dark:text-teal-400">Schedule</span>
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* MEDICINES LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medicines.map((med) => {
          const isTaken = Boolean(med.takenToday);
          return (
            <div
              key={med.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                isTaken
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{med.medicineName}</h3>
                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {med.timeOfDay} • {med.frequency}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    isTaken ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {isTaken ? 'Completed' : 'Pending Today'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Dosage & Instructions</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{med.dosage} — {med.instructions}</p>
                </div>
              </div>

              {/* ACTIONS: MARK TAKEN / DELETE */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => toggleTaken(med.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors ${
                    isTaken
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isTaken ? 'Marked as Taken' : 'Mark as Taken'}</span>
                </button>

                <button
                  onClick={() => deleteMedicine(med.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD MEDICINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Add New Medicine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Set reminder frequency and daily dose time.</p>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-slate-400 block mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet"
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Frequency</label>
                  <input
                    type="text"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    placeholder="e.g. After Food"
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 8:00 PM"
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Instructions</label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. After food with warm water"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-colors"
              >
                Save Medicine Schedule
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
