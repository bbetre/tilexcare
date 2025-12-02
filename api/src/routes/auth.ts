import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { DoctorVerificationStatus, UserRole } from '@prisma/client';

export const authRouter = Router();

function signToken(userId: string, role: UserRole) {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });
}

authRouter.post('/register/patient', async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, medicalHistory } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'email, password and fullName are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const patient = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.PATIENT,
        patientProfile: {
          create: {
            fullName,
            phone,
            medicalHistory,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    const token = signToken(patient.id, patient.role);

    return res.status(201).json({
      token,
      user: {
        id: patient.id,
        email: patient.email,
        role: patient.role,
        patientProfile: patient.patientProfile,
      },
    });
  } catch (err) {
    console.error('Error in /auth/register/patient', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/register/doctor', async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      specialties,
      bio,
      consultationFeeCents,
      currency,
      documents,
    } = req.body;

    if (!email || !password || !fullName || !specialties) {
      return res
        .status(400)
        .json({ error: 'email, password, fullName and specialties are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const doctor = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.DOCTOR,
        doctorProfile: {
          create: {
            fullName,
            phone,
            specialties,
            bio,
            consultationFeeCents: consultationFeeCents ?? 0,
            currency: currency ?? 'ETB',
            verificationStatus: DoctorVerificationStatus.PENDING,
            documents: documents && Array.isArray(documents)
              ? {
                  create: documents.map((doc: { type: string; fileUrl: string }) => ({
                    type: doc.type,
                    fileUrl: doc.fileUrl,
                  })),
                }
              : undefined,
          },
        },
      },
      include: {
        doctorProfile: {
          include: {
            documents: true,
          },
        },
      },
    });

    const token = signToken(doctor.id, doctor.role);

    return res.status(201).json({
      token,
      user: {
        id: doctor.id,
        email: doctor.email,
        role: doctor.role,
        doctorProfile: doctor.doctorProfile,
      },
    });
  } catch (err) {
    console.error('Error in /auth/register/doctor', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id, user.role);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patientProfile: user.patientProfile,
        doctorProfile: user.doctorProfile,
      },
    });
  } catch (err) {
    console.error('Error in /auth/login', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
