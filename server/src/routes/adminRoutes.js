const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/logs', authenticateToken, getAuditLogs);

module.exports = router;
