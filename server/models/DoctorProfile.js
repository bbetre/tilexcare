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
    profilePictureUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Contact information
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Enhanced profile fields
    qualifications: {
        type: DataTypes.TEXT, // JSON string of qualifications array
        allowNull: true,
    },
    yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    languages: {
        type: DataTypes.STRING, // Comma-separated languages
        allowNull: true,
    },
    hospitalAffiliation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    education: {
        type: DataTypes.TEXT, // JSON string of education array
        allowNull: true,
    },
    certifications: {
        type: DataTypes.TEXT, // JSON string of certifications array
        allowNull: true,
    },
    specializations: {
        type: DataTypes.TEXT, // JSON string of sub-specializations
        allowNull: true,
    },
    consultationTypes: {
        type: DataTypes.STRING, // e.g., "video,in-person,chat"
        defaultValue: 'video',
    },
    availableForEmergency: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Master availability toggle - when false, doctor is hidden from patient listings
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // Weekly schedule configuration (JSON)
    scheduleConfig: {
        type: DataTypes.TEXT, // JSON string of schedule settings
        allowNull: true,
    },
    // Slot duration in minutes
    slotDuration: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
    },
    // Break time between slots in minutes
    breakTime: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
}, {
    timestamps: true,
});

module.exports = DoctorProfile;
