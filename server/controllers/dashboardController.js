const { User, DoctorProfile, PatientProfile, Appointment, Availability, Consultation, Transaction, Prescription } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ==================== PATIENT DASHBOARD ====================
const getPatientDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        const patient = await PatientProfile.findOne({ where: { userId } });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Next upcoming appointment
        const nextAppointment = await Appointment.findOne({
            where: {
                patientId: patient.id,
                status: 'confirmed'
            },
            include: [
                {
                    model: DoctorProfile,
                    attributes: ['id', 'fullName', 'specialization', 'consultationFee']
                },
                {
                    model: Availability,
                    where: { date: { [Op.gte]: today } },
                    attributes: ['date', 'startTime', 'endTime']
                }
            ],
            order: [[Availability, 'date', 'ASC'], [Availability, 'startTime', 'ASC']]
        });

        // Recent consultations (last 5)
        const recentConsultations = await Appointment.findAll({
            where: {
                patientId: patient.id,
                status: 'completed'
            },
            include: [
                {
                    model: DoctorProfile,
                    attributes: ['fullName', 'specialization']
                },
                {
                    model: Availability,
                    attributes: ['date']
                },
                {
                    model: Consultation,
                    attributes: ['diagnosis', 'prescription']
                }
            ],
            order: [[Availability, 'date', 'DESC']],
            limit: 5
        });

        // Stats
        const totalAppointments = await Appointment.count({ where: { patientId: patient.id } });
        const completedAppointments = await Appointment.count({ 
            where: { patientId: patient.id, status: 'completed' } 
        });

        res.json({
            patient: {
                id: patient.id,
                fullName: patient.fullName
            },
            nextAppointment: nextAppointment ? {
                id: nextAppointment.id,
                doctorName: nextAppointment.DoctorProfile?.fullName,
                specialty: nextAppointment.DoctorProfile?.specialization,
                date: nextAppointment.Availability?.date,
                startTime: nextAppointment.Availability?.startTime,
                endTime: nextAppointment.Availability?.endTime,
                status: nextAppointment.status
            } : null,
            recentConsultations: recentConsultations.map(apt => ({
                id: apt.id,
                doctor: apt.DoctorProfile?.fullName,
                specialty: apt.DoctorProfile?.specialization,
                date: apt.Availability?.date,
                diagnosis: apt.Consultation?.diagnosis || 'N/A',
                hasPrescription: !!apt.Consultation?.prescription
            })),
            stats: {
                totalAppointments,
                completedAppointments
            }
        });
    } catch (error) {
        console.error('Patient dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== DOCTOR DASHBOARD ====================
const getDoctorDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        const doctor = await DoctorProfile.findOne({ where: { userId } });
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's appointments
        const todayAppointments = await Appointment.findAll({
            where: {
                doctorId: doctor.id,
                status: { [Op.in]: ['confirmed', 'completed'] }
            },
            include: [
                {
                    model: PatientProfile,
                    attributes: ['id', 'fullName']
                },
                {
                    model: Availability,
                    where: {
                        date: { [Op.gte]: today, [Op.lt]: tomorrow }
                    },
                    attributes: ['date', 'startTime', 'endTime']
                }
            ],
            order: [[Availability, 'startTime', 'ASC']]
        });

        // Upcoming appointments (next 7 days, excluding today)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingAppointments = await Appointment.findAll({
            where: {
                doctorId: doctor.id,
                status: 'confirmed'
            },
            include: [
                {
                    model: PatientProfile,
                    attributes: ['id', 'fullName']
                },
                {
                    model: Availability,
                    where: {
                        date: { [Op.gte]: tomorrow, [Op.lt]: nextWeek }
                    },
                    attributes: ['date', 'startTime', 'endTime']
                }
            ],
            order: [[Availability, 'date', 'ASC'], [Availability, 'startTime', 'ASC']],
            limit: 10
        });

        // Earnings this month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyEarnings = await Transaction.sum('doctorEarning', {
            where: {
                doctorId: doctor.id,
                status: 'completed',
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        // Total earnings
        const totalEarnings = await Transaction.sum('doctorEarning', {
            where: {
                doctorId: doctor.id,
                status: 'completed'
            }
        }) || 0;

        // Stats
        const totalPatients = await Appointment.count({
            where: { doctorId: doctor.id },
            distinct: true,
            col: 'patientId'
        });

        const totalAppointments = await Appointment.count({ where: { doctorId: doctor.id } });
        const completedAppointments = await Appointment.count({ 
            where: { doctorId: doctor.id, status: 'completed' } 
        });

        // Recent prescriptions
        const recentPrescriptions = await Prescription.findAll({
            where: { doctorId: doctor.id },
            include: [{
                model: PatientProfile,
                attributes: ['fullName']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            doctor: {
                id: doctor.id,
                fullName: doctor.fullName,
                specialization: doctor.specialization,
                verificationStatus: doctor.verificationStatus,
                consultationFee: doctor.consultationFee
            },
            todayAppointments: todayAppointments.map(apt => ({
                id: apt.id,
                patientName: apt.PatientProfile?.fullName,
                patientId: apt.PatientProfile?.id,
                date: apt.Availability?.date,
                startTime: apt.Availability?.startTime,
                endTime: apt.Availability?.endTime,
                status: apt.status
            })),
            upcomingAppointments: upcomingAppointments.map(apt => ({
                id: apt.id,
                patientName: apt.PatientProfile?.fullName,
                patientId: apt.PatientProfile?.id,
                date: apt.Availability?.date,
                startTime: apt.Availability?.startTime,
                endTime: apt.Availability?.endTime,
                status: apt.status
            })),
            earnings: {
                thisMonth: parseFloat(monthlyEarnings),
                total: parseFloat(totalEarnings)
            },
            stats: {
                totalPatients,
                totalAppointments,
                completedAppointments,
                todayCount: todayAppointments.length
            },
            recentPrescriptions: recentPrescriptions.map(rx => ({
                id: rx.id,
                patientName: rx.PatientProfile?.fullName,
                diagnosis: rx.diagnosis,
                date: rx.createdAt
            }))
        });
    } catch (error) {
        console.error('Doctor dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== ADMIN DASHBOARD ====================
const getAdminDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        // User counts
        const totalDoctors = await DoctorProfile.count();
        const verifiedDoctors = await DoctorProfile.count({ where: { verificationStatus: 'verified' } });
        const pendingDoctors = await DoctorProfile.count({ where: { verificationStatus: 'pending' } });
        const totalPatients = await PatientProfile.count();

        // Appointment stats
        const totalAppointments = await Appointment.count();
        const completedAppointments = await Appointment.count({ where: { status: 'completed' } });
        const todayAppointments = await Appointment.count({
            include: [{
                model: Availability,
                where: { date: today }
            }]
        });

        // Revenue stats
        const totalRevenue = await Transaction.sum('amount', { where: { status: 'completed' } }) || 0;
        const monthlyRevenue = await Transaction.sum('amount', {
            where: {
                status: 'completed',
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;
        const platformFees = await Transaction.sum('platformFee', { where: { status: 'completed' } }) || 0;

        // Pending verifications list
        const pendingVerifications = await DoctorProfile.findAll({
            where: { verificationStatus: 'pending' },
            include: [{ model: User, attributes: ['email', 'createdAt'] }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Recent activity (recent appointments)
        const recentActivity = await Appointment.findAll({
            include: [
                { model: PatientProfile, attributes: ['fullName'] },
                { model: DoctorProfile, attributes: ['fullName'] },
                { model: Availability, attributes: ['date', 'startTime'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            stats: {
                totalDoctors,
                verifiedDoctors,
                pendingDoctors,
                totalPatients,
                totalAppointments,
                completedAppointments,
                todayAppointments
            },
            revenue: {
                total: parseFloat(totalRevenue),
                monthly: parseFloat(monthlyRevenue),
                platformFees: parseFloat(platformFees)
            },
            pendingVerifications: pendingVerifications.map(doc => ({
                id: doc.id,
                fullName: doc.fullName,
                specialization: doc.specialization,
                licenseNumber: doc.licenseNumber,
                email: doc.User?.email,
                appliedAt: doc.createdAt
            })),
            recentActivity: recentActivity.map(apt => ({
                id: apt.id,
                type: 'appointment',
                patient: apt.PatientProfile?.fullName,
                doctor: apt.DoctorProfile?.fullName,
                date: apt.Availability?.date,
                time: apt.Availability?.startTime,
                status: apt.status,
                createdAt: apt.createdAt
            }))
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Legacy endpoint for backwards compatibility
const getDashboardStats = async (req, res) => {
    const role = req.userRole;
    
    if (role === 'admin') {
        return getAdminDashboard(req, res);
    } else if (role === 'doctor') {
        return getDoctorDashboard(req, res);
    } else if (role === 'patient') {
        return getPatientDashboard(req, res);
    }
    
    res.status(400).json({ message: 'Invalid role' });
};

module.exports = { 
    getDashboardStats,
    getPatientDashboard,
    getDoctorDashboard,
    getAdminDashboard
};
