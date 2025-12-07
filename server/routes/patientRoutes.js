const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getPatientById } = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');

// Patient's own profile
router.get('/profile', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateMyProfile);

// Get patient by ID (for doctors)
router.get('/:patientId', verifyToken, getPatientById);

module.exports = router;
