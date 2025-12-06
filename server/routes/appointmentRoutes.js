const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, cancelAppointment, getAllAppointments } = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/book', verifyToken, bookAppointment);
router.get('/', verifyToken, getMyAppointments);
router.get('/all', verifyToken, getAllAppointments); // Admin only
router.get('/my-appointments', verifyToken, getMyAppointments); // Keep for backward compatibility
router.put('/:appointmentId/cancel', verifyToken, cancelAppointment);

module.exports = router;
