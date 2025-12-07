const { Transaction, DoctorProfile, Appointment, PatientProfile, Availability } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get doctor earnings summary
const getEarningsSummary = async (req, res) => {
    try {
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Total earnings
        const totalEarnings = await Transaction.sum('doctorEarning', {
            where: {
                doctorId: doctor.id,
                status: 'completed'
            }
        }) || 0;

        // This month earnings
        const monthlyEarnings = await Transaction.sum('doctorEarning', {
            where: {
                doctorId: doctor.id,
                status: 'completed',
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        // This week earnings
        const weeklyEarnings = await Transaction.sum('doctorEarning', {
            where: {
                doctorId: doctor.id,
                status: 'completed',
                createdAt: { [Op.gte]: startOfWeek }
            }
        }) || 0;

        // Pending payouts
        const pendingPayouts = await Transaction.sum('doctorEarning', {
            where: {
                doctorId: doctor.id,
                status: 'pending'
            }
        }) || 0;

        // Total consultations
        const totalConsultations = await Transaction.count({
            where: {
                doctorId: doctor.id,
                status: 'completed'
            }
        });

        res.json({
            totalEarnings,
            monthlyEarnings,
            weeklyEarnings,
            pendingPayouts,
            totalConsultations,
            consultationFee: doctor.consultationFee || 500
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20 } = req.query;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const offset = (page - 1) * limit;

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where: { doctorId: doctor.id },
            include: [
                {
                    model: Appointment,
                    include: [
                        {
                            model: PatientProfile,
                            attributes: ['fullName']
                        },
                        {
                            model: Availability,
                            attributes: ['date', 'startTime']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            transactions,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get earnings by period (for charts)
const getEarningsByPeriod = async (req, res) => {
    try {
        const userId = req.userId;
        const { period = 'month' } = req.query; // week, month, year

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        let startDate;
        const now = new Date();

        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const transactions = await Transaction.findAll({
            where: {
                doctorId: doctor.id,
                status: 'completed',
                createdAt: { [Op.gte]: startDate }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('doctorEarning')), 'earnings'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'consultations']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getEarningsSummary, getTransactionHistory, getEarningsByPeriod };
