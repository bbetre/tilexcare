const { Availability, DoctorProfile, Appointment, PatientProfile, User, Consultation, Prescription } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const setAvailability = async (req, res) => {
    try {
        const { slots, replaceExisting = true } = req.body; // Array of { date, startTime, endTime }
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        if (doctor.verificationStatus !== 'verified') {
            return res.status(403).json({ message: 'Doctor is not verified yet' });
        }

        const today = new Date().toISOString().split('T')[0];
        
        // If replaceExisting is true, delete all unbooked future slots first
        let deleted = 0;
        if (replaceExisting) {
            const deleteResult = await Availability.destroy({
                where: {
                    doctorId: doctor.id,
                    date: { [Op.gte]: today },
                    isBooked: false
                }
            });
            deleted = deleteResult;
        }

        // Handle case where no slots provided (doctor wants to clear all availability)
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(200).json({ 
                message: 'Availability cleared successfully',
                deleted,
                created: 0,
                total: 0
            });
        }

        // Filter out past dates
        const validSlots = slots.filter(slot => slot.date >= today);

        if (validSlots.length === 0) {
            return res.status(200).json({ 
                message: 'No valid future slots to create',
                deleted,
                created: 0,
                total: 0
            });
        }

        const availabilityData = validSlots.map(slot => ({
            doctorId: doctor.id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        // Create new slots
        let created = 0;
        let skipped = 0;
        
        for (const slotData of availabilityData) {
            const [slot, wasCreated] = await Availability.findOrCreate({
                where: {
                    doctorId: slotData.doctorId,
                    date: slotData.date,
                    startTime: slotData.startTime
                },
                defaults: slotData
            });
            
            if (wasCreated) {
                created++;
            } else {
                skipped++;
            }
        }

        res.status(201).json({ 
            message: 'Availability updated successfully',
            deleted,
            created,
            skipped,
            total: validSlots.length
        });
    } catch (error) {
        console.error('Set availability error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // First check if doctor is available
        const doctor = await DoctorProfile.findByPk(doctorId);
        if (!doctor || doctor.isAvailable === false) {
            return res.json([]); // Return empty if doctor is unavailable
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const slots = await Availability.findAll({
            where: {
                doctorId,
                isBooked: false,
                date: {
                    [Op.gte]: today // Only future or today's slots
                }
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
        // Only return verified doctors who have isAvailable set to true
        const doctors = await DoctorProfile.findAll({
            where: { 
                verificationStatus: 'verified',
                isAvailable: true
            }
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get doctor's patients
const getMyPatients = async (req, res) => {
    try {
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        // Get all unique patients who have had appointments with this doctor
        const appointments = await Appointment.findAll({
            where: { doctorId: doctor.id },
            include: [
                {
                    model: PatientProfile,
                    attributes: ['id', 'fullName', 'phoneNumber', 'dateOfBirth', 'gender', 'address', 'emergencyContact', 'bloodType', 'allergies', 'chronicConditions', 'currentMedications', 'previousSurgeries'],
                    include: [{ model: User, attributes: ['email'] }]
                },
                {
                    model: Availability,
                    attributes: ['date', 'startTime', 'endTime']
                },
                {
                    model: Consultation,
                    attributes: ['diagnosis', 'notes']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Group by patient and aggregate data
        const patientMap = new Map();

        appointments.forEach(apt => {
            if (!apt.PatientProfile) return;
            
            const patientId = apt.PatientProfile.id;
            
            if (!patientMap.has(patientId)) {
                patientMap.set(patientId, {
                    id: patientId,
                    name: apt.PatientProfile.fullName,
                    email: apt.PatientProfile.User?.email || '-',
                    phone: apt.PatientProfile.phoneNumber || '-',
                    dateOfBirth: apt.PatientProfile.dateOfBirth,
                    gender: apt.PatientProfile.gender,
                    address: apt.PatientProfile.address || null,
                    emergencyContact: apt.PatientProfile.emergencyContact || null,
                    bloodType: apt.PatientProfile.bloodType || null,
                    allergies: apt.PatientProfile.allergies || null,
                    chronicConditions: apt.PatientProfile.chronicConditions || null,
                    currentMedications: apt.PatientProfile.currentMedications || null,
                    previousSurgeries: apt.PatientProfile.previousSurgeries || null,
                    totalVisits: 0,
                    firstVisit: null,
                    lastVisit: null,
                    condition: apt.Consultation?.diagnosis || null,
                    healthNotes: apt.Consultation?.notes || null,
                    recentConsultations: []
                });
            }

            const patient = patientMap.get(patientId);
            patient.totalVisits++;

            const visitDate = apt.Availability?.date;
            if (visitDate) {
                if (!patient.firstVisit || new Date(visitDate) < new Date(patient.firstVisit)) {
                    patient.firstVisit = visitDate;
                }
                if (!patient.lastVisit || new Date(visitDate) > new Date(patient.lastVisit)) {
                    patient.lastVisit = visitDate;
                }
            }

            // Add recent consultations (max 5)
            if (patient.recentConsultations.length < 5 && apt.Consultation) {
                patient.recentConsultations.push({
                    date: apt.Availability?.date,
                    diagnosis: apt.Consultation.diagnosis,
                    status: apt.status
                });
            }

            // Update condition to most recent diagnosis
            if (apt.Consultation?.diagnosis && !patient.condition) {
                patient.condition = apt.Consultation.diagnosis;
            }
        });

        res.json(Array.from(patientMap.values()));
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get doctor's own profile
const getMyProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ 
            where: { userId },
            include: [{ model: User, attributes: ['email'] }]
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        res.json({
            id: doctor.id,
            fullName: doctor.fullName,
            email: doctor.User?.email || '',
            phoneNumber: doctor.phoneNumber || '',
            specialization: doctor.specialization,
            licenseNumber: doctor.licenseNumber,
            bio: doctor.bio || '',
            consultationFee: doctor.consultationFee,
            yearsOfExperience: doctor.yearsOfExperience,
            languages: doctor.languages || '',
            hospitalAffiliation: doctor.hospitalAffiliation || '',
            education: doctor.education,
            qualifications: doctor.qualifications,
            certifications: doctor.certifications,
            specializations: doctor.specializations,
            consultationTypes: doctor.consultationTypes || 'video',
            availableForEmergency: doctor.availableForEmergency || false,
            isAvailable: doctor.isAvailable !== false, // Default to true if not set
            verificationStatus: doctor.verificationStatus,
            licenseDocumentUrl: doctor.licenseDocumentUrl
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update doctor's own profile
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            fullName,
            phoneNumber,
            specialization,
            bio,
            consultationFee,
            yearsOfExperience,
            languages,
            hospitalAffiliation,
            education,
            qualifications,
            certifications,
            specializations,
            consultationTypes,
            availableForEmergency,
            isAvailable
        } = req.body;

        const doctor = await DoctorProfile.findOne({ where: { userId } });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        // Update fields - handle empty strings and NaN values
        if (fullName !== undefined && fullName !== '') doctor.fullName = fullName;
        if (phoneNumber !== undefined) doctor.phoneNumber = phoneNumber || null;
        if (specialization !== undefined && specialization !== '') doctor.specialization = specialization;
        if (bio !== undefined) doctor.bio = bio || null;
        
        // Handle numeric fields - only update if valid number
        if (consultationFee !== undefined && consultationFee !== '') {
            const fee = parseFloat(consultationFee);
            if (!isNaN(fee)) doctor.consultationFee = fee;
        }
        if (yearsOfExperience !== undefined && yearsOfExperience !== '') {
            const years = parseInt(yearsOfExperience);
            if (!isNaN(years)) doctor.yearsOfExperience = years;
        } else if (yearsOfExperience === '') {
            doctor.yearsOfExperience = null;
        }
        
        if (languages !== undefined) doctor.languages = languages || null;
        if (hospitalAffiliation !== undefined) doctor.hospitalAffiliation = hospitalAffiliation || null;
        if (education !== undefined) doctor.education = education ? (typeof education === 'string' ? education : JSON.stringify(education)) : null;
        if (qualifications !== undefined) doctor.qualifications = qualifications ? (typeof qualifications === 'string' ? qualifications : JSON.stringify(qualifications)) : null;
        if (certifications !== undefined) doctor.certifications = certifications ? (typeof certifications === 'string' ? certifications : JSON.stringify(certifications)) : null;
        if (specializations !== undefined) doctor.specializations = specializations ? (typeof specializations === 'string' ? specializations : JSON.stringify(specializations)) : null;
        if (consultationTypes !== undefined) doctor.consultationTypes = consultationTypes || 'video';
        if (availableForEmergency !== undefined) doctor.availableForEmergency = !!availableForEmergency;
        if (isAvailable !== undefined) doctor.isAvailable = !!isAvailable;

        await doctor.save();

        res.json({ message: 'Profile updated successfully', doctor });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get doctor's own availability slots
const getMyAvailability = async (req, res) => {
    try {
        const userId = req.userId;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const today = new Date().toISOString().split('T')[0];

        const slots = await Availability.findAll({
            where: {
                doctorId: doctor.id,
                date: {
                    [Op.gte]: today
                }
            },
            order: [['date', 'ASC'], ['startTime', 'ASC']]
        });

        res.json(slots);
    } catch (error) {
        console.error('Get my availability error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete availability slot
const deleteAvailability = async (req, res) => {
    try {
        const userId = req.userId;
        const { slotId } = req.params;

        const doctor = await DoctorProfile.findOne({ where: { userId } });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const slot = await Availability.findOne({
            where: {
                id: slotId,
                doctorId: doctor.id
            }
        });

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        if (slot.isBooked) {
            return res.status(400).json({ message: 'Cannot delete a booked slot. Please cancel the appointment first.' });
        }

        await slot.destroy();

        res.json({ message: 'Availability slot deleted successfully' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { 
    setAvailability, 
    getDoctorAvailability, 
    getAllDoctors, 
    getMyPatients, 
    getMyProfile, 
    updateMyProfile,
    getMyAvailability,
    deleteAvailability
};
