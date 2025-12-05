const { Consultation, Appointment } = require('../models');

const saveConsultation = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { notes, prescription } = req.body;

        // Check if consultation exists
        let consultation = await Consultation.findOne({ where: { appointmentId } });

        if (consultation) {
            consultation.notes = notes;
            consultation.prescription = prescription;
            await consultation.save();
        } else {
            consultation = await Consultation.create({
                appointmentId,
                notes,
                prescription
            });
        }

        // Mark appointment as completed
        await Appointment.update({ status: 'completed' }, { where: { id: appointmentId } });

        res.json({ message: 'Consultation saved', consultation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getConsultation = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const consultation = await Consultation.findOne({ where: { appointmentId } });
        res.json(consultation || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { saveConsultation, getConsultation };
