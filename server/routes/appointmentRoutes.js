const express = require('express');
const router = express.Router();
const { 
    bookAppointment, 
    getMyAppointments, 
    cancelAppointment, 
    getAllAppointments,
    getAppointmentDetails,
    updateAppointmentStatus
} = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/book', verifyToken, bookAppointment);
router.get('/', verifyToken, getMyAppointments);
router.get('/all', verifyToken, getAllAppointments); // Admin only
router.get('/my-appointments', verifyToken, getMyAppointments); // Keep for backward compatibility
router.get('/:appointmentId', verifyToken, getAppointmentDetails); // Admin only
router.put('/:appointmentId/cancel', verifyToken, cancelAppointment);
router.put('/:appointmentId/status', verifyToken, updateAppointmentStatus); // Admin only

module.exports = router;
