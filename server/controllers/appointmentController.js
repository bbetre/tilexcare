const { Appointment, Availability, DoctorProfile, PatientProfile, User, Consultation, Prescription } = require('../models');

const bookAppointment = async (req, res) => {
    try {
        const { availabilityId } = req.body;
        const userId = req.userId; // Patient's User ID from token

        // Get Patient Profile
        const patient = await PatientProfile.findOne({ where: { userId } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        // Check Availability
        const availability = await Availability.findByPk(availabilityId);
        if (!availability) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        if (availability.isBooked) {
            return res.status(400).json({ message: 'Slot already booked' });
        }

        // Check if the slot date is not in the past
        const today = new Date().toISOString().split('T')[0];
        if (availability.date < today) {
            return res.status(400).json({ message: 'Cannot book past time slots' });
        }

        // Check if doctor is still available for bookings
        const doctor = await DoctorProfile.findByPk(availability.doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        if (doctor.isAvailable === false) {
            return res.status(400).json({ message: 'Doctor is currently not accepting appointments' });
        }

        // Create Appointment
        // For MVP without payment gateway yet, we'll auto-confirm
        const appointment = await Appointment.create({
            patientId: patient.id,
            doctorId: availability.doctorId,
            availabilityId: availability.id,
            status: 'confirmed',
            paymentStatus: 'pending' // Will be updated when we add payments
        });

        // Mark slot as booked
        availability.isBooked = true;
        await availability.save();

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;

        let appointments;

        if (role === 'patient') {
            const patient = await PatientProfile.findOne({ where: { userId } });
            if (!patient) return res.json([]);

            appointments = await Appointment.findAll({
                where: { patientId: patient.id },
                include: [
                    {
                        model: DoctorProfile,
                        attributes: ['fullName', 'specialization', 'consultationFee', 'bio'],
                        include: [{ model: User, attributes: ['email'] }]
                    },
                    {
                        model: Availability,
                        attributes: ['date', 'startTime', 'endTime']
                    },
                    {
                        model: Consultation,
                        attributes: ['diagnosis', 'symptoms', 'notes', 'followUp'],
                        required: false,
                        include: [{
                            model: Prescription,
                            attributes: ['id'],
                            required: false
                        }]
                    }
                ],
                order: [[Availability, 'date', 'DESC']]
            });
        } else if (role === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor) return res.json([]);

            appointments = await Appointment.findAll({
                where: { doctorId: doctor.id },
                include: [
                    {
                        model: PatientProfile,
                        attributes: ['fullName']
                    },
                    {
                        model: Availability,
                        attributes: ['date', 'startTime', 'endTime']
                    }
                ],
                order: [[Availability, 'date', 'ASC']]
            });
        } else {
            return res.json([]);
        }

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.userId;
        const role = req.userRole;

        const appointment = await Appointment.findByPk(appointmentId, {
            include: [{ model: Availability }]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify ownership
        if (role === 'patient') {
            const patient = await PatientProfile.findOne({ where: { userId } });
            if (!patient || appointment.patientId !== patient.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        } else if (role === 'doctor') {
            const doctor = await DoctorProfile.findOne({ where: { userId } });
            if (!doctor || appointment.doctorId !== doctor.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        // Update appointment status
        appointment.status = 'cancelled';
        await appointment.save();

        // Free up the availability slot
        if (appointment.Availability) {
            appointment.Availability.isBooked = false;
            await appointment.Availability.save();
        }

        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const role = req.userRole;
        
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const appointments = await Appointment.findAll({
            include: [
                {
                    model: DoctorProfile,
                    attributes: ['fullName', 'specialization']
                },
                {
                    model: PatientProfile,
                    attributes: ['fullName']
                },
                {
                    model: Availability,
                    attributes: ['date', 'startTime', 'endTime']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get appointment details
const getAppointmentDetails = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { appointmentId } = req.params;

        const appointment = await Appointment.findByPk(appointmentId, {
            include: [
                {
                    model: DoctorProfile,
                    attributes: ['id', 'fullName', 'specialization', 'consultationFee'],
                    include: [{ model: User, attributes: ['email'] }]
                },
                {
                    model: PatientProfile,
                    attributes: ['id', 'fullName', 'phoneNumber', 'dateOfBirth', 'gender'],
                    include: [{ model: User, attributes: ['email'] }]
                },
                {
                    model: Availability,
                    attributes: ['date', 'startTime', 'endTime']
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const role = req.userRole;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { appointmentId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findByPk(appointmentId, {
            include: [{ model: Availability }]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        // If cancelled, free up the slot
        if (status === 'cancelled' && appointment.Availability) {
            appointment.Availability.isBooked = false;
            await appointment.Availability.save();
        }

        res.json({ message: 'Appointment status updated', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    bookAppointment, 
    getMyAppointments, 
    cancelAppointment, 
    getAllAppointments,
    getAppointmentDetails,
    updateAppointmentStatus
};
