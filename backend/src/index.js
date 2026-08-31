import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin.js';
import { requireAdminAuth } from './middleware/requireAdminAuth.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/admin', requireAdminAuth, adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`FlockGuard backend listening on http://localhost:${port}`);
});
