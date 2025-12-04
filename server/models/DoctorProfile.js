const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorProfile = sequelize.define('DoctorProfile', {
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
    specialization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    licenseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verificationStatus: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
    },
    bio: {
        type: DataTypes.TEXT,
    },
    consultationFee: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
    },
    licenseDocumentUrl: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
});

module.exports = DoctorProfile;
