const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, uploadProfilePicture, getPatientById } = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Patient's own profile
router.get('/profile', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateMyProfile);
router.post('/profile/picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);

// Get patient by ID (for doctors)
router.get('/:patientId', verifyToken, getPatientById);

module.exports = router;
