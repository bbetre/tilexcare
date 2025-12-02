import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'changeme-jwt-secret',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@tilexcare.local',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'changeme-admin-password',
};
