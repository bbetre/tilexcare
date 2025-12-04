const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, PatientProfile, DoctorProfile } = require('../models');

const register = async (req, res) => {
    try {
        const { email, password, role, ...profileData } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            email,
            password_hash,
            role,
        });

        // Create Profile based on role
        if (role === 'patient') {
            await PatientProfile.create({
                userId: user.id,
                fullName: profileData.fullName,
                dateOfBirth: profileData.dateOfBirth,
                gender: profileData.gender,
                phoneNumber: profileData.phoneNumber
            });
        } else if (role === 'doctor') {
            await DoctorProfile.create({
                userId: user.id,
                fullName: profileData.fullName,
                specialization: profileData.specialization,
                licenseNumber: profileData.licenseNumber,
                // other fields can be updated later
            });
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
