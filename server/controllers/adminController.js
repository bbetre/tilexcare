const { User, DoctorProfile } = require('../models');

const getPendingDoctors = async (req, res) => {
    try {
        const doctors = await DoctorProfile.findAll({
            where: { verificationStatus: 'pending' },
            include: [{ model: User, attributes: ['email'] }]
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const doctor = await DoctorProfile.findByPk(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.verificationStatus = status;
        await doctor.save();

        res.json({ message: `Doctor ${status} successfully`, doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPendingDoctors, verifyDoctor };
