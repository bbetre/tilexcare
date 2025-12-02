import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import {
  AppointmentStatus,
  AppointmentType,
  PaymentProvider,
  PaymentStatus,
  UserRole,
} from '@prisma/client';

export const appointmentsRouter = Router();

appointmentsRouter.use(authenticate);

appointmentsRouter.post('/', requireRole([UserRole.PATIENT]), async (req, res) => {
  try {
    const { doctorId, scheduledAt, type, paymentProvider, amountCents, currency } = req.body;

    if (!doctorId || !scheduledAt || !type || !paymentProvider || !amountCents) {
      return res.status(400).json({
        error: 'doctorId, scheduledAt, type, paymentProvider and amountCents are required',
      });
    }

    if (!Object.values(AppointmentType).includes(type as AppointmentType)) {
      return res.status(400).json({ error: 'Invalid appointment type' });
    }

    if (!Object.values(PaymentProvider).includes(paymentProvider as PaymentProvider)) {
      return res.status(400).json({ error: 'Invalid payment provider' });
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!patientProfile) {
      return res.status(400).json({ error: 'Patient profile not found' });
    }

    const scheduledAtDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledAtDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduledAt date' });
    }

    // Payment is stubbed as successful for now.
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patientProfile.id,
        type: type as AppointmentType,
        status: AppointmentStatus.CONFIRMED,
        scheduledAt: scheduledAtDate,
        payment: {
          create: {
            provider: paymentProvider as PaymentProvider,
            status: PaymentStatus.SUCCEEDED,
            amountCents,
            currency: currency ?? 'ETB',
          },
        },
      },
      include: {
        doctor: true,
        patient: true,
        payment: true,
      },
    });

    return res.status(201).json({ appointment });
  } catch (err) {
    console.error('Error in POST /appointments', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

appointmentsRouter.get('/me/patient', requireRole([UserRole.PATIENT]), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!patientProfile) {
      return res.status(400).json({ error: 'Patient profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
      orderBy: { scheduledAt: 'desc' },
      include: {
        doctor: true,
        payment: true,
      },
    });

    return res.json({ appointments });
  } catch (err) {
    console.error('Error in GET /appointments/me/patient', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

appointmentsRouter.get('/me/doctor', requireRole([UserRole.DOCTOR]), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctorProfile) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      orderBy: { scheduledAt: 'desc' },
      include: {
        patient: true,
        payment: true,
      },
    });

    return res.json({ appointments });
  } catch (err) {
    console.error('Error in GET /appointments/me/doctor', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
