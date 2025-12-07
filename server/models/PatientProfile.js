const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientProfile = sequelize.define('PatientProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
    },
    gender: {
        type: DataTypes.STRING,
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.STRING,
    },
    emergencyContact: {
        type: DataTypes.STRING,
    },
    bloodType: {
        type: DataTypes.STRING,
    },
    allergies: {
        type: DataTypes.TEXT,
    },
    chronicConditions: {
        type: DataTypes.TEXT,
    },
    currentMedications: {
        type: DataTypes.TEXT,
    },
    previousSurgeries: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

module.exports = PatientProfile;
