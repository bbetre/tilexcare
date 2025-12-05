const express = require('express');
const router = express.Router();
const { generateSignature } = require('../controllers/zoomController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:appointmentId/signature', verifyToken, generateSignature);

module.exports = router;
