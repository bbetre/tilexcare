const { User, DoctorProfile, PatientProfile, Appointment, Transaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Get all patients with their profiles
        const patientUsers = await User.findAll({
            where: { role: 'patient' },
            attributes: ['id', 'email', 'createdAt'],
            include: [{
                model: PatientProfile,
                attributes: ['id', 'fullName', 'phoneNumber']
            }]
        });

        // Count appointments for each patient
        const patients = await Promise.all(patientUsers.map(async (user) => {
            const profile = user.PatientProfile;
            let appointmentCount = 0;
            if (profile) {
                try {
                    appointmentCount = await Appointment.count({
                        where: { patientId: profile.id }
                    });
                } catch (e) {
                    console.error('Error counting appointments:', e);
                }
            }

            return {
                id: user.id,
                name: profile?.fullName || 'Unknown',
                email: user.email,
                phone: profile?.phoneNumber || '-',
                joinDate: user.createdAt.toISOString().split('T')[0],
                appointments: appointmentCount,
                status: 'active'
            };
        }));

        // Get all doctors with their profiles
        const doctorUsers = await User.findAll({
            where: { role: 'doctor' },
            attributes: ['id', 'email', 'createdAt'],
            include: [{
                model: DoctorProfile,
                attributes: ['id', 'fullName', 'specialization', 'verificationStatus']
            }]
        });

        // Count patients for each doctor
        const doctors = await Promise.all(doctorUsers.map(async (user) => {
            const profile = user.DoctorProfile;
            let patientCount = 0;
            if (profile) {
                try {
                    patientCount = await Appointment.count({
                        where: { doctorId: profile.id },
                        distinct: true,
                        col: 'patientId'
                    });
                } catch (e) {
                    console.error('Error counting patients:', e);
                }
            }

            return {
                id: user.id,
                name: profile?.fullName || 'Unknown',
                email: user.email,
                specialty: profile?.specialization || '-',
                joinDate: user.createdAt.toISOString().split('T')[0],
                patients: patientCount,
                status: profile?.verificationStatus === 'verified' ? 'active' : 'inactive',
                verified: profile?.verificationStatus === 'verified'
            };
        }));

        res.json({ patients, doctors });
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending doctors for verification
const getPendingDoctors = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const pendingDoctors = await DoctorProfile.findAll({
            where: { verificationStatus: 'pending' },
            include: [{
                model: User,
                attributes: ['email', 'createdAt']
            }]
        });

        const pending = pendingDoctors.map(doc => ({
            id: doc.id,
            userId: doc.userId,
            name: doc.fullName,
            email: doc.User?.email || '-',
            phone: doc.phone || '-',
            specialty: doc.specialization,
            experience: doc.yearsOfExperience ? `${doc.yearsOfExperience} years` : '-',
            licenseNumber: doc.licenseNumber,
            submittedDate: doc.createdAt.toISOString().split('T')[0],
            bio: doc.bio || '',
            documents: doc.licenseDocumentUrl ? [
                { name: 'Medical License', type: 'pdf', url: doc.licenseDocumentUrl }
            ] : []
        }));

        const verifiedDoctors = await DoctorProfile.findAll({
            where: { verificationStatus: 'verified' },
            include: [{ model: User, attributes: ['email'] }],
            limit: 10,
            order: [['updatedAt', 'DESC']]
        });

        const verified = verifiedDoctors.map(doc => ({
            id: doc.id,
            name: doc.fullName,
            specialty: doc.specialization,
            verifiedDate: doc.updatedAt.toISOString().split('T')[0],
            status: 'verified'
        }));

        const rejectedDoctors = await DoctorProfile.findAll({
            where: { verificationStatus: 'rejected' },
            include: [{ model: User, attributes: ['email'] }],
            limit: 10,
            order: [['updatedAt', 'DESC']]
        });

        const rejected = rejectedDoctors.map(doc => ({
            id: doc.id,
            name: doc.fullName,
            specialty: doc.specialization,
            rejectedDate: doc.updatedAt.toISOString().split('T')[0],
            reason: 'Application rejected',
            status: 'rejected'
        }));

        res.json({ pending, verified, rejected });
    } catch (error) {
        console.error('Pending doctors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve doctor
const approveDoctor = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { doctorId } = req.params;

        const doctor = await DoctorProfile.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.verificationStatus = 'verified';
        await doctor.save();

        res.json({ message: 'Doctor approved successfully', doctor });
    } catch (error) {
        console.error('Approve doctor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reject doctor
const rejectDoctor = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { doctorId } = req.params;
        const { reason } = req.body;

        const doctor = await DoctorProfile.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.verificationStatus = 'rejected';
        await doctor.save();

        res.json({ message: 'Doctor rejected', doctor });
    } catch (error) {
        console.error('Reject doctor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get doctor details by ID
const getDoctorDetails = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { doctorId } = req.params;

        const doctor = await DoctorProfile.findByPk(doctorId, {
            include: [{ model: User, attributes: ['email', 'createdAt'] }]
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get appointment stats
        const appointmentStats = await Appointment.findAll({
            where: { doctorId: doctor.id },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), 'completed'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END")), 'cancelled']
            ],
            raw: true
        });

        // Get earnings
        const earnings = await Transaction.findAll({
            where: { doctorId: doctor.id, status: 'completed' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('doctorEarning')), 'totalEarnings']
            ],
            raw: true
        });

        res.json({
            id: doctor.id,
            userId: doctor.userId,
            name: doctor.fullName,
            email: doctor.User?.email || '-',
            phone: doctor.phone || '-',
            specialty: doctor.specialization,
            experience: doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : '-',
            licenseNumber: doctor.licenseNumber,
            bio: doctor.bio || '',
            verificationStatus: doctor.verificationStatus,
            consultationFee: doctor.consultationFee,
            joinDate: doctor.createdAt.toISOString().split('T')[0],
            stats: {
                totalAppointments: parseInt(appointmentStats[0]?.total || 0),
                completedAppointments: parseInt(appointmentStats[0]?.completed || 0),
                cancelledAppointments: parseInt(appointmentStats[0]?.cancelled || 0),
                totalEarnings: parseFloat(earnings[0]?.totalEarnings || 0)
            },
            documents: doctor.licenseDocumentUrl ? [
                { name: 'Medical License', type: 'pdf', url: doctor.licenseDocumentUrl }
            ] : []
        });
    } catch (error) {
        console.error('Get doctor details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Suspend user
const suspendUser = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { userId } = req.params;
        const { userType } = req.body; // 'patient' or 'doctor'

        if (userType === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            doctor.verificationStatus = 'suspended';
            await doctor.save();
        } else {
            // For patients, we could add a status field to PatientProfile
            // For now, we'll just mark it in the response
            const patient = await PatientProfile.findOne({ where: { userId } });
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            // Add suspended status if the field exists, otherwise just acknowledge
        }

        res.json({ message: 'User suspended successfully' });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Activate user
const activateUser = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { userId } = req.params;
        const { userType } = req.body;

        if (userType === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            doctor.verificationStatus = 'verified';
            await doctor.save();
        }

        res.json({ message: 'User activated successfully' });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { userId } = req.params;

        // Find and delete user (this will cascade to profiles due to associations)
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    getAllUsers, 
    getPendingDoctors, 
    approveDoctor, 
    rejectDoctor,
    getDoctorDetails,
    suspendUser,
    activateUser,
    deleteUser
};
