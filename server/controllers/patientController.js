const { PatientProfile, User } = require('../models');
const path = require('path');
const fs = require('fs');

// Get patient's own profile
const getMyProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const patient = await PatientProfile.findOne({
            where: { userId },
            include: [{ model: User, attributes: ['email'] }]
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        res.json({
            id: patient.id,
            fullName: patient.fullName,
            email: patient.User?.email || '',
            phoneNumber: patient.phoneNumber || '',
            dateOfBirth: patient.dateOfBirth || '',
            gender: patient.gender || '',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || '',
            bloodType: patient.bloodType || '',
            allergies: patient.allergies || '',
            chronicConditions: patient.chronicConditions || '',
            currentMedications: patient.currentMedications || '',
            previousSurgeries: patient.previousSurgeries || '',
            profilePictureUrl: patient.profilePictureUrl || ''
        });
    } catch (error) {
        console.error('Get patient profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update patient's own profile
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            fullName,
            phoneNumber,
            dateOfBirth,
            gender,
            address,
            emergencyContact,
            bloodType,
            allergies,
            chronicConditions,
            currentMedications,
            previousSurgeries
        } = req.body;

        const patient = await PatientProfile.findOne({ where: { userId } });

        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        // Update fields - handle empty strings
        if (fullName !== undefined && fullName !== '') patient.fullName = fullName;
        if (phoneNumber !== undefined) patient.phoneNumber = phoneNumber || null;
        if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth || null;
        if (gender !== undefined) patient.gender = gender || null;
        if (address !== undefined) patient.address = address || null;
        if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact || null;
        if (bloodType !== undefined) patient.bloodType = bloodType || null;
        if (allergies !== undefined) patient.allergies = allergies || null;
        if (chronicConditions !== undefined) patient.chronicConditions = chronicConditions || null;
        if (currentMedications !== undefined) patient.currentMedications = currentMedications || null;
        if (previousSurgeries !== undefined) patient.previousSurgeries = previousSurgeries || null;

        await patient.save();

        res.json({ message: 'Profile updated successfully', patient });
    } catch (error) {
        console.error('Update patient profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.userId;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const patient = await PatientProfile.findOne({ where: { userId } });

        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        // Delete old profile picture if exists
        if (patient.profilePictureUrl) {
            const oldFilePath = path.join(__dirname, '..', patient.profilePictureUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Save new profile picture URL
        const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
        patient.profilePictureUrl = profilePictureUrl;
        await patient.save();

        res.json({
            message: 'Profile picture uploaded successfully',
            profilePictureUrl
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        // Delete uploaded file if there was an error
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get patient profile by ID (for doctors to view)
const getPatientById = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await PatientProfile.findByPk(patientId, {
            include: [{ model: User, attributes: ['email'] }]
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({
            id: patient.id,
            fullName: patient.fullName,
            email: patient.User?.email || '',
            phoneNumber: patient.phoneNumber || '',
            dateOfBirth: patient.dateOfBirth || '',
            gender: patient.gender || '',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || '',
            bloodType: patient.bloodType || '',
            allergies: patient.allergies || '',
            chronicConditions: patient.chronicConditions || '',
            currentMedications: patient.currentMedications || '',
            previousSurgeries: patient.previousSurgeries || '',
            profilePictureUrl: patient.profilePictureUrl || ''
        });
    } catch (error) {
        console.error('Get patient by ID error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getMyProfile, updateMyProfile, uploadProfilePicture, getPatientById };

