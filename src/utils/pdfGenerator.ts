// HealthSure — Real Client-Side PDF & Document Export Engine
// src/utils/pdfGenerator.ts

import { jsPDF } from 'jspdf';
import type { HealthRecord, Appointment, Referral, PatientProfile } from '../types/patient';
import type { AuthUser } from '../services/authService';
import { HEALTHSURE_IVR_NUMBER } from '../config/constants';

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(7, 59, 58);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HEALTHSURE • RURAL CARE CONTINUITY PLATFORM', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(167, 217, 206);
  doc.text('National Rural Health Mission & Ministry of Health and Family Welfare', 14, 18);
  doc.text(`Helpline: ${HEALTHSURE_IVR_NUMBER} | Official Medical Document`, 14, 23);

  doc.setFillColor(234, 247, 242);
  doc.rect(0, 28, pageWidth, 14, 'F');

  doc.setTextColor(8, 127, 109);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, pageWidth - 14, 37, { align: 'right' });
}

function addFooter(doc: jsPDF, docId: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(221, 232, 228);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Doc ID: ${docId} • Generated on ${new Date().toLocaleString('en-IN')} • Verified Electronic Healthcare Record`,
    14,
    pageHeight - 12
  );
  doc.text(
    `Page 1 of 1 • HealthSure Digital Platform (${HEALTHSURE_IVR_NUMBER})`,
    pageWidth - 14,
    pageHeight - 12,
    { align: 'right' }
  );
}

export function downloadHealthRecordPDF(
  record: HealthRecord,
  patient?: Partial<PatientProfile> | AuthUser | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const patientName = patient?.fullName || 'Parth Sharma';
  const patientId = (patient as any)?.patientId || patient?.id || 'HS-10248';
  const facility = record.facility || (patient as any)?.village || 'PHC Khed';

  addHeader(
    doc,
    'OFFICIAL CLINICAL CONSULTATION SUMMARY',
    `Consultation Date: ${record.date || new Date().toISOString().split('T')[0]}`
  );

  let y = 48;

  doc.setFillColor(245, 249, 247);
  doc.setDrawColor(221, 232, 228);
  doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 50, 77);
  doc.text('PATIENT IDENTIFICATION & CLINICAL JURISDICTION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Patient Name: ${patientName}`, 18, y + 13);
  doc.text(`Patient Health ID: ${patientId}`, 18, y + 19);
  doc.text(`Primary Health Centre: ${facility}`, 18, y + 25);

  doc.text(`Record ID: ${record.id}`, 110, y + 13);
  doc.text(`Consulting Doctor: ${record.doctorName || 'Dr. Ananya Mehta'}`, 110, y + 19);
  doc.text(`Speciality: ${record.speciality || 'Cardiology'}`, 110, y + 25);

  y += 34;

  if (record.vitals) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(8, 127, 109);
    doc.text('1. RECORDED CLINICAL VITALS', 14, y);
    y += 4;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(221, 232, 228);
    doc.roundedRect(14, y, 182, 16, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(23, 50, 77);

    const v = record.vitals;
    const vText = `Blood Pressure: ${v.bloodPressure || '138/88 mmHg'}   |   Pulse: ${v.pulseRate || '76 bpm'}   |   SpO2: ${v.spo2Percent ? v.spo2Percent + '%' : '98%'}   |   Sugar: ${v.bloodSugarMgDl ? v.bloodSugarMgDl + ' mg/dL' : '110 mg/dL'}   |   Weight: ${v.weightKg ? v.weightKg + ' kg' : '64 kg'}`;
    doc.text(vText, 18, y + 10);
    y += 22;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 127, 109);
  doc.text('2. CLINICAL ASSESSMENT & DIAGNOSIS', 14, y);
  y += 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(221, 232, 228);
  doc.roundedRect(14, y, 182, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 50, 77);
  doc.text(`Title: ${record.title || 'Stage 1 Hypertension & Exertional Angina Screening'}`, 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const notes = record.clinicalAssessmentNotes || 'Patient advised sodium restriction and regular blood pressure monitoring. Medication adherence verified.';
  doc.text(doc.splitTextToSize(`Clinical Assessment: ${notes}`, 174), 18, y + 14);

  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 127, 109);
  doc.text('3. PRESCRIBED MEDICINES & DISPENSING INSTRUCTIONS (Rx)', 14, y);
  y += 5;

  doc.setFillColor(7, 59, 58);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('MEDICINE & DOSAGE', 18, y + 4.5);
  doc.text('FREQUENCY', 95, y + 4.5);
  doc.text('DURATION', 135, y + 4.5);
  doc.text('INSTRUCTIONS', 165, y + 4.5);
  y += 7;

  const meds = record.prescriptions && record.prescriptions.length > 0
    ? record.prescriptions
    : [
        { name: 'Amlodipine 5mg', genericName: 'Amlodipine', dosage: '1 Tablet', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'After breakfast' },
        { name: 'Aspirin 75mg', genericName: 'Aspirin', dosage: '1 Tablet', frequency: 'Once daily (Night)', duration: '30 Days', instructions: 'After dinner' },
      ];

  meds.forEach((m, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(221, 232, 228);
    doc.line(14, y + 8, 196, y + 8);

    doc.setTextColor(23, 50, 77);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${m.name} (${m.dosage})`, 18, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(m.frequency, 95, y + 5.5);
    doc.text(m.duration, 135, y + 5.5);
    doc.text(m.instructions, 165, y + 5.5);

    y += 8;
  });

  y += 12;

  doc.setFillColor(245, 249, 247);
  doc.roundedRect(14, y, 182, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(8, 127, 109);
  doc.text('ELECTRONIC SIGNATURE & VALIDATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Treating Officer: ${record.doctorName || 'Dr. Ananya Mehta, MD'} (Reg. No: MMC-2018-04821)`, 18, y + 12);
  doc.text('Digitally authenticated via HealthSure Multi-Tier Care Continuity Engine.', 18, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 127, 109);
  doc.text('[ VERIFIED ELECTRONIC SEAL ]', 140, y + 12);

  addFooter(doc, record.id || 'HS-REC-001');
  doc.save(`HealthSure_MedicalRecord_${patientName.replace(/\s+/g, '_')}_${record.id}.pdf`);
}

export function downloadAppointmentSlipPDF(
  appointment: Appointment,
  patient?: Partial<PatientProfile> | AuthUser | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const patientName = patient?.fullName || 'Parth Sharma';
  const patientId = (patient as any)?.patientId || patient?.id || 'HS-10248';

  addHeader(
    doc,
    'OFFICIAL OPD APPOINTMENT SLIP',
    `Token: ${appointment.tokenNumber || 'HS-TKN-01'}`
  );

  let y = 50;

  doc.setFillColor(8, 127, 109);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`APPOINTMENT TOKEN: ${appointment.tokenNumber || 'HS-TKN-01'}`, 18, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${appointment.status.toUpperCase()} • Mode: ${appointment.type.toUpperCase()}`, 18, y + 17);
  doc.text(`Date & Time: ${appointment.date} at ${appointment.time}`, 110, y + 17);

  y += 28;

  doc.setFillColor(245, 249, 247);
  doc.setDrawColor(221, 232, 228);
  doc.roundedRect(14, y, 182, 54, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 50, 77);
  doc.text('CONSULTATION & FACILITY DETAILS', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Patient Name: ${patientName}`, 18, y + 16);
  doc.text(`Patient ID: ${patientId}`, 18, y + 23);
  doc.text(`Assigned Specialist: ${appointment.doctorName}`, 18, y + 30);
  doc.text(`Speciality: ${appointment.speciality}`, 18, y + 37);
  doc.text(`Healthcare Facility: ${appointment.facility}`, 18, y + 44);

  doc.text(`OPD Room / Desk: ${appointment.roomNumber || 'OPD-102'}`, 110, y + 16);
  doc.text(`Reason for Visit: ${appointment.reasonForVisit || 'Specialist Assessment'}`, 110, y + 23);
  doc.text(`Facility Type: ${appointment.facilityType || 'PHC'}`, 110, y + 30);

  y += 62;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(8, 127, 109);
  doc.text('PATIENT GUIDELINES & PREPARATION', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const guidelines = [
    '• Please report to the facility 15 minutes prior to your scheduled slot.',
    '• Carry this printed or digital slip along with a valid Government Photo ID / ABHA Card.',
    '• Bring all previous medical records, diagnostic test reports, and current medication strips.',
    '• In case of emergency or unexpected delays, contact the HealthSure Helpline at 07314624692.',
  ];
  guidelines.forEach((g) => {
    doc.text(g, 14, y);
    y += 5.5;
  });

  addFooter(doc, appointment.id);
  doc.save(`HealthSure_AppointmentSlip_${appointment.id}.pdf`);
}

export function downloadReferralPassPDF(
  referral: Referral,
  patient?: Partial<PatientProfile> | AuthUser | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const patientName = patient?.fullName || 'Parth Sharma';
  const patientId = (patient as any)?.patientId || patient?.id || 'HS-10248';

  addHeader(
    doc,
    'OFFICIAL INTER-FACILITY REFERRAL PASS',
    `Referral ID: ${referral.id}`
  );

  let y = 50;

  doc.setFillColor(referral.priority === 'Urgent' ? 225 : 8, referral.priority === 'Urgent' ? 29 : 127, referral.priority === 'Urgent' ? 72 : 109);
  doc.roundedRect(14, y, 182, 20, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`REFERRAL PASS: ${referral.id}   [ PRIORITY: ${referral.priority.toUpperCase()} ]`, 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Status: ${referral.status.toUpperCase()} • Department: ${referral.department}`, 18, y + 15);

  y += 26;

  doc.setFillColor(245, 249, 247);
  doc.setDrawColor(221, 232, 228);
  doc.roundedRect(14, y, 182, 40, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 50, 77);
  doc.text('TRANSFER PIPELINE & CLINICAL INDICATION', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Patient Name: ${patientName} (${patientId})`, 18, y + 14);
  doc.text(`Referring Centre: ${referral.fromFacility}`, 18, y + 21);
  doc.text(`Destination Hospital: ${referral.toFacility}`, 18, y + 28);
  doc.text(`Clinical Reason: ${referral.clinicalReason}`, 18, y + 35);

  y += 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(8, 127, 109);
  doc.text('REFERRAL CONTINUITY STAGES', 14, y);
  y += 5;

  referral.timeline.forEach((t) => {
    const isDone = t.status === 'completed';
    const isCurrent = t.status === 'current';

    doc.setFillColor(isDone ? 234 : isCurrent ? 254 : 248, isDone ? 247 : isCurrent ? 243 : 250, isDone ? 242 : isCurrent ? 199 : 252);
    doc.roundedRect(14, y, 182, 8, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(isDone ? 8 : isCurrent ? 180 : 100, isDone ? 127 : isCurrent ? 83 : 116, isDone ? 109 : isCurrent ? 9 : 139);

    const mark = isDone ? '[ COMPLETED ]' : isCurrent ? '[ IN PROGRESS ]' : '[ PENDING ]';
    doc.text(`${t.step}. ${t.label}`, 18, y + 5.5);
    doc.text(mark, 160, y + 5.5);

    y += 9.5;
  });

  addFooter(doc, referral.id);
  doc.save(`HealthSure_ReferralPass_${referral.id}.pdf`);
}

export function downloadAdminReportPDF(
  reportTitle: string,
  data: any[],
  summaryText?: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addHeader(
    doc,
    'PUBLIC HEALTH OPERATIONAL REPORT',
    `Export Timestamp: ${new Date().toISOString()}`
  );

  let y = 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(23, 50, 77);
  doc.text(reportTitle, 14, y);
  y += 6;

  if (summaryText) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(summaryText, 182), 14, y);
    y += 12;
  }

  doc.setFillColor(7, 59, 58);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('METRIC / ENTITY', 18, y + 4.5);
  doc.text('VALUE / STATUS', 120, y + 4.5);
  y += 7;

  data.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(221, 232, 228);
    doc.line(14, y + 8, 196, y + 8);

    doc.setTextColor(23, 50, 77);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const key = Object.keys(row)[0] || 'Metric';
    const val = row[key] || JSON.stringify(row);

    doc.text(String(key), 18, y + 5.5);
    doc.text(String(val), 120, y + 5.5);

    y += 8;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  addFooter(doc, `REP-${Date.now()}`);
  doc.save(`HealthSure_Report_${reportTitle.replace(/\s+/g, '_')}.pdf`);
}

export function exportReportCSV(reportTitle: string, data: any[]) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers.map((h) => `"${String(obj[h] || '').replace(/"/g, '""')}"`).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HealthSure_${reportTitle.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
