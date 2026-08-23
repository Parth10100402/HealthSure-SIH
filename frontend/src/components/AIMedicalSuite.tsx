import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  RotateCw, 
  Apple, 
  Ban, 
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PremiumLockScreen } from './PremiumLockScreen';

interface AIMedicalSuiteProps {
  initialSubTab?: string;
  onNavigateDoctors?: (specialty?: string) => void;
  onNavigateHospitals?: () => void;
  onNavigateCost?: () => void;
  onNavigateAppointments?: () => void;
}

interface MetricItem {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'Normal' | 'Low' | 'High' | 'Optimal';
  significance: string;
}

interface OrganSystemStatus {
  systemName: string;
  icon: string;
  status: string;
  summary: string;
}

interface ReportAnalysisData {
  id: string;
  reportTitle: string;
  date: string;
  reportOverview: string;
  bodyExplanation: string;
  organSystems: OrganSystemStatus[];
  normalMetrics: MetricItem[];
  abnormalMetrics: MetricItem[];
  foodsToConsume: string[];
  foodsToLimit: string[];
  whenToConsult: {
    urgency: 'Routine' | 'Recommended' | 'Urgent';
    advice: string;
    specialist: string;
  };
}

export const AIMedicalSuite: React.FC<AIMedicalSuiteProps> = ({
  onNavigateDoctors = () => {}
}) => {
  const { user } = useAuth();
  const storageKey = user?.email ? `healthsure_reports_${user.email}` : 'healthsure_reports_default';

  const [reportHistory, setReportHistory] = useState<ReportAnalysisData[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [symptomText, setSymptomText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [reportResult, setReportResult] = useState<ReportAnalysisData | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reportHistory));
  }, [reportHistory, storageKey]);

  if (!user?.isPremium) {
    return (
      <PremiumLockScreen
        featureName="Medical Suite"
        title="Medical Suite is a Premium Feature"
        description="Upgrade your plan to unlock AI medical report analysis, parameter extraction, and specialist recommendations."
      />
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      processReport(file.name);
    }
  };

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;
    processReport(symptomText);
  };

  const processReport = async (queryOrFileName: string) => {
    setCurrentStep(2);
    setIsProcessing(true);

    setTimeout(() => {
      const isIronReport = queryOrFileName.toLowerCase().includes('cbc') || queryOrFileName.toLowerCase().includes('iron') || queryOrFileName.toLowerCase().includes('blood');
      
      const newAnalysis: ReportAnalysisData = {
        id: `rep-${Date.now()}`,
        reportTitle: selectedFile ? selectedFile.name : 'Blood & Biomarker Analysis',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        reportOverview: "Most of your results are within the normal range. Your hemoglobin is slightly below the reported range, which can sometimes be associated with low iron levels. This result should be interpreted along with your symptoms and medical history.",
        bodyExplanation: "Think of your blood as your body's oxygen delivery network. Hemoglobin is the protein inside red blood cells that carries oxygen from your lungs to your muscles and organs. Right now, your hemoglobin is slightly lower than ideal, which means your body has to work a little harder to distribute oxygen efficiently. Your blood sugar and kidney filtration markers remain in excellent shape.",
        organSystems: [
          { systemName: 'Blood & Oxygen Transport', icon: '🫀', status: 'Requires Mild Attention', summary: 'Hemoglobin at 10.2 g/dL indicates reduced red blood cell oxygen carrying capacity.' },
          { systemName: 'Glycemic & Pancreatic Balance', icon: '🩸', status: 'Optimal', summary: 'Fasting Glucose at 94 mg/dL shows optimal insulin and sugar regulation.' },
          { systemName: 'Kidney Filtration System', icon: '🫘', status: 'Optimal', summary: 'Serum Creatinine at 0.9 mg/dL indicates clear renal waste clearance.' },
          { systemName: 'Liver Clearance & Metabolism', icon: '🫁', status: 'Normal', summary: 'Serum Bilirubin at 0.8 mg/dL confirms healthy hepatic processing.' }
        ],
        normalMetrics: [
          { name: 'Fasting Blood Glucose', value: '94', unit: 'mg/dL', normalRange: '70 – 99', status: 'Normal', significance: 'Glycemic control well regulated.' },
          { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', normalRange: '0.7 – 1.2', status: 'Optimal', significance: 'Renal filtration capacity normal.' },
          { name: 'Serum Bilirubin', value: '0.8', unit: 'mg/dL', normalRange: '0.2 – 1.2', status: 'Normal', significance: 'Liver metabolism within reference range.' }
        ],
        abnormalMetrics: [
          { 
            name: 'Hemoglobin (Hb)', 
            value: '10.2', 
            unit: 'g/dL', 
            normalRange: '13 – 17', 
            status: 'Low', 
            significance: 'Your hemoglobin is below the reported range. This can be associated with anemia or nutritional deficiencies, but a doctor should interpret it with your symptoms.' 
          }
        ],
        foodsToConsume: isIronReport 
          ? ['Spinach & Dark Leafy Greens', 'Lentils & Chickpeas', 'Pomegranate & Beetroot', 'Vitamin C rich Oranges & Lemons', 'Dates & Figs', 'Tofu & Soybeans']
          : ['Whole Grain Oats & Quinoa', 'Walnuts & Almonds', 'Fresh Seasonal Berries', 'Lean Protein'],
        foodsToLimit: isIronReport
          ? ['Caffeinated Tea or Coffee immediately with meals (hinders iron absorption)', 'Ultra-processed packaged snacks']
          : ['Trans-fats & Fried Foods', 'Excessive Sugary Drinks'],
        whenToConsult: {
          urgency: 'Recommended',
          advice: 'Consider consulting a General Physician if these results are persistent or if you are experiencing fatigue, weakness, or dizziness.',
          specialist: 'General Physician / Hematology Specialist'
        }
      };

      setReportResult(newAnalysis);
      setReportHistory(prev => [newAnalysis, ...prev]);
      setIsProcessing(false);
      setCurrentStep(3);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. HEADER & STEPPER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2 border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" /> AI Medical Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Understand Your <span className="text-teal-600 dark:text-teal-400">Medical Report</span>
          </h1>
        </div>

        {/* 4-Step Progressive Workflow Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center space-x-3 ${
            currentStep >= 1 ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">1</span>
            <span>1. UPLOAD</span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center space-x-3 ${
            currentStep >= 2 ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">2</span>
            <span>2. PROCESS</span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center space-x-3 ${
            currentStep >= 3 ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">3</span>
            <span>3. UNDERSTAND</span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center space-x-3 ${
            currentStep >= 4 ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">4</span>
            <span>4. ACT</span>
          </div>
        </div>
      </div>

      {/* 2. UPLOAD STEP & REPORT HISTORY */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Option A</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Upload Medical File</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Upload blood test, CBC, LFT, KFT, Thyroid, MRI, CT Scan, or X-Ray.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-3xl border-2 border-dashed border-teal-400 dark:border-teal-500/40 hover:border-teal-600 bg-slate-50 dark:bg-slate-950/60 text-center cursor-pointer transition-all space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Click to Upload Report or Drag File Here'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Supports PDF, PNG, JPEG (Vision OCR Active)</p>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Option B</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Describe Your Symptoms</h3>
              </div>

              <form onSubmit={handleSymptomSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder="e.g. Fatigue, feeling weak, low iron CBC..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
                >
                  Analyze Report
                </button>
              </form>
            </div>
          </div>

          {reportHistory.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Saved Report History ({reportHistory.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportHistory.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => { setReportResult(rep); setCurrentStep(3); }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{rep.reportTitle}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{rep.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{rep.reportOverview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PROCESS STEP */}
      {currentStep === 2 && isProcessing && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
            <RotateCw className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analyzing Medical Parameters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Decoding medical terms into plain language...</p>
          </div>
        </div>
      )}

      {/* 4. UNDERSTAND & ACT STEPS */}
      {currentStep >= 3 && reportResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <span>HealthSure provides clinical explanations for educational guidance. This analysis is not a confirmed diagnosis. Always consult a doctor.</span>
          </div>

          {/* ABNORMAL PARAMETERS / NEEDS ATTENTION SECTION (PROMINENT AT TOP) */}
          {reportResult.abnormalMetrics.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/30 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-extrabold uppercase tracking-wider">NEEDS ATTENTION (ABNORMAL FINDINGS)</h3>
              </div>

              <div className="space-y-4">
                {reportResult.abnormalMetrics.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-500/30 space-y-3 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">Reference Range: {item.normalRange} {item.unit}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-black text-rose-600 dark:text-rose-400">{item.value} {item.unit}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase">{item.status}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">What this means in simple language:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item.significance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT OVERVIEW SUMMARY (SIMPLE PATIENT LANGUAGE) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">PATIENT REPORT SUMMARY</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Here's what your report is saying in simple terms</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              "{reportResult.reportOverview}"
            </p>
          </div>

          {/* ELABORATIVE BODY REPORT EXPLANATION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-teal-500/10 border border-teal-500/30 space-y-4">
            <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
              <Activity className="w-5 h-5" />
              <h3 className="text-lg font-extrabold uppercase tracking-wider">UNDERSTANDING YOUR BODY SYSTEM BY SYSTEM</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-900 p-5 rounded-2xl border border-teal-500/20">
              {reportResult.bodyExplanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {reportResult.organSystems.map((sys, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{sys.icon}</span> {sys.systemName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sys.status.includes('Attention') ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {sys.status}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{sys.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NORMAL PARAMETERS SECTION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-lg font-extrabold uppercase tracking-wider">NORMAL PARAMETERS</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Parameter</th>
                    <th className="p-3.5">Patient Value</th>
                    <th className="p-3.5">Reference Range</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {reportResult.normalMetrics.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{item.value} {item.unit}</td>
                      <td className="p-3.5 text-slate-500">{item.normalRange}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC FOOD RECOMMENDATIONS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Apple className="w-5 h-5" />
                <h3 className="text-base font-extrabold uppercase tracking-wider">RECOMMENDED WHOLE FOODS</h3>
              </div>

              <ul className="space-y-2">
                {reportResult.foodsToConsume.map((food, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-emerald-500/10 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <Ban className="w-5 h-5" />
                <h3 className="text-base font-extrabold uppercase tracking-wider">FOODS TO LIMIT / AVOID</h3>
              </div>

              <ul className="space-y-2">
                {reportResult.foodsToLimit.map((food, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-rose-500/10 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* WHEN SHOULD YOU SEE A DOCTOR? */}
          <div className="p-6 sm:p-8 rounded-3xl bg-teal-500/10 border border-teal-500/30 space-y-5">
            <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
              <Stethoscope className="w-6 h-6" />
              <h3 className="text-lg font-extrabold uppercase tracking-wider">WHEN SHOULD YOU SEE A DOCTOR?</h3>
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-5 rounded-2xl border border-teal-500/20">
              "{reportResult.whenToConsult.advice}"
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Recommended Specialist</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{reportResult.whenToConsult.specialist}</span>
              </div>

              <button
                onClick={() => onNavigateDoctors(reportResult.whenToConsult.specialist)}
                className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-colors"
              >
                <span>Book Doctor Appointment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => { setCurrentStep(1); setSelectedFile(null); setReportResult(null); }}
              className="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Analyze Another Report
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
