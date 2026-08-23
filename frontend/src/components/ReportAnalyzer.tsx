import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Utensils, 
  BrainCircuit,
  ShieldAlert,
  RotateCw
} from 'lucide-react';
import { analyzeReportWithAI } from '../services/aiCopilotService';
import type { AICopilotResult } from '../services/aiCopilotService';


export const ReportAnalyzer: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<AICopilotResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const reportTypes = [
    'Blood Test', 
    'CBC (Complete Blood Count)', 
    'LFT (Liver Function)', 
    'KFT (Kidney Function)', 
    'Lipid Profile', 
    'Thyroid (TSH)', 
    'Blood Sugar (HbA1c)', 
    'Vitamin D'
  ];

  // Dynamic analysis runner
  const handleAnalyzeFile = async (fileName: string) => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeReportWithAI(fileName);
      setSelectedReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle PDF/Image File Selection
  const handleFileDrop = (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let fileName = 'Uploaded_Medical_Report.pdf';
    
    if ('files' in e.target && e.target.files && e.target.files[0]) {
      fileName = e.target.files[0].name;
    }

    handleAnalyzeFile(fileName);
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-8 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Dynamic OCR & Diagnostic Vision Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Medical Report <span className="text-gradient-rose">Decoder</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Upload PDF reports or scan lab documents to receive instant dynamic explanations, parameter breakdowns, diet plans, and health scores.
        </p>
      </div>

      {/* Upload Drop Zone & Sample Buttons */}
      <div className="mb-10 space-y-6">
        
        {/* Supported Types Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Supported Formats:</span>
          {reportTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleAnalyzeFile(type)}
              className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-500/20 transition-all hover:scale-105"
            >
              + Test {type}
            </button>
          ))}
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleFileDrop}
          className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer relative overflow-hidden section-theme-analyzer ${
            dragActive
              ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
              : 'border-rose-300 dark:border-rose-800 hover:border-rose-500'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileDrop}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="max-w-md mx-auto space-y-4 pointer-events-none">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-8 h-8 animate-bounce text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Drag & Drop Medical Report (PDF or Image)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports Blood Test, CBC, LFT, KFT, Thyroid, MRI, CT Scan, X-Ray
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md">
              Browse & Analyze File
            </button>
          </div>
        </div>

        {/* Quick Demo Pre-loaded Reports Buttons */}
        <div className="p-4 rounded-2xl glass-card section-theme-analyzer border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Select a sample report to test dynamic OCR parsing:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'CBC Report (Hb 10.1)', file: 'CBC_Report_Hemoglobin_Low.pdf' },
              { label: 'Thyroid Panel (TSH 8.7)', file: 'Thyroid_TSH_Elevated.pdf' },
              { label: 'LFT Report (SGPT 180)', file: 'LFT_SGPT_Elevated.pdf' },
              { label: 'KFT Panel (Creatinine 2.1)', file: 'KFT_Creatinine_High.pdf' },
              { label: 'Lipid Profile (Cholesterol 245)', file: 'Lipid_Profile_High.pdf' },
              { label: 'Sugar Test (Glucose 142)', file: 'Fasting_Blood_Sugar.pdf' }
            ].map((sample) => (
              <button
                key={sample.label}
                onClick={() => handleAnalyzeFile(sample.file)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
              >
                📄 {sample.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Analysis Loading Screen */}
      {isAnalyzing && (
        <div className="p-12 text-center glass-card rounded-3xl space-y-4 my-8 animate-pulse">
          <RotateCw className="w-12 h-12 text-rose-500 animate-spin mx-auto" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Diagnostic Engine Analyzing Lab Biomarkers...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Extracting reference ranges via OCR, checking for abnormal indicators, and synthesizing layman explanations...
          </p>
        </div>
      )}

      {/* Analysis Results View */}
      {!isAnalyzing && selectedReport && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Header Score & Status Card */}
          <div className="p-8 rounded-3xl glass-card section-theme-analyzer border relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 text-center md:text-left">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                  Parsed via Dynamic Vision Engine
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {selectedReport.reportType}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Assessed Risk: {selectedReport.riskLevel} • Precision Confidence: {selectedReport.aiConfidence}%
                </p>
              </div>

              {/* Health Score Gauge Meter */}
              <div className="flex items-center space-x-4 bg-slate-100 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-200 dark:text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={200}
                      strokeDashoffset={200 - (200 * selectedReport.healthScore) / 100}
                      className={selectedReport.healthScore > 80 ? 'text-rose-500' : 'text-amber-500'}
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-slate-900 dark:text-white">
                    {selectedReport.healthScore}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overall Health Score</span>
                  <span className={`text-sm font-extrabold ${selectedReport.healthScore > 80 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedReport.riskLevel}
                  </span>
                </div>
              </div>

            </div>

            {/* Summary Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Clinical Overview Summary
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {selectedReport.summary}
              </p>
            </div>

          </div>

          {/* Normal vs Abnormal Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Parameters Breakdown Panel */}
            <div className="p-6 rounded-3xl glass-card space-y-4 col-span-2">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Parsed Parameters & Biomarkers ({selectedReport.parameters.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedReport.parameters.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.status === 'Normal' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {item.status} ({item.value} {item.unit})
                      </span>
                    </div>
                    <p className="text-slate-500">Ref: {item.referenceRange}</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium pt-1">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Diet Recommendations (Foods to Eat vs Foods to Avoid) */}
          <div className="p-8 rounded-3xl glass-card space-y-6">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-5 h-5" />
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Nutritional & Diet Guidelines</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Foods to Eat */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <h5 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Foods to Consume & Prefer
                </h5>
                <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {selectedReport.foodsToEat.map((food, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">{food.icon}</span> 
                      <div>
                        <strong>{food.name}</strong> - {food.benefit}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Foods to Avoid */}
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <h5 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Foods to Limit & Avoid
                </h5>
                <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {selectedReport.foodsToAvoid.map((food, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">{food.icon}</span> 
                      <div>
                        <strong>{food.name}</strong> - {food.benefit}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>



          {/* Mandatory Medical Disclaimer */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Important Disclaimer:</strong> "This explanation is educational and does not replace professional medical advice."
            </span>
          </div>

        </div>
      )}

    </section>
  );
};
