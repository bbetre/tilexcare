const express = require('express');
const router = express.Router();
const { saveConsultation, getConsultation } = require('../controllers/consultationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/:appointmentId', verifyToken, saveConsultation);
router.get('/:appointmentId', verifyToken, getConsultation);

module.exports = router;
