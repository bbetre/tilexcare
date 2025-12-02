import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { DoctorVerificationStatus, UserRole } from '@prisma/client';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole([UserRole.ADMIN]));

adminRouter.get('/doctors/pending', async (_req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: { verificationStatus: DoctorVerificationStatus.PENDING },
      include: {
        user: true,
        documents: true,
      },
    });

    return res.json({ doctors });
  } catch (err) {
    console.error('Error in GET /admin/doctors/pending', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/doctors', async (req, res) => {
  try {
    const { status } = req.query;

    const where: { verificationStatus?: DoctorVerificationStatus } = {};
    if (status && typeof status === 'string') {
      if (!Object.values(DoctorVerificationStatus).includes(status as DoctorVerificationStatus)) {
        return res.status(400).json({ error: 'Invalid status filter' });
      }
      where.verificationStatus = status as DoctorVerificationStatus;
    }

    const doctors = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: true,
        documents: true,
      },
    });

    return res.json({ doctors });
  } catch (err) {
    console.error('Error in GET /admin/doctors', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/doctors/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctorProfile.update({
      where: { id },
      data: {
        verificationStatus: DoctorVerificationStatus.APPROVED,
        rejectionReason: null,
      },
    });

    return res.json({ doctor });
  } catch (err) {
    console.error('Error in POST /admin/doctors/:id/approve', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/doctors/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }

    const doctor = await prisma.doctorProfile.update({
      where: { id },
      data: {
        verificationStatus: DoctorVerificationStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    return res.json({ doctor });
  } catch (err) {
    console.error('Error in POST /admin/doctors/:id/reject', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
