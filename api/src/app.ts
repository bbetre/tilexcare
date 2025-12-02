import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { appointmentsRouter } from './routes/appointments';
import { healthRouter } from './routes/health';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/admin', adminRouter);
  app.use('/appointments', appointmentsRouter);

  app.get('/', (_req, res) => {
    res.json({ name: 'TilexCare API', env: config.nodeEnv });
  });

  return app;
}
