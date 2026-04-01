const express = require('express');
const router = express.Router();
const { createPatient, getPatients } = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createPatient);
router.get('/', getPatients);

module.exports = router;
