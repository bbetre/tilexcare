const sequelize = require('../config/database');
const User = require('./User');
const PatientProfile = require('./PatientProfile');
const DoctorProfile = require('./DoctorProfile');
const Availability = require('./Availability');
const Appointment = require('./Appointment');
const Consultation = require('./Consultation');

// Associations
User.hasOne(PatientProfile, { foreignKey: 'userId' });
PatientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(DoctorProfile, { foreignKey: 'userId' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId' });

// Doctor Availability
DoctorProfile.hasMany(Availability, { foreignKey: 'doctorId' });
Availability.belongsTo(DoctorProfile, { foreignKey: 'doctorId' });

// Appointments
PatientProfile.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(PatientProfile, { foreignKey: 'patientId' });

DoctorProfile.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(DoctorProfile, { foreignKey: 'doctorId' });

Availability.hasOne(Appointment, { foreignKey: 'availabilityId' });
Appointment.belongsTo(Availability, { foreignKey: 'availabilityId' });

// Consultation
Appointment.hasOne(Consultation, { foreignKey: 'appointmentId' });
Consultation.belongsTo(Appointment, { foreignKey: 'appointmentId' });

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ alter: true });
        console.log('Models synced...');
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

module.exports = {
    sequelize,
    syncDatabase,
    User,
    PatientProfile,
    DoctorProfile,
    Availability,
    Appointment,
    Consultation
};
