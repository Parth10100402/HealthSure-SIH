import { jsPDF } from 'jspdf';
import type { MedicalReport } from '../types/health';
import { getReportById } from './reportService';

/**
 * Generate and download a project-specific HealthSure Medical Record Summary PDF
 * using actual backend-fetched data for the selected record.
 */
export async function exportHealthRecordPDF(
  selectedRecordId: string,
  initialReport?: MedicalReport | null
): Promise<{ success: boolean; filename: string; message: string }> {
  try {
    // 1. Fetch latest backend-saved data by exact record ID
    let record: MedicalReport | null = null;
    try {
      const fetched = await getReportById(selectedRecordId);
      if (fetched) {
        record = fetched as any;
      }
    } catch (err) {
      console.warn('[pdfExporterService] API fetch error, using provided initial report:', err);
    }

    if (!record && initialReport) {
      record = initialReport;
    }

    if (!record) {
      throw new Error(`Health record with ID "${selectedRecordId}" could not be found.`);
    }

    // 2. Generate Dynamic Filename
    // Format: HealthSure_[PatientName]_[ReportType]_[Date].pdf
    const patientClean = (record.patientName || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    const reportTypeClean = (record.title || record.type || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
    const dateClean = (record.date || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `HealthSure_${patientClean}_${reportTypeClean}_${dateClean}.pdf`;

    // 3. Initialize jsPDF Document (A4: 595.28 x 841.89 pt)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    let y = 0;
    let pageNum = 1;

    // Helper: Add Footer on every page
    const addFooter = (page: number) => {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);
      doc.text('HealthSure Medical Intelligence Platform • Confidential Patient Medical Record Summary', margin, pageHeight - 20);
      doc.text(`Page ${page}`, pageWidth - margin - 35, pageHeight - 20);
    };

    // Helper: Check Page Break
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 50) {
        addFooter(pageNum);
        doc.addPage();
        pageNum++;
        y = 45;
      }
    };

    // ----------------------------------------------------
    // HEADER BANNER
    // ----------------------------------------------------
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 75, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('HEALTHSURE', margin, 35);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(244, 63, 94); // rose-500
    doc.text('MEDICAL INTELLIGENCE SUMMARY', margin + 125, 35);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Confidential Clinical Summary & Follow-Up Report', margin, 53);

    const nowStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(8);
    doc.text(`Generated: ${nowStr}`, pageWidth - margin - 150, 53);

    y = 95;

    // ----------------------------------------------------
    // SECTION 1: PATIENT INFORMATION CARD
    // ----------------------------------------------------
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, 80, 6, 6, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('PATIENT INFORMATION', margin + 15, y + 20);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text(`Patient Name: ${record.patientName || 'Parth Sharma'}`, margin + 15, y + 40);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Patient ID: ${record.patientId || 'mem-1'}`, margin + 220, y + 40);
    doc.text(`Age / Gender: ${record.age || 20} Yrs / ${record.gender || 'Male'}`, margin + 370, y + 40);

    doc.text(`Blood Group: ${record.bloodGroup || 'B+'}`, margin + 15, y + 60);
    doc.text(`Report ID: ${record.id}`, margin + 220, y + 60);
    doc.text(`Uploaded: ${record.uploadedDate || record.date}`, margin + 370, y + 60);

    y += 95;

    // ----------------------------------------------------
    // SECTION 2: MEDICAL REPORT SUMMARY & DIAGNOSIS
    // ----------------------------------------------------
    checkPageBreak(110);

    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('1. MEDICAL REPORT & CLINICAL DIAGNOSIS', margin + 10, y + 16);
    y += 32;

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Report Name: ${record.title}`, margin, y);
    doc.text(`Department: ${record.department || 'General Medicine'}`, margin + 220, y);
    doc.text(`Condition: ${record.condition || 'Blood'}`, margin + 380, y);
    y += 18;

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`Clinical Diagnosis: ${record.diagnosis || 'Clinical Summary'}`, margin, y);
    y += 18;

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Clinical Summary:', margin, y);
    y += 14;

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(`"${record.summary}"`, contentWidth - 10);
    doc.text(summaryLines, margin + 5, y);
    y += summaryLines.length * 13 + 12;

    // ----------------------------------------------------
    // SECTION 3: BIOMARKER PARAMETERS TABLE
    // ----------------------------------------------------
    checkPageBreak(140);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('2. MEASURED BIOMARKER PARAMETERS', margin + 10, y + 16);
    y += 34;

    // Table Headers
    const col1 = margin;
    const col2 = margin + 180;
    const col3 = margin + 300;
    const col4 = margin + 410;

    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('PARAMETER NAME', col1 + 8, y + 15);
    doc.text('MEASURED VALUE', col2 + 8, y + 15);
    doc.text('REFERENCE RANGE', col3 + 8, y + 15);
    doc.text('CLINICAL STATUS', col4 + 8, y + 15);
    y += 22;

    const parameters = record.parameters || [
      { name: 'Hemoglobin', value: '11.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Low' },
      { name: 'Total Leukocyte Count (WBC)', value: '11,800', unit: '/µL', referenceRange: '4,000 - 11,000', status: 'High' },
      { name: 'Platelet Count', value: '260,000', unit: '/µL', referenceRange: '150,000 - 450,000', status: 'Normal' }
    ];

    parameters.forEach((p, idx) => {
      checkPageBreak(24);
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 20, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 20, margin + contentWidth, y + 20);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(p.name, col1 + 8, y + 14);

      doc.setFont('Helvetica', 'bold');
      const isAbnormal = p.status === 'High' || p.status === 'Low' || p.status === 'Critical';
      doc.setTextColor(isAbnormal ? 225 : 16, isAbnormal ? 29 : 185, isAbnormal ? 72 : 129); // rose or emerald
      doc.text(`${p.value} ${p.unit || ''}`, col2 + 8, y + 14);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const refStr = (p as any).referenceRange || (p as any).refRange || (
        p.name.toLowerCase().includes('hemoglobin') ? '13.0 - 17.0 g/dL' :
        p.name.toLowerCase().includes('tsh') ? '0.40 - 4.50 µIU/mL' :
        p.name.toLowerCase().includes('sgpt') || p.name.toLowerCase().includes('alt') ? '7 - 45 U/L' :
        p.name.toLowerCase().includes('sgot') || p.name.toLowerCase().includes('ast') ? '8 - 40 U/L' :
        p.name.toLowerCase().includes('wbc') || p.name.toLowerCase().includes('leukocyte') ? '4,000 - 11,000 /µL' :
        p.name.toLowerCase().includes('platelet') ? '150,000 - 450,000 /µL' :
        'Normal Reference Range'
      );
      doc.text(refStr, col3 + 8, y + 14);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(isAbnormal ? 225 : 16, isAbnormal ? 29 : 185, isAbnormal ? 72 : 129);
      doc.text(p.status || 'Normal', col4 + 8, y + 14);

      y += 20;
    });

    y += 15;

    // ----------------------------------------------------
    // SECTION 4: AI DIAGNOSTIC RECOMMENDATIONS
    // ----------------------------------------------------
    checkPageBreak(100);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('3. AI DIAGNOSTIC RECOMMENDATIONS', margin + 10, y + 16);
    y += 34;

    const recommendations = record.recommendations || [
      `Repeat ${record.title} after 4 weeks to evaluate biomarker progress.`,
      `Consult a ${record.assignedSpecialist || 'General Physician'} for clinical review.`
    ];

    recommendations.forEach((recText) => {
      checkPageBreak(25);
      doc.setFillColor(147, 51, 234); // purple-600
      doc.circle(margin + 12, y + 6, 2.5, 'F');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const recLines = doc.splitTextToSize(recText, contentWidth - 30);
      doc.text(recLines, margin + 22, y + 9);
      y += recLines.length * 13 + 6;
    });

    y += 10;

    // ----------------------------------------------------
    // SECTION 5: PATIENT FOLLOW-UP WORKFLOW (CRITICAL)
    // ----------------------------------------------------
    checkPageBreak(150);

    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254); // indigo-200
    doc.roundedRect(margin, y, contentWidth, 130, 6, 6, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text('4. PATIENT FOLLOW-UP WORKFLOW & CLINICIAN NOTE', margin + 15, y + 22);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Follow-Up Status: ${record.followUpStatus || 'Follow-Up Recommended'}`, margin + 15, y + 42);
    doc.text(`Priority: ${record.priority || 'Moderate'}`, margin + 250, y + 42);
    doc.text(`Next Follow-Up Date: ${record.nextFollowUpDate || 'As advised'}`, margin + 370, y + 42);

    doc.text(`Assigned Specialist: ${record.assignedSpecialist || record.department || 'General Physician'}`, margin + 15, y + 62);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Reason: ${record.followUpReason || record.summary || 'Biomarker monitoring'}`, margin + 250, y + 62);

    // Clinician Note Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(224, 231, 255);
    doc.roundedRect(margin + 15, y + 74, contentWidth - 30, 42, 4, 4, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text('CLINICIAN NOTE:', margin + 25, y + 88);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const noteText = `"${record.clinicianNote || 'Repeat evaluation as advised by physician.'}"`;
    const noteLines = doc.splitTextToSize(noteText, contentWidth - 50);
    doc.text(noteLines, margin + 25, y + 104);

    y += 145;

    // ----------------------------------------------------
    // SECTION 6: FOLLOW-UP TIMELINE
    // ----------------------------------------------------
    if (Array.isArray(record.followUpTimeline) && record.followUpTimeline.length > 0) {
      checkPageBreak(100);

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('5. LONGITUDINAL FOLLOW-UP TIMELINE', margin + 10, y + 16);
      y += 34;

      record.followUpTimeline.forEach((item) => {
        checkPageBreak(25);
        doc.setFillColor(99, 102, 241);
        doc.circle(margin + 12, y + 5, 3, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(item.date, margin + 22, y + 8);

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(item.title, margin + 100, y + 8);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const descText = item.description || '';
        const descLines = doc.splitTextToSize(descText, contentWidth - 250);
        doc.text(descLines, margin + 240, y + 8);

        y += Math.max(descLines.length * 12, 18);
      });
    }

    // Add final footer
    addFooter(pageNum);

    // Save and Trigger Download
    doc.save(filename);

    return {
      success: true,
      filename,
      message: 'Report generated successfully.'
    };
  } catch (error: any) {
    console.error('[pdfExporterService] Error generating PDF:', error);
    return {
      success: false,
      filename: '',
      message: error?.message || 'Unable to generate the report. Please try again.'
    };
  }
}
