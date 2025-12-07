const { Prescription, Consultation, Appointment, DoctorProfile, PatientProfile } = require('../models');
const { Op } = require('sequelize');

// Get prescriptions for patient
const getMyPrescriptions = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;

        let prescriptions = [];

        if (role === 'patient') {
            const patient = await PatientProfile.findOne({ where: { userId } });
            if (!patient) return res.json([]);

            prescriptions = await Prescription.findAll({
                where: { patientId: patient.id },
                include: [
                    {
                        model: DoctorProfile,
                        attributes: ['fullName', 'specialization'],
                        required: false
                    },
                    {
                        model: Consultation,
                        attributes: ['diagnosis', 'notes'],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Format for frontend
            const formatted = prescriptions.map(rx => ({
                id: rx.id,
                doctorName: rx.DoctorProfile?.fullName || 'Unknown Doctor',
                specialty: rx.DoctorProfile?.specialization || 'General',
                diagnosis: rx.diagnosis || rx.Consultation?.diagnosis || 'Not specified',
                medications: rx.medications || [],
                notes: rx.notes || rx.Consultation?.notes || '',
                date: rx.createdAt?.toISOString().split('T')[0],
                validUntil: rx.validUntil,
                status: rx.validUntil && new Date(rx.validUntil) > new Date() ? 'active' : 'expired'
            }));

            return res.json(formatted);
        } else if (role === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor) return res.json([]);

            prescriptions = await Prescription.findAll({
                where: { doctorId: doctor.id },
                include: [
                    {
                        model: PatientProfile,
                        attributes: ['fullName'],
                        required: false
                    },
                    {
                        model: Consultation,
                        attributes: ['diagnosis', 'notes'],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.json(prescriptions);
        } else {
            return res.json([]);
        }
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single prescription
const getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const role = req.userRole;

        const prescription = await Prescription.findByPk(id, {
            include: [
                {
                    model: DoctorProfile,
                    attributes: ['fullName', 'specialization', 'licenseNumber']
                },
                {
                    model: PatientProfile,
                    attributes: ['fullName', 'dateOfBirth', 'gender']
                },
                {
                    model: Consultation,
                    attributes: ['diagnosis', 'notes', 'symptoms']
                }
            ]
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Verify access
        if (role === 'patient') {
            const patient = await PatientProfile.findOne({ where: { userId } });
            if (!patient || prescription.patientId !== patient.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        } else if (role === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor || prescription.doctorId !== doctor.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        res.json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create prescription (doctor only)
const createPrescription = async (req, res) => {
    try {
        const userId = req.userId;
        const { consultationId, patientId, diagnosis, medications, notes, validUntil } = req.body;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        if (doctor.verificationStatus !== 'verified') {
            return res.status(403).json({ message: 'Doctor is not verified' });
        }

        const prescription = await Prescription.create({
            consultationId,
            doctorId: doctor.id,
            patientId,
            diagnosis,
            medications,
            notes,
            validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
        });

        res.status(201).json({ message: 'Prescription created successfully', prescription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get doctor's prescriptions (formatted for doctor view)
const getDoctorPrescriptions = async (req, res) => {
    try {
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const prescriptions = await Prescription.findAll({
            where: { doctorId: doctor.id },
            include: [
                {
                    model: PatientProfile,
                    attributes: ['fullName']
                },
                {
                    model: Consultation,
                    attributes: ['diagnosis', 'notes']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Format for frontend
        const formatted = prescriptions.map(rx => ({
            id: rx.id,
            patientName: rx.PatientProfile?.fullName || 'Unknown',
            diagnosis: rx.diagnosis || rx.Consultation?.diagnosis || 'Not specified',
            medications: rx.medications || [],
            notes: rx.notes || rx.Consultation?.notes,
            status: rx.validUntil && new Date(rx.validUntil) > new Date() ? 'active' : 'completed',
            createdAt: rx.createdAt,
            validUntil: rx.validUntil
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get doctor prescriptions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMyPrescriptions, getPrescriptionById, createPrescription, getDoctorPrescriptions };
