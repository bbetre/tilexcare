const { Appointment, DoctorProfile, PatientProfile, Transaction, Availability, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get analytics data
const getAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Total appointments
        const totalAppointments = await Appointment.count();
        
        // Completed appointments
        const completedAppointments = await Appointment.count({
            where: { status: 'completed' }
        });
        
        // Completion rate
        const completionRate = totalAppointments > 0 
            ? Math.round((completedAppointments / totalAppointments) * 100) 
            : 0;

        // Total revenue
        const totalRevenue = await Transaction.sum('amount', {
            where: { status: 'completed' }
        }) || 0;

        // Average revenue per appointment
        const revenuePerAppointment = completedAppointments > 0 
            ? Math.round(totalRevenue / completedAppointments) 
            : 0;

        // Active doctors count
        const activeDoctors = await DoctorProfile.count({
            where: { verificationStatus: 'verified' }
        });

        // Total patients
        const totalPatients = await PatientProfile.count();

        // Get specialty stats
        const specialtyStats = await DoctorProfile.findAll({
            where: { verificationStatus: 'verified' },
            attributes: [
                'specialization',
                [sequelize.fn('COUNT', sequelize.col('DoctorProfile.id')), 'doctorCount']
            ],
            group: ['specialization'],
            raw: true
        });

        // Get appointments per specialty
        const specialtyData = [];
        for (const spec of specialtyStats) {
            const doctors = await DoctorProfile.findAll({
                where: { 
                    specialization: spec.specialization,
                    verificationStatus: 'verified'
                },
                attributes: ['id']
            });
            const doctorIds = doctors.map(d => d.id);
            
            const appointments = await Appointment.count({
                where: { doctorId: { [Op.in]: doctorIds } }
            });
            
            const revenue = await Transaction.sum('amount', {
                where: { 
                    doctorId: { [Op.in]: doctorIds },
                    status: 'completed'
                }
            }) || 0;

            specialtyData.push({
                name: spec.specialization || 'General',
                appointments,
                revenue,
                doctors: parseInt(spec.doctorCount)
            });
        }

        // Sort by appointments
        specialtyData.sort((a, b) => b.appointments - a.appointments);

        // Top performing doctors
        const topDoctors = await DoctorProfile.findAll({
            where: { verificationStatus: 'verified' },
            attributes: ['id', 'fullName', 'specialization', 'consultationFee'],
            limit: 5
        });

        const topDoctorsData = [];
        for (const doctor of topDoctors) {
            const appointments = await Appointment.count({
                where: { doctorId: doctor.id }
            });
            const revenue = await Transaction.sum('doctorEarning', {
                where: { 
                    doctorId: doctor.id,
                    status: 'completed'
                }
            }) || 0;

            topDoctorsData.push({
                name: doctor.fullName,
                specialty: doctor.specialization,
                appointments,
                rating: 4.8, // Placeholder - would need ratings table
                revenue
            });
        }

        // Sort by appointments
        topDoctorsData.sort((a, b) => b.appointments - a.appointments);

        // Monthly data for last 6 months
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthName = monthStart.toLocaleString('default', { month: 'short' });

            const monthAppointments = await Appointment.count({
                where: {
                    createdAt: {
                        [Op.between]: [monthStart, monthEnd]
                    }
                }
            });

            const monthRevenue = await Transaction.sum('amount', {
                where: {
                    status: 'completed',
                    createdAt: {
                        [Op.between]: [monthStart, monthEnd]
                    }
                }
            }) || 0;

            monthlyData.push({
                month: monthName,
                appointments: monthAppointments,
                revenue: monthRevenue
            });
        }

        res.json({
            metrics: {
                totalAppointments,
                completionRate,
                avgRating: 4.8, // Placeholder
                avgWaitTime: 12, // Placeholder
                conversionRate: 45, // Placeholder
                revenuePerAppointment
            },
            specialtyData: specialtyData.slice(0, 5),
            topDoctors: topDoctorsData.slice(0, 4),
            monthlyData,
            summary: {
                activeDoctors,
                totalPatients,
                specialtiesCount: specialtyStats.length
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAnalytics };
