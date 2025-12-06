const express = require('express');
const router = express.Router();
const { getMyPrescriptions, getPrescriptionById, createPrescription } = require('../controllers/prescriptionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getMyPrescriptions);
router.get('/:id', verifyToken, getPrescriptionById);
router.post('/', verifyToken, createPrescription);

module.exports = router;
