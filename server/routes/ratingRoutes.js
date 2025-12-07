const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    submitRating,
    getDoctorRatings,
    getDoctorProfile,
    canRateAppointment,
    getDoctorsWithRatings
} = require('../controllers/ratingController');

// Public routes
router.get('/doctors', getDoctorsWithRatings);
router.get('/doctor/:doctorId', getDoctorProfile);
router.get('/doctor/:doctorId/ratings', getDoctorRatings);

// Protected routes (require authentication)
router.post('/', verifyToken, submitRating);
router.get('/can-rate/:appointmentId', verifyToken, canRateAppointment);

module.exports = router;
