require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { syncDatabase } = require('./models');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const zoomRoutes = require('./routes/zoomRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/zoom', zoomRoutes);
app.use('/consultations', consultationRoutes);

// Basic Health Check
app.get('/', (req, res) => {
    res.json({
        message: 'TilexCare API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start Server
const startServer = async () => {
    await syncDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
