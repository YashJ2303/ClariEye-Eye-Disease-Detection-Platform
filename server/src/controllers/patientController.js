const prisma = require('../utils/prisma');

const createPatient = async (req, res) => {
  try {
    const { name, age, eye } = req.body;
    const patient = await prisma.patient.create({
      data: { name, age: parseInt(age), eye, userId: req.user.id }
    });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { scans: true }
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createPatient, getPatients };
