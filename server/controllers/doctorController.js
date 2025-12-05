const { Availability, DoctorProfile } = require('../models');

const setAvailability = async (req, res) => {
    try {
        const { slots } = req.body; // Array of { date, startTime, endTime }
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        if (doctor.verificationStatus !== 'verified') {
            return res.status(403).json({ message: 'Doctor is not verified yet' });
        }

        const availabilityData = slots.map(slot => ({
            doctorId: doctor.id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        await Availability.bulkCreate(availabilityData, { ignoreDuplicates: true });

        res.status(201).json({ message: 'Availability set successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const slots = await Availability.findAll({
            where: {
                doctorId,
                isBooked: false
            },
            order: [['date', 'ASC'], ['startTime', 'ASC']]
        });

        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await DoctorProfile.findAll({
            where: { verificationStatus: 'verified' }
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { setAvailability, getDoctorAvailability, getAllDoctors };
