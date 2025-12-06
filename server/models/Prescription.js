const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    consultationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    medications: {
        type: DataTypes.JSONB,
        defaultValue: []
        // Array of { name, dosage, frequency, duration, instructions }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    validUntil: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Prescription;
