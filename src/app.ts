import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';

// Module routes
import authRoutes from './modules/Auth/routes.js';
import schoolRoutes from './modules/School/routes.js';
import studentRoutes from './modules/Student/routes.js';
import parentRoutes from './modules/Parent/routes.js';
import walletRoutes from './modules/Wallet/routes.js';
import feeRoutes from './modules/Fee/routes.js';
import academicRoutes from './modules/Academic/routes.js';
import homeworkRoutes from './modules/Homework/routes.js';
import attendanceRoutes from './modules/Attendance/routes.js';
import tuckShopRoutes from './modules/TuckShop/routes.js';
import notificationRoutes from './modules/Notification/routes.js';
import announcementRoutes from './modules/Announcement/routes.js';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestId);

if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tuck-shop', tuckShopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
