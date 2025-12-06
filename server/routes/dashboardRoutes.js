const express = require('express');
const router = express.Router();
const { getDashboardStats, getPatientDashboard, getDoctorDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Legacy route
router.get('/stats', verifyToken, getDashboardStats);

// Role-specific dashboard routes
router.get('/patient', verifyToken, getPatientDashboard);
router.get('/doctor', verifyToken, getDoctorDashboard);
router.get('/admin', verifyToken, isAdmin, getAdminDashboard);

module.exports = router;
