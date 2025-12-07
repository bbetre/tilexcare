const express = require('express');
const router = express.Router();
const { setAvailability, getDoctorAvailability, getAllDoctors, getMyPatients, getMyProfile, updateMyProfile } = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/availability', verifyToken, setAvailability);
router.get('/patients', verifyToken, getMyPatients);
router.get('/profile', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateMyProfile);
router.get('/:doctorId/availability', getDoctorAvailability);
router.get('/', getAllDoctors);

module.exports = router;
