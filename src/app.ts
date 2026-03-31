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
import { requireModule } from './middleware/moduleGuard.js';

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
import migrationRoutes from './modules/Migration/routes.js';
import learningRoutes from './modules/Learning/routes.js';
import superAdminRoutes from './modules/SuperAdmin/routes.js';
import lostFoundRoutes from './modules/LostFound/routes.js';
import aiToolsRoutes from './modules/AITools/routes.js';
import staffRoutes from './modules/Staff/routes.js';
import libraryRoutes from './modules/Library/routes.js';

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

// API routes — Super Admin (platform management)
app.use('/api/superadmin', superAdminRoutes);

// API routes — Core modules (no guard)
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/staff', staffRoutes);

// API routes — Bolt-on modules (guarded)
app.use('/api/fees', requireModule('fee'), feeRoutes);
app.use('/api/wallets', requireModule('wallet'), walletRoutes);
app.use('/api/tuck-shop', requireModule('tuckshop'), tuckShopRoutes);
app.use('/api/academic', requireModule('academic'), academicRoutes);
app.use('/api/homework', requireModule('homework'), homeworkRoutes);
app.use('/api/attendance', requireModule('attendance'), attendanceRoutes);
app.use('/api/achiever', requireModule('achiever'), achieverRoutes);
app.use('/api/consent', requireModule('consent'), consentRoutes);
app.use('/api/sports', requireModule('sport'), sportRoutes);
app.use('/api/uniforms', requireModule('uniform'), uniformRoutes);
app.use('/api/events', requireModule('event'), eventRoutes);
app.use('/api/fundraising', requireModule('fundraising'), fundraisingRoutes);
app.use('/api/transport', requireModule('transport'), transportRoutes);
app.use('/api/after-care', requireModule('aftercare'), afterCareRoutes);
app.use('/api/migration', requireModule('migration'), migrationRoutes);
app.use('/api/learning', requireModule('learning'), learningRoutes);
app.use('/api/lost-found', requireModule('lost_found'), lostFoundRoutes);
app.use('/api/library', requireModule('library'), libraryRoutes);
app.use('/api/ai-tools', requireModule('ai_tools'), aiToolsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
