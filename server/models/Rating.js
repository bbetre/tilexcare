const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // One rating per appointment
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
});

module.exports = Rating;
