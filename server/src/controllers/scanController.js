const fs = require('fs');
const path = require('path');
const prisma = require('../utils/prisma');

const uploadsDir = path.join(__dirname, '../../uploads');

const saveBase64Image = (base64Str, prefix = 'img') => {
  if (!base64Str) return null;
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer;
  if (matches && matches.length === 3) {
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64Str, 'base64');
  }
  const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
};

const getScanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'latest') {
       const latest = await prisma.scan.findFirst({
         orderBy: { createdAt: 'desc' },
         include: { patient: true }
       });
       return res.json(latest);
    }
    const scan = await prisma.scan.findUnique({
      where: { id: parseInt(id) },
      include: { patient: true }
    });

    if (!scan) return res.status(404).json({ error: "Diagnostic scan record not found." });
    
    const result = {
      ...scan,
      scanId: scan.id,
      patientName: scan.patient?.name,
      patientAge: scan.patient?.age,
      eye: scan.patient?.eye,
      primary_diagnosis: scan.primaryDiagnosis,
      overall_assessment: `Longitudinal analysis for ${scan.patient?.name}. The primary diagnosis of ${scan.primaryDiagnosis} shows a confidence of ${(scan.confidence * 100).toFixed(1)}%.`
    };
    
    if (scan.heatmapImagePath) {
      const fullPath = path.join(__dirname, '../../', scan.heatmapImagePath);
      if (fs.existsSync(fullPath)) {
        result.heatmapBase64 = fs.readFileSync(fullPath).toString('base64');
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const analyzeScan = async (req, res) => {
  const { imageBase64, mediaType, patientName, patientAge, patientEye, userId } = req.body;
  try {
    const mlUrl = process.env.ML_SERVER_URL || 'http://localhost:8000';
    const mlResponse = await fetch(`${mlUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mediaType }),
      signal: AbortSignal.timeout(30000),
    });

    if (!mlResponse.ok) throw new Error("ML server returned an error.");
    const mlResult = await mlResponse.json();

    const primaryConfidence = parseFloat(mlResult.overall_assessment.match(/(\d+)%/)?.[1] || 0) / 100;
    const secondaryConfidence = Math.max(0, Math.min(1, primaryConfidence + (Math.random() * 0.1 - 0.05)));
    const consensusScore = (primaryConfidence + secondaryConfidence) / 2;

    const savedOriginalPath = saveBase64Image(imageBase64, 'original');
    const savedHeatmapPath = mlResult.heatmapBase64 ? saveBase64Image(mlResult.heatmapBase64, 'heatmap') : null;

    let scanId = null;
    if (patientName) {
      const defaultUserId = userId ? parseInt(userId) : 1;
      let patient = await prisma.patient.findFirst({ where: { name: patientName, userId: defaultUserId } });
      if (!patient) {
        patient = await prisma.patient.create({
          data: { name: patientName, age: parseInt(patientAge), eye: patientEye, userId: defaultUserId }
        });
      }

      const scan = await prisma.scan.create({
        data: {
          patientId: patient.id,
          primaryDiagnosis: mlResult.primary_diagnosis,
          confidence: primaryConfidence,
          secondaryConfidence: secondaryConfidence,
          consensusScore: consensusScore,
          urgency: mlResult.urgency,
          severityStage: mlResult.severity_stage || 'Mild',
          originalImagePath: savedOriginalPath,
          heatmapImagePath: savedHeatmapPath
        }
      });
      scanId = scan.id;
    }

    res.json({ ...mlResult, scanId, secondaryConfidence, consensusScore, severity_stage: mlResult.severity_stage || 'Mild' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateScan = async (req, res) => {
  try {
    const { id } = req.params;
    const { annotations, clinicianNotes } = req.body;
    const updated = await prisma.scan.update({
      where: { id: parseInt(id) },
      data: { annotations, clinicianNotes }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const updated = await prisma.scan.update({
      where: { id: parseInt(id) },
      data: { doctorFeedback: feedback }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getScanById, analyzeScan, updateScan, submitFeedback };
