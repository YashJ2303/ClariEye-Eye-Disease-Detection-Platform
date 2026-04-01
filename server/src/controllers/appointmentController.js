const prisma = require('../utils/prisma');

const createAppointment = async (req, res) => {
  try {
    const { patientId, date, notes } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: req.user.id,
        date: new Date(date),
        notes
      }
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: req.user.id },
      include: { patient: true },
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createAppointment, getAppointments };
