const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments } = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getAppointments);

module.exports = router;
