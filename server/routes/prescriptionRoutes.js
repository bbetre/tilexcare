const express = require('express');
const router = express.Router();
const { getMyPrescriptions, getPrescriptionById, createPrescription, getDoctorPrescriptions } = require('../controllers/prescriptionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getMyPrescriptions);
router.get('/doctor', verifyToken, getDoctorPrescriptions);
router.get('/:id', verifyToken, getPrescriptionById);
router.post('/', verifyToken, createPrescription);

module.exports = router;
