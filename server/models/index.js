const sequelize = require('../config/database');
const User = require('./User');
const PatientProfile = require('./PatientProfile');
const DoctorProfile = require('./DoctorProfile');

// Associations
User.hasOne(PatientProfile, { foreignKey: 'userId' });
PatientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(DoctorProfile, { foreignKey: 'userId' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId' });

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

module.exports = { sequelize, syncDatabase, User, PatientProfile, DoctorProfile };
