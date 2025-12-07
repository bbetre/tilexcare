const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getPendingDoctors, 
    approveDoctor, 
    rejectDoctor,
    getDoctorDetails,
    suspendUser,
    activateUser,
    deleteUser
} = require('../controllers/usersController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllUsers);
router.get('/verification', verifyToken, getPendingDoctors);
router.get('/doctor/:doctorId', verifyToken, getDoctorDetails);
router.put('/verification/:doctorId/approve', verifyToken, approveDoctor);
router.put('/verification/:doctorId/reject', verifyToken, rejectDoctor);
router.put('/:userId/suspend', verifyToken, suspendUser);
router.put('/:userId/activate', verifyToken, activateUser);
router.delete('/:userId', verifyToken, deleteUser);

module.exports = router;
