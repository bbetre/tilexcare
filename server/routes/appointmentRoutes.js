const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments } = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/book', verifyToken, bookAppointment);
router.get('/my-appointments', verifyToken, getMyAppointments);

module.exports = router;
