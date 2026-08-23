import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Search, 
  CheckCircle2, 
  User, 
  Building2,
  Sparkles,
  Download,
  Check
} from 'lucide-react';
import type { Hospital, FamilyMember } from '../types/health';
import { MOCK_HOSPITALS, MOCK_FAMILY_MEMBERS } from '../data/mockData';

const PROCEDURES_LIST = [
  { id: 'p1', name: 'Angioplasty / Stent Implantation', category: 'Cardiology', baseFee: 145000, avgDays: 2 },
  { id: 'p2', name: 'Total Knee Replacement', category: 'Orthopedics', baseFee: 210000, avgDays: 4 },
  { id: 'p3', name: 'Laparoscopic Gallbladder Surgery', category: 'Gastroenterology', baseFee: 72000, avgDays: 2 },
  { id: 'p4', name: 'Cataract Surgery with Monofocal Lens', category: 'Ophthalmology', baseFee: 38000, avgDays: 1 },
  { id: 'p5', name: 'C-Section Maternity Delivery', category: 'Gynecology', baseFee: 92000, avgDays: 4 },
  { id: 'p6', name: 'Dengue In-Patient Care', category: 'General Medicine', baseFee: 32000, avgDays: 3 }
];

const INSURANCE_PROVIDERS = [
  'Star Health Insurance (Preferred)',
  'HDFC ERGO Health Insurance',
  'Niva Bupa Health Insurance',
  'ICICI Lombard Health',
  'Ayushman Bharat / PM-JAY',
  'Out-of-Pocket / Cash Pay'
];

export const CostEstimator: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(MOCK_FAMILY_MEMBERS[0]);
  const [searchProc, setSearchProc] = useState('');
  const [selectedProc, setSelectedProc] = useState(PROCEDURES_LIST[0]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(MOCK_HOSPITALS[0]);
  const [selectedInsurance, setSelectedInsurance] = useState(INSURANCE_PROVIDERS[0]);
  const [roomType, setRoomType] = useState<'General Ward' | 'Semi-Private' | 'Private'>('Private');
  const [selectedHospId, setSelectedHospId] = useState<string>(MOCK_HOSPITALS[0].id);

  // Filtered Procedures
  const filteredProcedures = useMemo(() => {
    if (!searchProc.trim()) return PROCEDURES_LIST;
    return PROCEDURES_LIST.filter(p => p.name.toLowerCase().includes(searchProc.toLowerCase()) || p.category.toLowerCase().includes(searchProc.toLowerCase()));
  }, [searchProc]);

  // Transparent Cost Calculations with 8 Specific Line Items
  const calculations = useMemo(() => {
    let roomRate = 4500;
    if (roomType === 'General Ward') roomRate = 1800;
    if (roomType === 'Semi-Private') roomRate = 2800;

    const doctorFee = selectedHospital.consultationFee ? selectedHospital.consultationFee * 15 : 12000;
    const diagnostics = Math.round(selectedProc.baseFee * 0.15);
    const medicines = Math.round(selectedProc.baseFee * 0.12);
    const surgicalConsumables = Math.round(selectedProc.baseFee * 0.08);
    const hospitalAdmission = 2500;
    const roomNursingCharges = roomRate * selectedProc.avgDays + 1200 * selectedProc.avgDays;
    const otProcedureCost = Math.round(selectedProc.baseFee * 0.45);
    const taxesAdmin = Math.round(selectedProc.baseFee * 0.05);

    const grossBill = doctorFee + diagnostics + medicines + surgicalConsumables + hospitalAdmission + roomNursingCharges + otProcedureCost + taxesAdmin;

    let coveragePercent = 0.80;
    if (selectedInsurance.includes('Out-of-Pocket')) coveragePercent = 0.0;
    if (selectedInsurance.includes('Ayushman')) coveragePercent = 0.95;

    const insuranceCoverage = Math.round(grossBill * coveragePercent);
    const patientPayable = Math.max(0, grossBill - insuranceCoverage);

    return {
      doctorFee,
      diagnostics,
      medicines,
      surgicalConsumables,
      hospitalAdmission,
      roomNursingCharges,
      otProcedureCost,
      taxesAdmin,
      grossBill,
      insuranceCoverage,
      patientPayable
    };
  }, [selectedProc, selectedHospital, selectedInsurance, roomType]);

  // Multi-Hospital Comparison Table Data
  const hospitalComparison = useMemo(() => {
    return MOCK_HOSPITALS.slice(0, 3).map((h) => {
      const hospDocFee = h.consultationFee ? h.consultationFee * 15 : 12000;
      const baseGross = Math.round(selectedProc.baseFee * 0.95 + hospDocFee);
      const cov = selectedInsurance.includes('Out-of-Pocket') ? 0 : 0.80;
      const insCov = Math.round(baseGross * cov);
      const outOfPocket = Math.max(0, baseGross - insCov);

      return {
        id: h.id,
        hospital: h,
        hospitalName: h.name,
        location: h.location,
        estimatedGross: baseGross,
        insuranceCoverage: insCov,
        outOfPocket: outOfPocket,
        majorComponents: `${h.hospitalType} • ${selectedProc.avgDays} Days Stay`
      };
    });
  }, [selectedProc, selectedInsurance]);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. HEADER SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider border border-teal-500/20 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> 100% Transparent Cost Estimator
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Treatment Cost <span className="text-teal-600 dark:text-teal-400">Calculator</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-500" /> Patient:
            </span>
            {MOCK_FAMILY_MEMBERS.map((mem) => {
              const isActive = selectedMember.id === mem.id;
              return (
                <button
                  key={mem.id}
                  onClick={() => setSelectedMember(mem)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <img src={mem.avatar} alt={mem.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{mem.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Cost Estimate PDF</span>
        </button>
      </div>

      {/* 2. STEP 1, 2, 3 SELECTION FORM (TOP FULL WIDTH) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Configure Treatment & Hospital Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STEP 1: Procedure */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase text-teal-600 dark:text-teal-400 block">
              Step 1: Disease / Procedure
            </label>
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchProc}
                onChange={(e) => setSearchProc(e.target.value)}
                placeholder="Search treatment..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 pr-1">
              {filteredProcedures.map((proc) => {
                const isSelected = selectedProc.id === proc.id;
                return (
                  <button
                    key={proc.id}
                    onClick={() => setSelectedProc(proc)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{proc.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Hospital */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase text-teal-600 dark:text-teal-400 block">
              Step 2: Select Hospital
            </label>
            <select
              value={selectedHospital.id}
              onChange={(e) => {
                const found = MOCK_HOSPITALS.find(h => h.id === e.target.value);
                if (found) {
                  setSelectedHospital(found);
                  setSelectedHospId(found.id);
                }
              }}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
              ))}
            </select>
          </div>

          {/* STEP 3: Insurance & Room */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase text-teal-600 dark:text-teal-400 block">
              Step 3: Insurance & Room Category
            </label>
            <div className="space-y-3">
              <select
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
              >
                {INSURANCE_PROVIDERS.map((ins) => (
                  <option key={ins} value={ins}>{ins}</option>
                ))}
              </select>

              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as any)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
              >
                <option value="General Ward">General Ward (₹1,800/day)</option>
                <option value="Semi-Private">Semi-Private Room (₹2,800/day)</option>
                <option value="Private">Private Room (₹4,500/day)</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* 3. COST BREAKDOWN SUMMARY (STACKED DIRECTLY BELOW SELECTION FORM) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase text-teal-600 dark:text-teal-400 block">Step 4: Estimated Cost Breakdown</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedProc.name} at {selectedHospital.name}</h2>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Download Breakdown</span>
          </button>
        </div>

        {/* VISUALLY PROMINENT PATIENT PAYABLE CARD */}
        <div className="p-6 rounded-3xl bg-teal-600 text-white text-center space-y-2 shadow-lg shadow-teal-600/20 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-100 block">Estimated Out-of-Pocket Cost</span>
          <span className="text-4xl font-black block">₹{calculations.patientPayable.toLocaleString()}</span>
          <span className="text-[11px] text-teal-100 font-medium block">Net Patient Payable After Insurance Coverage</span>
        </div>

        {/* GROSS & COVERAGE OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Gross Estimated Hospital Bill</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">₹{calculations.grossBill.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Insurance Coverage</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">- ₹{calculations.insuranceCoverage.toLocaleString()}</span>
          </div>
        </div>

        {/* DETAILED 8 LINE ITEMS GRID */}
        <div className="space-y-3 max-w-4xl mx-auto pt-2">
          <span className="text-xs font-extrabold uppercase text-slate-400 block">Itemized Cost Breakdown (8 Categories)</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>1. Doctor / Surgeon Fee:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.doctorFee.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>2. Diagnostic & Lab Tests:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.diagnostics.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>3. Medicines:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.medicines.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>4. Surgical Consumables:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.surgicalConsumables.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>5. Hospital Admission Fee:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.hospitalAdmission.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>6. Room & Nursing Charges:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.roomNursingCharges.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>7. OT / Main Procedure Cost:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.otProcedureCost.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between font-medium">
              <span>8. Taxes & Additional Charges:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{calculations.taxesAdmin.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. HOSPITAL COMPARISON SECTION WITH "SELECT THIS HOSPITAL" BUTTON */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
          <Building2 className="w-5 h-5" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Hospital Comparison</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Hospital</th>
                <th className="p-3.5">Gross Cost</th>
                <th className="p-3.5">Insurance Coverage</th>
                <th className="p-3.5">Out-of-Pocket</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {hospitalComparison.map((item) => {
                const isSelected = selectedHospId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>
                        <span>{item.hospitalName}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{item.location}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">₹{item.estimatedGross.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">- ₹{item.insuranceCoverage.toLocaleString()}</td>
                    <td className="p-3.5 font-black text-teal-600 dark:text-teal-400">₹{item.outOfPocket.toLocaleString()}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          setSelectedHospital(item.hospital);
                          setSelectedHospId(item.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{isSelected ? 'Selected' : 'Select Hospital'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. AI FINANCIAL RECOMMENDATION CARD (BELOW COMPARISON SECTION) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-teal-500/10 border border-teal-500/30 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-extrabold uppercase tracking-wider">AI FINANCIAL RECOMMENDATION</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white dark:bg-slate-900 p-5 rounded-2xl border border-teal-500/20">
          "{hospitalComparison[0]?.hospitalName} offers the lowest estimated out-of-pocket cost for {selectedProc.name} under your {selectedInsurance} policy. Your policy covers up to 80% of the total estimated bill. Verify pre-authorization with your insurer prior to elective admission."
        </p>

        <div className="p-3 rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-400 text-[10px] font-bold">
          💡 ESTIMATED PRICES: Rates are calculated using standard insurance tariff benchmarks.
        </div>
      </div>

    </div>
  );
};
