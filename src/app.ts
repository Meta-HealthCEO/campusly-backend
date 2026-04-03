// Express 5 natively catches rejected promises in async handlers,
// so express-async-errors is NOT needed (and is incompatible with Express 5).
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
import { authenticate } from './middleware/auth.js';

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
import principalReportRoutes from './modules/Report/principal-routes.js';
import auditRoutes from './modules/Audit/routes.js';
import migrationRoutes from './modules/Migration/routes.js';
import learningRoutes from './modules/Learning/routes.js';
import superAdminRoutes from './modules/SuperAdmin/routes.js';
import lostFoundRoutes from './modules/LostFound/routes.js';
import aiToolsRoutes from './modules/AITools/routes.js';
import teacherWorkbenchRoutes from './modules/TeacherWorkbench/routes.js';
import staffRoutes from './modules/Staff/routes.js';
import libraryRoutes from './modules/Library/routes.js';
import careerRoutes from './modules/Career/routes.js';
import communicationRoutes from './modules/Communication/routes.js';
import aiTutorRoutes from './modules/AITutor/routes.js';
import messagingRoutes from './modules/Messaging/routes.js';
import paymentGatewayRoutes from './modules/PaymentGateway/routes.js';
import meetingRoutes from './modules/Meetings/routes.js';
import whatsappRoutes from './modules/WhatsApp/routes.js';
import noticeBoardRoutes from './modules/NoticeBoard/routes.js';
import digestRoutes from './modules/Digest/routes.js';
import accountingRoutes from './modules/Accounting/routes.js';
import schoolNewsRoutes from './modules/SchoolNews/routes.js';
import timetableBuilderRoutes from './modules/TimetableBuilder/routes.js';
import permissionRoutes from './modules/Permission/routes.js';
import leaveRoutes from './modules/Leave/routes.js';
import conferenceRoutes from './modules/Conference/routes.js';
import visitorRoutes from './modules/Visitor/routes.js';
import departmentRoutes from './modules/Department/routes.js';
import admissionsRoutes from './modules/Admissions/routes.js';
import incidentRoutes from './modules/Incident/routes.js';
import wellbeingRoutes from './modules/Wellbeing/routes.js';
import sgbRoutes from './modules/SGB/routes.js';
import payrollRoutes from './modules/Payroll/routes.js';
import budgetRoutes from './modules/Budget/routes.js';
import assetRoutes from './modules/Asset/routes.js';
import governanceRoutes from './modules/Governance/routes.js';
import curriculumRoutes from './modules/Curriculum/routes.js';
import curriculumStructureRoutes from './modules/CurriculumStructure/routes.js';
import pastoralRoutes from './modules/Pastoral/routes.js';
import classroomRoutes from './modules/Classroom/routes.js';

const app = express();

// Global middleware
app.use(helmet({
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  contentSecurityPolicy: false, // API-only, no HTML served
}));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestId);

if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// API docs (disabled in production)
if (config.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

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
app.use('/api/schools', authenticate, schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports/principal', principalReportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/meetings', authenticate, meetingRoutes);
app.use('/api/notice-board', authenticate, noticeBoardRoutes);
app.use('/api/digest', authenticate, digestRoutes);
app.use('/api/accounting', authenticate, requireModule('fee'), accountingRoutes);
app.use('/api/school-news', authenticate, schoolNewsRoutes);
app.use('/api/permissions', authenticate, permissionRoutes);
app.use('/api/leave', authenticate, requireModule('staff_leave'), leaveRoutes);
app.use('/api/conferences', authenticate, requireModule('conference_booking'), conferenceRoutes);
app.use('/api/visitors', authenticate, requireModule('visitor_management'), visitorRoutes);
app.use('/api/departments', authenticate, departmentRoutes);
app.use('/api/admissions', admissionsRoutes); // No global authenticate — public routes need to be unauthenticated; individual routes handle auth

// API routes — Bolt-on modules (guarded)
app.use('/api/fees', authenticate, requireModule('fee'), feeRoutes);
app.use('/api/wallets', authenticate, requireModule('wallet'), walletRoutes);
app.use('/api/tuck-shop', authenticate, requireModule('tuckshop'), tuckShopRoutes);
app.use('/api/academic', authenticate, requireModule('academic'), academicRoutes);
app.use('/api/timetable-builder', authenticate, requireModule('academic'), timetableBuilderRoutes);
app.use('/api/homework', authenticate, requireModule('homework'), homeworkRoutes);
app.use('/api/attendance', authenticate, requireModule('attendance'), attendanceRoutes);
app.use('/api/achiever', authenticate, requireModule('achiever'), achieverRoutes);
app.use('/api/consent', authenticate, requireModule('consent'), consentRoutes);
app.use('/api/sports', authenticate, requireModule('sport'), sportRoutes);
app.use('/api/uniforms', authenticate, requireModule('uniform'), uniformRoutes);
app.use('/api/events', authenticate, requireModule('event'), eventRoutes);
app.use('/api/fundraising', authenticate, requireModule('fundraising'), fundraisingRoutes);
app.use('/api/transport', authenticate, requireModule('transport'), transportRoutes);
app.use('/api/after-care', authenticate, requireModule('aftercare'), afterCareRoutes);
app.use('/api/migration', authenticate, requireModule('migration'), migrationRoutes);
app.use('/api/learning', authenticate, requireModule('learning'), learningRoutes);
app.use('/api/lost-found', authenticate, requireModule('lost_found'), lostFoundRoutes);
app.use('/api/library', authenticate, requireModule('library'), libraryRoutes);
app.use('/api/ai-tools', authenticate, requireModule('ai_tools'), aiToolsRoutes);
app.use('/api/teacher-workbench', authenticate, requireModule('teacher_workbench'), teacherWorkbenchRoutes);
app.use('/api/careers', authenticate, requireModule('careers'), careerRoutes);
app.use('/api/communication', authenticate, requireModule('communication'), communicationRoutes);
app.use('/api/ai-tutor', authenticate, requireModule('ai_tools'), aiTutorRoutes);
app.use('/api/messaging', authenticate, messagingRoutes);
app.use('/api/payment-gateway', paymentGatewayRoutes); // No global authenticate — webhook route needs to be unauthenticated; individual routes handle auth
app.use('/api/whatsapp', whatsappRoutes); // No global authenticate — webhook route needs to be unauthenticated; individual routes handle auth
app.use('/api/incidents', authenticate, requireModule('incident_wellbeing'), incidentRoutes);
app.use('/api/wellbeing', authenticate, requireModule('incident_wellbeing'), wellbeingRoutes);
app.use('/api/sgb', authenticate, sgbRoutes);
app.use('/api/budget', authenticate, requireModule('budget'), budgetRoutes);
app.use('/api/payroll', authenticate, requireModule('payroll'), payrollRoutes);
app.use('/api/assets', authenticate, requireModule('asset_management'), assetRoutes);
app.use('/api/governance', authenticate, governanceRoutes);
app.use('/api/curriculum', authenticate, curriculumRoutes);
app.use('/api/curriculum-structure', authenticate, curriculumStructureRoutes);
app.use('/api/pastoral', authenticate, pastoralRoutes);
app.use('/api/classroom', authenticate, classroomRoutes);

// Static file serving — uploaded assets
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
