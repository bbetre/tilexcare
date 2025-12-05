const express = require('express');
const router = express.Router();
const { setAvailability, getDoctorAvailability, getAllDoctors } = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/availability', verifyToken, setAvailability);
router.get('/:doctorId/availability', getDoctorAvailability);
router.get('/', getAllDoctors);

module.exports = router;
