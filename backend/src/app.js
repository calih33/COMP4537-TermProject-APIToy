// Express app: CORS (client origin only), JSON body parser, routes, error handler.
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { trackUsage } from './middleware/trackUsage.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import healthEventsRoutes from './routes/healthEvents.routes.js';
import userRoutes from './routes/user.routes.js';

export const app = express();

// CLIENT_ORIGIN can list several origins separated by commas (e.g. local dev + deployed client).
const allowedOrigins = config.clientOrigin.split(',').map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(trackUsage);

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/health-events', healthEventsRoutes);

app.use(notFound);
app.use(errorHandler);
