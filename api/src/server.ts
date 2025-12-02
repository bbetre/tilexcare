import bcrypt from 'bcryptjs';
import { createApp } from './app';
import { prisma } from './db';
import { config } from './config';
import { UserRole } from '@prisma/client';

async function ensureAdminUser() {
  if (!config.adminEmail || !config.adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin bootstrap');
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(config.adminPassword, 10);

  await prisma.user.create({
    data: {
      email: config.adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user created with email ${config.adminEmail}`);
}

async function main() {
  const app = createApp();

  await ensureAdminUser();

  app.listen(config.port, () => {
    console.log(`TilexCare API listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
