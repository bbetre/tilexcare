const { Rating, DoctorProfile, PatientProfile, Appointment, Availability, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Submit a rating for a completed appointment
const submitRating = async (req, res) => {
    try {
        const { appointmentId, rating, review, isAnonymous } = req.body;
        const userId = req.userId;

        // Get patient profile
        const patient = await PatientProfile.findOne({ where: { userId } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        // Verify appointment exists and belongs to this patient
        const appointment = await Appointment.findOne({
            where: {
                id: appointmentId,
                patientId: patient.id,
                status: 'completed'
            }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Completed appointment not found' });
        }

        // Check if already rated
        const existingRating = await Rating.findOne({ where: { appointmentId } });
        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this appointment' });
        }

        // Create rating
        const newRating = await Rating.create({
            doctorId: appointment.doctorId,
            patientId: patient.id,
            appointmentId,
            rating,
            review: review || null,
            isAnonymous: isAnonymous || false
        });

        res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get ratings for a doctor
const getDoctorRatings = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        const ratings = await Rating.findAndCountAll({
            where: { doctorId },
            include: [{
                model: PatientProfile,
                attributes: ['fullName']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Calculate average rating
        const avgResult = await Rating.findOne({
            where: { doctorId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
            ],
            raw: true
        });

        // Format ratings for response
        const formattedRatings = ratings.rows.map(r => ({
            id: r.id,
            rating: r.rating,
            review: r.review,
            patientName: r.isAnonymous ? 'Anonymous' : r.PatientProfile?.fullName,
            isAnonymous: r.isAnonymous,
            createdAt: r.createdAt
        }));

        res.json({
            ratings: formattedRatings,
            totalCount: ratings.count,
            averageRating: parseFloat(avgResult?.averageRating || 0).toFixed(1),
            totalRatings: parseInt(avgResult?.totalRatings || 0)
        });
    } catch (error) {
        console.error('Get doctor ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get doctor profile with ratings
const getDoctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await DoctorProfile.findByPk(doctorId, {
            attributes: [
                'id', 'userId', 'fullName', 'specialization', 'bio', 'consultationFee', 'verificationStatus',
                'phoneNumber', 'qualifications', 'yearsOfExperience', 'languages', 'hospitalAffiliation',
                'education', 'certifications', 'specializations', 'consultationTypes', 'availableForEmergency'
            ],
            include: [{
                model: User,
                attributes: ['email']
            }]
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get rating stats
        const ratingStats = await Rating.findOne({
            where: { doctorId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
            ],
            raw: true
        });

        // Get recent reviews (last 5)
        const recentReviews = await Rating.findAll({
            where: { 
                doctorId,
                review: { [Op.ne]: null }
            },
            include: [{
                model: PatientProfile,
                attributes: ['fullName']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Get completed appointments count
        const completedAppointments = await Appointment.count({
            where: { doctorId, status: 'completed' }
        });

        // Get rating distribution
        const ratingDistribution = await Rating.findAll({
            where: { doctorId },
            attributes: [
                'rating',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['rating'],
            raw: true
        });

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach(r => {
            distribution[r.rating] = parseInt(r.count);
        });

        // Parse JSON fields safely
        const parseJSON = (str) => {
            try {
                return str ? JSON.parse(str) : null;
            } catch {
                return null;
            }
        };

        res.json({
            doctor: {
                id: doctor.id,
                fullName: doctor.fullName,
                specialization: doctor.specialization,
                bio: doctor.bio,
                consultationFee: doctor.consultationFee,
                verificationStatus: doctor.verificationStatus,
                // Contact information
                email: doctor.User?.email || null,
                phoneNumber: doctor.phoneNumber || null,
                // Enhanced fields
                qualifications: parseJSON(doctor.qualifications),
                yearsOfExperience: doctor.yearsOfExperience,
                languages: doctor.languages ? doctor.languages.split(',').map(l => l.trim()) : [],
                hospitalAffiliation: doctor.hospitalAffiliation,
                education: parseJSON(doctor.education),
                certifications: parseJSON(doctor.certifications),
                specializations: parseJSON(doctor.specializations),
                consultationTypes: doctor.consultationTypes ? doctor.consultationTypes.split(',').map(t => t.trim()) : ['video'],
                availableForEmergency: doctor.availableForEmergency
            },
            stats: {
                averageRating: parseFloat(ratingStats?.averageRating || 0).toFixed(1),
                totalRatings: parseInt(ratingStats?.totalRatings || 0),
                completedAppointments,
                ratingDistribution: distribution
            },
            recentReviews: recentReviews.map(r => ({
                id: r.id,
                rating: r.rating,
                review: r.review,
                patientName: r.isAnonymous ? 'Anonymous' : r.PatientProfile?.fullName,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Get doctor profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if patient can rate an appointment
const canRateAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.userId;

        const patient = await PatientProfile.findOne({ where: { userId } });
        if (!patient) {
            return res.json({ canRate: false });
        }

        const appointment = await Appointment.findOne({
            where: {
                id: appointmentId,
                patientId: patient.id,
                status: 'completed'
            }
        });

        if (!appointment) {
            return res.json({ canRate: false });
        }

        const existingRating = await Rating.findOne({ where: { appointmentId } });
        
        res.json({ 
            canRate: !existingRating,
            hasRated: !!existingRating
        });
    } catch (error) {
        console.error('Can rate check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all doctors with their ratings (for listing)
const getDoctorsWithRatings = async (req, res) => {
    try {
        const doctors = await DoctorProfile.findAll({
            where: { 
                verificationStatus: 'verified',
                isAvailable: true  // Only show available doctors
            },
            attributes: ['id', 'fullName', 'specialization', 'bio', 'consultationFee']
        });

        // Get ratings for all doctors
        const doctorIds = doctors.map(d => d.id);
        const ratingsData = await Rating.findAll({
            where: { doctorId: { [Op.in]: doctorIds } },
            attributes: [
                'doctorId',
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
            ],
            group: ['doctorId'],
            raw: true
        });

        // Create a map for quick lookup
        const ratingsMap = {};
        ratingsData.forEach(r => {
            ratingsMap[r.doctorId] = {
                averageRating: parseFloat(r.averageRating || 0).toFixed(1),
                totalRatings: parseInt(r.totalRatings || 0)
            };
        });

        // Combine doctors with their ratings
        const doctorsWithRatings = doctors.map(d => ({
            id: d.id,
            fullName: d.fullName,
            specialization: d.specialization,
            bio: d.bio,
            consultationFee: d.consultationFee,
            rating: ratingsMap[d.id]?.averageRating || '0.0',
            reviewCount: ratingsMap[d.id]?.totalRatings || 0
        }));

        res.json(doctorsWithRatings);
    } catch (error) {
        console.error('Get doctors with ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitRating,
    getDoctorRatings,
    getDoctorProfile,
    canRateAppointment,
    getDoctorsWithRatings
};
