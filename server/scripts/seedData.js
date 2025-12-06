/**
 * Seed script to create example accounts for TilexCare
 * Run with: node scripts/seedData.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, DoctorProfile, PatientProfile, Availability } = require('../models');
const sequelize = require('../config/database');

const seedData = async () => {
    try {
        console.log('Starting seed process...');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('Database connected.');

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // ==================== CREATE ADMIN ====================
        console.log('\nCreating admin account...');
        const [adminUser, adminCreated] = await User.findOrCreate({
            where: { email: 'admin@tilexcare.com' },
            defaults: {
                email: 'admin@tilexcare.com',
                password_hash: hashedPassword,
                role: 'admin'
            }
        });
        console.log(adminCreated ? '✓ Admin created' : '• Admin already exists');

        // ==================== CREATE PATIENT ====================
        console.log('\nCreating patient account...');
        const [patientUser, patientCreated] = await User.findOrCreate({
            where: { email: 'patient@tilexcare.com' },
            defaults: {
                email: 'patient@tilexcare.com',
                password_hash: hashedPassword,
                role: 'patient'
            }
        });

        if (patientCreated) {
            await PatientProfile.create({
                userId: patientUser.id,
                fullName: 'Betre Hailu',
                phone: '+251911234567',
                dateOfBirth: '1990-05-15',
                gender: 'male',
                address: 'Addis Ababa, Ethiopia',
                emergencyContact: '+251922345678',
                bloodType: 'O+',
                allergies: 'None',
                medicalHistory: 'No significant medical history'
            });
            console.log('✓ Patient created with profile');
        } else {
            console.log('• Patient already exists');
        }

        // ==================== CREATE VERIFIED DOCTOR ====================
        console.log('\nCreating verified doctor account...');
        const [doctorUser, doctorCreated] = await User.findOrCreate({
            where: { email: 'doctor@tilexcare.com' },
            defaults: {
                email: 'doctor@tilexcare.com',
                password_hash: hashedPassword,
                role: 'doctor'
            }
        });

        if (doctorCreated) {
            const doctorProfile = await DoctorProfile.create({
                userId: doctorUser.id,
                fullName: 'Dr. Abebe Kebede',
                phone: '+251933456789',
                specialization: 'General Practitioner',
                licenseNumber: 'ETH-MED-2024-001',
                yearsOfExperience: 10,
                bio: 'Experienced general practitioner with over 10 years of experience in primary care. Dedicated to providing comprehensive healthcare services.',
                consultationFee: 500,
                verificationStatus: 'verified'
            });

            // Create availability slots for the next 2 weeks
            const today = new Date();
            const slots = [];
            for (let day = 1; day <= 14; day++) {
                const date = new Date(today);
                date.setDate(today.getDate() + day);
                
                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                const dateStr = date.toISOString().split('T')[0];
                
                // Morning slots
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '09:00', endTime: '09:30' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '09:30', endTime: '10:00' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '10:00', endTime: '10:30' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '10:30', endTime: '11:00' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '11:00', endTime: '11:30' });
                
                // Afternoon slots
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '14:00', endTime: '14:30' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '14:30', endTime: '15:00' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '15:00', endTime: '15:30' });
                slots.push({ doctorId: doctorProfile.id, date: dateStr, startTime: '15:30', endTime: '16:00' });
            }
            
            await Availability.bulkCreate(slots);
            console.log(`✓ Doctor created with profile and ${slots.length} availability slots`);
        } else {
            console.log('• Doctor already exists');
        }

        // ==================== CREATE PENDING DOCTOR (for verification testing) ====================
        console.log('\nCreating pending doctor account...');
        const [pendingDoctorUser, pendingCreated] = await User.findOrCreate({
            where: { email: 'pending.doctor@tilexcare.com' },
            defaults: {
                email: 'pending.doctor@tilexcare.com',
                password_hash: hashedPassword,
                role: 'doctor'
            }
        });

        if (pendingCreated) {
            await DoctorProfile.create({
                userId: pendingDoctorUser.id,
                fullName: 'Dr. Sara Haile',
                phone: '+251944567890',
                specialization: 'Dermatologist',
                licenseNumber: 'ETH-MED-2024-002',
                yearsOfExperience: 5,
                bio: 'Board-certified dermatologist specializing in skin conditions and cosmetic dermatology.',
                consultationFee: 600,
                verificationStatus: 'pending'
            });
            console.log('✓ Pending doctor created (for verification testing)');
        } else {
            console.log('• Pending doctor already exists');
        }

        // ==================== CREATE SECOND VERIFIED DOCTOR ====================
        console.log('\nCreating second verified doctor...');
        const [doctor2User, doctor2Created] = await User.findOrCreate({
            where: { email: 'doctor2@tilexcare.com' },
            defaults: {
                email: 'doctor2@tilexcare.com',
                password_hash: hashedPassword,
                role: 'doctor'
            }
        });

        if (doctor2Created) {
            const doctor2Profile = await DoctorProfile.create({
                userId: doctor2User.id,
                fullName: 'Dr. Yonas Tesfaye',
                phone: '+251955678901',
                specialization: 'Pediatrician',
                licenseNumber: 'ETH-MED-2024-003',
                yearsOfExperience: 8,
                bio: 'Caring pediatrician dedicated to childrens health and wellness.',
                consultationFee: 450,
                verificationStatus: 'verified'
            });

            // Create some availability slots
            const today = new Date();
            const slots = [];
            for (let day = 1; day <= 7; day++) {
                const date = new Date(today);
                date.setDate(today.getDate() + day);
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                const dateStr = date.toISOString().split('T')[0];
                slots.push({ doctorId: doctor2Profile.id, date: dateStr, startTime: '10:00', endTime: '10:30' });
                slots.push({ doctorId: doctor2Profile.id, date: dateStr, startTime: '10:30', endTime: '11:00' });
                slots.push({ doctorId: doctor2Profile.id, date: dateStr, startTime: '15:00', endTime: '15:30' });
            }
            
            await Availability.bulkCreate(slots);
            console.log(`✓ Second doctor created with ${slots.length} availability slots`);
        } else {
            console.log('• Second doctor already exists');
        }

        console.log('\n========================================');
        console.log('SEED COMPLETE! Example accounts:');
        console.log('========================================');
        console.log('\n📋 ADMIN:');
        console.log('   Email: admin@tilexcare.com');
        console.log('   Password: password123');
        console.log('\n👤 PATIENT:');
        console.log('   Email: patient@tilexcare.com');
        console.log('   Password: password123');
        console.log('\n👨‍⚕️ VERIFIED DOCTOR:');
        console.log('   Email: doctor@tilexcare.com');
        console.log('   Password: password123');
        console.log('\n⏳ PENDING DOCTOR (for verification testing):');
        console.log('   Email: pending.doctor@tilexcare.com');
        console.log('   Password: password123');
        console.log('\n========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
