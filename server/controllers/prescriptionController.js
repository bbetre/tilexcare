const { Prescription, Consultation, Appointment, DoctorProfile, PatientProfile } = require('../models');
const { Op } = require('sequelize');

// Get prescriptions for patient
const getMyPrescriptions = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;

        let prescriptions;

        if (role === 'patient') {
            const patient = await PatientProfile.findOne({ where: { userId } });
            if (!patient) return res.json([]);

            prescriptions = await Prescription.findAll({
                where: { patientId: patient.id },
                include: [
                    {
                        model: DoctorProfile,
                        attributes: ['fullName', 'specialization']
                    },
                    {
                        model: Consultation,
                        attributes: ['diagnosis', 'notes']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
        } else if (role === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor) return res.json([]);

            prescriptions = await Prescription.findAll({
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
        } else {
            return res.json([]);
        }

        res.json(prescriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

module.exports = { getMyPrescriptions, getPrescriptionById, createPrescription };
