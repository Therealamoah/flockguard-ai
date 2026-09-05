import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin.js';
import paymentsRouter from './routes/payments.js';
import uploadsRouter from './routes/uploads.js';
import teamRouter from './routes/team.js';
import notificationsRouter from './routes/notifications.js';
import aiRouter from './routes/ai.js';
import flocksRouter from './routes/flocks.js';
import { requireAdminAuth } from './middleware/requireAdminAuth.js';
import { startScheduler } from './lib/scheduler.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/admin', requireAdminAuth, adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/team', teamRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/flocks', flocksRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`FlockGuard backend listening on http://localhost:${port}`);
  startScheduler();
});
