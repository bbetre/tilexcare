const express = require('express');
const router = express.Router();
const { getPendingDoctors, verifyDoctor } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/doctors/pending', [verifyToken, isAdmin], getPendingDoctors);
router.patch('/doctors/:id/verify', [verifyToken, isAdmin], verifyDoctor);

module.exports = router;
