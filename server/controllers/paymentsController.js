const { Transaction, DoctorProfile, PatientProfile, Appointment, Availability, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get admin payments overview
const getPaymentsOverview = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total revenue (all completed transactions)
        const totalRevenue = await Transaction.sum('amount', {
            where: { status: 'completed' }
        }) || 0;

        // Monthly revenue
        const monthlyRevenue = await Transaction.sum('amount', {
            where: {
                status: 'completed',
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        // Platform fees collected
        const platformFee = await Transaction.sum('platformFee', {
            where: { status: 'completed' }
        }) || 0;

        // Pending payouts (pending transactions)
        const pendingPayouts = await Transaction.sum('doctorEarning', {
            where: { status: 'pending' }
        }) || 0;

        // Get all transactions with details
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: Appointment,
                    include: [
                        { model: PatientProfile, attributes: ['fullName'] },
                        { model: DoctorProfile, attributes: ['fullName'] },
                        { model: Availability, attributes: ['date'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        // Format transactions for frontend
        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            patient: t.Appointment?.PatientProfile?.fullName || 'Unknown',
            doctor: t.Appointment?.DoctorProfile?.fullName || 'Unknown',
            amount: parseFloat(t.amount || 0),
            fee: parseFloat(t.platformFee || 0),
            doctorEarning: parseFloat(t.doctorEarning || 0),
            date: t.Appointment?.Availability?.date || t.createdAt?.toISOString().split('T')[0],
            status: t.status,
            method: t.paymentMethod || 'chapa',
            transactionRef: t.transactionRef
        }));

        // Get doctor payouts (aggregated earnings per doctor)
        const doctorPayouts = await Transaction.findAll({
            attributes: [
                'doctorId',
                [sequelize.fn('SUM', sequelize.col('doctorEarning')), 'totalEarnings'],
                [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'transactionCount']
            ],
            where: { status: 'completed' },
            group: ['Transaction.doctorId', 'DoctorProfile.id', 'DoctorProfile.fullName'],
            include: [{
                model: DoctorProfile,
                attributes: ['id', 'fullName']
            }]
        });

        const formattedPayouts = doctorPayouts.map(p => ({
            id: p.doctorId,
            doctor: p.DoctorProfile?.fullName || 'Unknown',
            amount: parseFloat(p.dataValues.totalEarnings || 0),
            transactions: parseInt(p.dataValues.transactionCount || 0),
            method: 'Bank Transfer',
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        }));

        res.json({
            stats: {
                totalRevenue,
                monthlyRevenue,
                platformFee,
                pendingPayouts,
                refundRequests: 0
            },
            transactions: formattedTransactions,
            payouts: formattedPayouts
        });
    } catch (error) {
        console.error('Payments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get detailed transaction by ID
const getTransactionDetails = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { transactionId } = req.params;

        const transaction = await Transaction.findByPk(transactionId, {
            include: [
                {
                    model: Appointment,
                    include: [
                        { 
                            model: PatientProfile, 
                            attributes: ['fullName', 'phoneNumber'],
                            include: [{ model: User, attributes: ['email'] }]
                        },
                        { 
                            model: DoctorProfile, 
                            attributes: ['fullName', 'specialization', 'consultationFee'],
                            include: [{ model: User, attributes: ['email'] }]
                        },
                        { model: Availability, attributes: ['date', 'startTime', 'endTime'] }
                    ]
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            id: transaction.id,
            amount: parseFloat(transaction.amount || 0),
            platformFee: parseFloat(transaction.platformFee || 0),
            doctorEarning: parseFloat(transaction.doctorEarning || 0),
            status: transaction.status,
            paymentMethod: transaction.paymentMethod || 'chapa',
            transactionRef: transaction.transactionRef,
            createdAt: transaction.createdAt,
            patient: {
                name: transaction.Appointment?.PatientProfile?.fullName || 'Unknown',
                email: transaction.Appointment?.PatientProfile?.User?.email || '-',
                phone: transaction.Appointment?.PatientProfile?.phoneNumber || '-'
            },
            doctor: {
                name: transaction.Appointment?.DoctorProfile?.fullName || 'Unknown',
                email: transaction.Appointment?.DoctorProfile?.User?.email || '-',
                specialty: transaction.Appointment?.DoctorProfile?.specialization || '-',
                fee: transaction.Appointment?.DoctorProfile?.consultationFee || 0
            },
            appointment: {
                date: transaction.Appointment?.Availability?.date || '-',
                time: `${transaction.Appointment?.Availability?.startTime || ''} - ${transaction.Appointment?.Availability?.endTime || ''}`
            }
        });
    } catch (error) {
        console.error('Transaction details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update transaction status (admin only)
const updateTransactionStatus = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { transactionId } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const transaction = await Transaction.findByPk(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.update({ 
            status,
            adminNotes: notes,
            updatedAt: new Date()
        });

        res.json({ message: 'Transaction status updated', transaction });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pending transactions for review
const getPendingTransactions = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const transactions = await Transaction.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: Appointment,
                    include: [
                        { model: PatientProfile, attributes: ['fullName', 'phoneNumber'] },
                        { model: DoctorProfile, attributes: ['fullName', 'specialization'] },
                        { model: Availability, attributes: ['date', 'startTime'] }
                    ]
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        const formatted = transactions.map(t => ({
            id: t.id,
            patient: t.Appointment?.PatientProfile?.fullName || 'Unknown',
            patientPhone: t.Appointment?.PatientProfile?.phoneNumber || '-',
            doctor: t.Appointment?.DoctorProfile?.fullName || 'Unknown',
            doctorSpecialty: t.Appointment?.DoctorProfile?.specialization || '-',
            amount: parseFloat(t.amount || 0),
            platformFee: parseFloat(t.platformFee || 0),
            doctorEarning: parseFloat(t.doctorEarning || 0),
            date: t.Appointment?.Availability?.date || t.createdAt?.toISOString().split('T')[0],
            time: t.Appointment?.Availability?.startTime || '-',
            status: t.status,
            method: t.paymentMethod || 'chapa',
            transactionRef: t.transactionRef,
            createdAt: t.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get pending transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Process doctor payout (admin only)
const processDoctorPayout = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { doctorId } = req.params;
        const { payoutMethod, payoutReference, notes } = req.body;

        const doctor = await DoctorProfile.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get all completed transactions for this doctor that haven't been paid out
        const pendingPayouts = await Transaction.findAll({
            where: {
                doctorId,
                status: 'completed',
                payoutStatus: { [Op.or]: [null, 'pending'] }
            }
        });

        if (pendingPayouts.length === 0) {
            return res.status(400).json({ message: 'No pending payouts for this doctor' });
        }

        const totalAmount = pendingPayouts.reduce((sum, t) => sum + parseFloat(t.doctorEarning || 0), 0);

        // Update all transactions as paid out
        await Transaction.update(
            { 
                payoutStatus: 'paid',
                payoutDate: new Date(),
                payoutMethod,
                payoutReference,
                payoutNotes: notes
            },
            {
                where: {
                    id: { [Op.in]: pendingPayouts.map(t => t.id) }
                }
            }
        );

        res.json({ 
            message: 'Payout processed successfully',
            doctor: doctor.fullName,
            amount: totalAmount,
            transactionCount: pendingPayouts.length,
            payoutReference
        });
    } catch (error) {
        console.error('Process payout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get doctor payout details
const getDoctorPayoutDetails = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { doctorId } = req.params;

        const doctor = await DoctorProfile.findByPk(doctorId, {
            include: [{ model: User, attributes: ['email'] }]
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get pending payouts
        const pendingTransactions = await Transaction.findAll({
            where: {
                doctorId,
                status: 'completed',
                payoutStatus: { [Op.or]: [null, 'pending'] }
            },
            include: [{
                model: Appointment,
                include: [
                    { model: PatientProfile, attributes: ['fullName'] },
                    { model: Availability, attributes: ['date'] }
                ]
            }],
            order: [['createdAt', 'DESC']]
        });

        // Get paid out transactions
        const paidTransactions = await Transaction.findAll({
            where: {
                doctorId,
                payoutStatus: 'paid'
            },
            order: [['payoutDate', 'DESC']],
            limit: 20
        });

        const pendingAmount = pendingTransactions.reduce((sum, t) => sum + parseFloat(t.doctorEarning || 0), 0);
        const paidAmount = paidTransactions.reduce((sum, t) => sum + parseFloat(t.doctorEarning || 0), 0);

        res.json({
            doctor: {
                id: doctor.id,
                name: doctor.fullName,
                email: doctor.User?.email || '-',
                specialty: doctor.specialization,
                bankName: doctor.bankName || '-',
                bankAccount: doctor.bankAccount || '-'
            },
            pendingPayout: {
                amount: pendingAmount,
                transactionCount: pendingTransactions.length,
                transactions: pendingTransactions.map(t => ({
                    id: t.id,
                    patient: t.Appointment?.PatientProfile?.fullName || 'Unknown',
                    date: t.Appointment?.Availability?.date || '-',
                    amount: parseFloat(t.doctorEarning || 0),
                    createdAt: t.createdAt
                }))
            },
            paidPayouts: {
                totalPaid: paidAmount,
                recentPayouts: paidTransactions.map(t => ({
                    id: t.id,
                    amount: parseFloat(t.doctorEarning || 0),
                    payoutDate: t.payoutDate,
                    payoutMethod: t.payoutMethod,
                    payoutReference: t.payoutReference
                }))
            }
        });
    } catch (error) {
        console.error('Get doctor payout details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bulk update transaction statuses
const bulkUpdateTransactions = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { transactionIds, status, notes } = req.body;

        if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
            return res.status(400).json({ message: 'Transaction IDs required' });
        }

        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await Transaction.update(
            { 
                status,
                adminNotes: notes,
                updatedAt: new Date()
            },
            {
                where: { id: { [Op.in]: transactionIds } }
            }
        );

        res.json({ 
            message: `${transactionIds.length} transactions updated to ${status}`,
            count: transactionIds.length
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    getPaymentsOverview, 
    getTransactionDetails,
    updateTransactionStatus,
    getPendingTransactions,
    processDoctorPayout,
    getDoctorPayoutDetails,
    bulkUpdateTransactions
};
