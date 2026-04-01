const express = require('express');
const router = express.Router();
const { getScanById, analyzeScan, updateScan, submitFeedback } = require('../controllers/scanController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/:id', getScanById);
router.post('/analyze', analyzeScan);
router.patch('/:id', updateScan);
router.post('/:id/feedback', authenticateToken, submitFeedback);

module.exports = router;
