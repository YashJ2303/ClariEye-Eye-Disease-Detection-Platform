import { jsPDF } from 'jspdf';

/**
 * Generates a high-end clinical diagnostic report for ClariEye AI
 */
export function generatePDF({ result, patientInfo, imagePreview, now }) {
  const originalImage = imagePreview;
  const heatmapBase64 = result.heatmapBase64;
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();
  const reportId = `SCAN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Helper: Draw a horizontal separator
  const separator = (y) => {
    doc.setDrawColor(240, 240, 240);
    doc.line(14, y, 196, y);
  };

  let y = 15;

  // --- HEADER SECTION ---
  // Background rectangle for Header
  doc.setFillColor(15, 23, 42); // Deep Navy
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CLARI EYE AI', 15, 25);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 212, 191); // Teal
  doc.text('NEXT GENERATION CLINICAL OPHTHALMOLOGY', 15, 32);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`REPORT ID: ${reportId}`, 195, 25, { align: 'right' });
  doc.text(`DATE: ${new Date().toISOString().split('T')[0]}`, 195, 32, { align: 'right' });

  y = 55;

  // --- PATIENT DEMOGRAPHICS ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT DEMOGRAPHICS', 15, y);
  y += 6;
  separator(y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('NAME:', 15, y);
  doc.text('AGE:', 80, y);
  doc.text('TARGET EYE:', 120, y);
  doc.text('GENDER:', 160, y);
  
  y += 5;
  doc.setTextColor(30, 41, 59);
  doc.text(patientInfo?.patientName || 'Anonymous', 15, y);
  doc.text(patientInfo?.patientAge?.toString() || 'N/A', 80, y);
  doc.text(patientInfo?.patientEye || 'N/A', 120, y);
  doc.text('Specified', 160, y);

  y += 15;

  // --- DIAGNOSTIC VISUALS ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSTIC VISUAL EVIDENCE', 15, y);
  y += 6;
  separator(y);
  y += 10;

  if (originalImage && heatmapBase64) {
    // Frames for images
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 85, 60);
    doc.rect(106, y, 85, 60);
    
    doc.addImage(originalImage, 'JPEG', 16, y+2, 81, 56);
    doc.addImage(`data:image/jpeg;base64,${heatmapBase64}`, 'JPEG', 108, y+2, 81, 56);
    
    y += 65;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Fig 1. Original Retinal Fundus Scan', 15, y);
    doc.text('Fig 2. AI Attention / Heatmap Overlay', 107, y);
    y += 15;
  }

  // --- CLINICAL FINDINGS ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AI-ASSISTED CLINICAL FINDINGS', 15, y);
  y += 6;
  separator(y);
  y += 10;

  // Primary Diagnosis Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 20, 'F');
  doc.setDrawColor(13, 148, 136); // Teal
  doc.setLineWidth(0.5);
  doc.line(14, y, 14, y + 20); // Left accent border

  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136);
  doc.text('PRIMARY PATHOLOGY DETECTED', 18, y + 7);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(result.primary_diagnosis.toUpperCase(), 18, y + 16);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('URGENCY:', 140, y + 7);
  doc.setFontSize(12);
  doc.setTextColor(result.urgency === 'urgent' ? 220 : 15, result.urgency === 'urgent' ? 38 : 23, result.urgency === 'urgent' ? 38 : 42);
  doc.text(result.urgency.toUpperCase(), 140, y + 16);
  
  y += 30;

  // Findings Table
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DISEASE INDICATOR', 15, y);
  doc.text('SEVERITY', 120, y);
  doc.text('CONFIDENCE', 160, y);
  y += 4;
  doc.setLineWidth(0.1);
  separator(y);
  y += 8;

  result.findings.forEach((f) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(f.disease, 15, y);
    doc.setFont('helvetica', 'normal');
    const stage = (f.disease === result.primary_diagnosis) ? result.severity_stage : 'N/A';
    doc.text(stage.toUpperCase(), 120, y);
    doc.text(`${f.likelihood}%`, 160, y);
    y += 5;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    const descLines = doc.splitTextToSize(f.description, 170);
    doc.text(descLines, 15, y);
    y += (descLines.length * 4) + 6;
  });

  // --- RECOMMENDATIONS ---
  if (y > 230) { doc.addPage(); y = 20; }
  y += 10;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL RECOMMENDATIONS', 15, y);
  y += 6;
  separator(y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  
  const allRecs = [...result.findings[0].recommendations, ...result.general_recommendations];
  allRecs.forEach((r) => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.setFillColor(13, 148, 136);
    doc.circle(18, y-1, 0.8, 'F');
    doc.text(r, 22, y);
    y += 6;
  });

  // --- FOOTER SECTION ---
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  const disclaimer = "LEGAL DISCLAIMER: This report is a computational analysis generated by ClariEye AI's deep neural networks. It provides clinical decision support and screening insights only. It is NOT a final medical diagnosis. A licensed ophthalmologist must review all findings and high-resolution scans before initiating patient treatment. ClariEye and its creators are not liable for autonomous diagnostic interpretations.";
  const discLines = doc.splitTextToSize(disclaimer, 180);
  doc.text(discLines, 15, 280);
  
  doc.text(`Generated on ${timestamp} via Clinical Core v2.0-SECURE`, 105, 292, { align: 'center' });

  // Save the PDF
  const filename = `ClariEye_Report_${new Date().toISOString().split('T')[0]}_${reportId.slice(0,5)}.pdf`;
  doc.save(filename);
}
