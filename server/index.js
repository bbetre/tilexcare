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
const dashboardRoutes = require('./routes/dashboardRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Disable caching for API responses to ensure fresh data
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/zoom', zoomRoutes);
app.use('/consultations', consultationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/earnings', earningsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/users', usersRoutes);
app.use('/ratings', ratingRoutes);
app.use('/patients', patientRoutes);

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
