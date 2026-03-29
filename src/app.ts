import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
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
import eventRoutes from './modules/Event/routes.js';
import transportRoutes from './modules/Transport/routes.js';
import afterCareRoutes from './modules/AfterCare/routes.js';
import sportRoutes from './modules/Sport/routes.js';
import fundraisingRoutes from './modules/Fundraising/routes.js';
import uniformRoutes from './modules/Uniform/routes.js';
import achieverRoutes from './modules/Achiever/routes.js';
import consentRoutes from './modules/Consent/routes.js';
import reportRoutes from './modules/Report/routes.js';
import auditRoutes from './modules/Audit/routes.js';

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
app.get('/health', async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoStatus,
  });
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
app.use('/api/events', eventRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/after-care', afterCareRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/fundraising', fundraisingRoutes);
app.use('/api/uniforms', uniformRoutes);
app.use('/api/achiever', achieverRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
