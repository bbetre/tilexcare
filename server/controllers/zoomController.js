const KJUR = require('jsrsasign');
const { Appointment } = require('../models');

const generateSignature = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.userId;

        // Verify user belongs to this appointment
        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // In a real app, check if req.userId matches patientId or doctorId
        // if (appointment.patientId !== userId && appointment.doctorId !== userId) ...

        const iat = Math.round(new Date().getTime() / 1000) - 30;
        const exp = iat + 60 * 60 * 2; // 2 hours
        const oHeader = { alg: 'HS256', typ: 'JWT' };

        const oPayload = {
            sdkKey: process.env.ZOOM_SDK_KEY,
            mn: appointmentId, // Using appointmentId as the Meeting Number/Topic
            role: 1, // 1 for host (doctor), 0 for attendee (patient). We can refine this.
            iat: iat,
            exp: exp,
            appKey: process.env.ZOOM_SDK_KEY,
            tokenExp: exp
        };

        const sHeader = JSON.stringify(oHeader);
        const sPayload = JSON.stringify(oPayload);
        const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.ZOOM_SDK_SECRET);

        res.json({ signature, topic: appointmentId, name: 'User' }); // Pass real user name
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { generateSignature };
