const express = require('express');
const router = express.Router();
const { 
    setAvailability, 
    getDoctorAvailability, 
    getAllDoctors, 
    getMyPatients, 
    getMyProfile, 
    updateMyProfile,
    getMyAvailability,
    deleteAvailability
} = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');

// Static routes MUST come before parameterized routes
// Doctor's own routes (authenticated)
router.get('/availability', verifyToken, getMyAvailability);
router.post('/availability', verifyToken, setAvailability);
router.delete('/availability/:slotId', verifyToken, deleteAvailability);
router.get('/patients', verifyToken, getMyPatients);
router.get('/profile', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateMyProfile);

// Public routes - list all doctors
router.get('/', getAllDoctors);

// Parameterized routes MUST come last
router.get('/:doctorId/availability', getDoctorAvailability);

module.exports = router;
