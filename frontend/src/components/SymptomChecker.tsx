import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  Stethoscope, 
  Building2, 
  ShieldAlert, 
  RotateCw
} from 'lucide-react';
import type { SymptomCheckResult } from '../types/health';
import { analyzeSymptoms } from '../services/symptomService';

interface SymptomCheckerProps {
  onNavigateDoctors: (specialty: string) => void;
  onNavigateHospitals: () => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  onNavigateDoctors,
  onNavigateHospitals
}) => {
  const [symptomInput, setSymptomInput] = useState<string>('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['Chest Pain', 'Shortness of Breath']);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<SymptomCheckResult | null>({
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Light Fatigue'],
    urgencyLevel: 'High',
    possibleConditions: [
      { condition: 'Angina / Acute Coronary Syndrome', probability: 78, description: 'Myocardial ischemia requiring immediate ECG and Troponin-I screening.' },
      { condition: 'Bronchial Spasm / Severe Asthma', probability: 15, description: 'Airway constriction causing shortness of breath and tightness.' },
      { condition: 'Acute Anxiety Episode', probability: 7, description: 'Hyperventilation induced muscular chest tightness.' }
    ],
    recommendedSpecialist: 'Cardiologist',
    recommendedHospitals: ['AIIMS New Delhi', 'Apollo Hospitals Indraprastha Delhi', 'Fortis Escorts Heart Institute Delhi'],
    disclaimer: 'This is not a medical diagnosis.'
  });

  const popularSymptomChips = [
    'Chest Pain',
    'Shortness of Breath',
    'Severe Headache',
    'High Fever',
    'Joint Pain',
    'Skin Rash',
    'Abdominal Pain',
    'Dizziness'
  ];

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    const combinedText = (symptomInput + ' ' + selectedChips.join(', ')).trim() || 'General indisposition and fatigue';

    try {
      const triage = await analyzeSymptoms(combinedText);
      
      let mappedUrgency: 'Low' | 'Moderate' | 'High' | 'Emergency' = 'Moderate';
      if (triage.urgency === 'Emergency') mappedUrgency = 'Emergency';
      else if (triage.urgency === 'Low') mappedUrgency = 'Low';
      else mappedUrgency = 'High';

      setResult({
        symptoms: selectedChips.length > 0 ? selectedChips : [symptomInput],
        urgencyLevel: mappedUrgency,
        possibleConditions: triage.possibleConditions.map(c => ({
          condition: c.name,
          probability: c.matchPct,
          description: c.desc
        })),
        recommendedSpecialist: triage.recommendedSpecialist || 'General Physician',
        recommendedHospitals: ['AIIMS New Delhi', 'Fortis Hospital Mohali', 'Max Super Speciality Hospital Saket'],
        disclaimer: triage.disclaimer || 'This is a clinical triage assessment and not a medical diagnosis.'
      });
    } catch (err) {
      console.error('[SymptomChecker] Error running symptom analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-4 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Clinical Triage & Symptom Evaluation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Symptom <span className="text-gradient-indigo">Assessment</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          Select or describe your current symptoms to receive immediate urgency level triage and specialist guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 space-y-6 flex flex-col justify-between">
          <form onSubmit={handleAnalyze} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                <span>1. Select Common Symptoms</span>
                <span className="text-[10px] text-slate-400">Multiple selection</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {popularSymptomChips.map((chip) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{chip}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-400">
                2. Describe Additional Symptoms (Optional)
              </label>
              <textarea
                rows={3}
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="e.g. Sharp pain in chest when taking deep breath, mild headache since morning..."
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating Clinical Triage...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Run Clinical Triage Assessment</span>
                </>
              )}
            </button>

          </form>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>If you are experiencing severe crushing chest pain, difficulty breathing, or acute numbness, call emergency services immediately.</p>
          </div>
        </div>

        {/* Right Assessment Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 space-y-6">
              
              {/* Triage Urgency Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assessment Result</span>
                  <h3 className="text-xl font-black text-white mt-0.5">Clinical Urgency Assessment</h3>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border text-center ${
                  result.urgencyLevel === 'High' || result.urgencyLevel === 'Emergency'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  • Urgency Level: {result.urgencyLevel}
                </div>
              </div>

              {/* Possible Conditions Probabilities */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 block">
                  Possible Conditions Identified:
                </span>

                <div className="space-y-2.5">
                  {result.possibleConditions.map((cond, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-white">{cond.condition}</span>
                        <span className="text-indigo-400 font-extrabold">{cond.probability}% Match</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                          style={{ width: `${cond.probability}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{cond.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialist Routing CTA */}
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 block">Recommended Specialist</span>
                    <h4 className="text-lg font-black text-white">{result.recommendedSpecialist}</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onNavigateDoctors(result.recommendedSpecialist)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow flex items-center space-x-1.5"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>View Doctors ➔</span>
                    </button>
                    <button
                      onClick={onNavigateHospitals}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs border border-slate-700 flex items-center space-x-1.5"
                    >
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>View Hospitals</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-medium">
                  We recommend consulting a verified <strong>{result.recommendedSpecialist}</strong> for clinical diagnosis and physical evaluation.
                </p>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-card border border-slate-800 text-center space-y-3">
              <Activity className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <h3 className="text-lg font-black text-white">No Assessment Run Yet</h3>
              <p className="text-xs text-slate-400">Select or describe symptoms on the left and click "Run Clinical Triage Assessment".</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
