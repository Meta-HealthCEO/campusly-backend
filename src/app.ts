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
import assignmentRoutes from './modules/Assignment/routes.js';
import attendanceRoutes from './modules/Attendance/routes.js';
import lessonRoutes from './modules/Lesson/routes.js';
import studentLessonRoutes from './modules/Lesson/routes-student.js';
import studentDashboardRoutes from './modules/Student/routes-dashboard.js';
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
import subscriptionRoutes from './modules/subscription/routes.js';
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
import { RecordingController } from './modules/Classroom/controller-recording.js';
import contentLibraryRoutes from './modules/ContentLibrary/routes.js';
import contentLibraryStudentRoutes from './modules/ContentLibrary/routes-student.js';
import questionBankRoutes from './modules/QuestionBank/routes.js';
import textbookRoutes from './modules/Textbook/routes.js';
import courseRoutes from './modules/Course/routes.js';
import courseStudentRoutes from './modules/Course/routes-student.js';
import coursePublicRoutes from './modules/Course/routes-public.js';
import assessmentStructureRoutes from './modules/AssessmentStructure/routes.js';
import paperImportRouter from './modules/PaperImport/routes.js';
import teacherSettingsRouter from './modules/TeacherSettings/routes.js';

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
// Assignments are gated under the same `homework` bolt-on — they're both
// student-work artefacts. If we monetise assignments separately later,
// add a dedicated 'assignment' module key here.
app.use('/api/assignments', authenticate, requireModule('homework'), assignmentRoutes);
app.use('/api/attendance', authenticate, requireModule('attendance'), attendanceRoutes);
// New canonical mount for lessons.
app.use('/api/lessons', authenticate, requireModule('academic'), lessonRoutes);
// Legacy /api/lesson-plans → /api/lessons (308 preserves method + body for POST/PUT/PATCH/DELETE).
// Intentionally NOT authenticated — clients re-issue auth on the new URL.
app.all('/api/lesson-plans', (_req, res) => res.redirect(308, '/api/lessons'));
app.all('/api/lesson-plans/*splat', (req, res) => {
  const tail = req.originalUrl.replace(/^\/api\/lesson-plans/, '/api/lessons');
  res.redirect(308, tail);
});
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
app.use('/api', subscriptionRoutes); // Mounted at /api so paths like /api/plans + /api/subscriptions/* + /api/webhooks/onegate resolve. Auth handled per-route.
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
app.post(
  '/api/classroom/webhook/egress',
  express.raw({ type: '*/*' }),
  RecordingController.handleEgressWebhook,
);
app.use('/api/classroom', authenticate, classroomRoutes);
app.use('/api/content-library', authenticate, contentLibraryRoutes);
app.use('/api/content-library/student', authenticate, contentLibraryStudentRoutes);
app.use('/api/question-bank', authenticate, questionBankRoutes);
app.use('/api/textbooks', authenticate, textbookRoutes);
app.use('/api/courses', authenticate, requireModule('courses'), courseRoutes);
app.use('/api/assessment-structures', authenticate, requireModule('academic'), assessmentStructureRoutes);
app.use('/api/paper-imports', paperImportRouter);
app.use('/api/teacher-settings', teacherSettingsRouter);
app.use('/api/enrolments', authenticate, requireModule('courses'), courseStudentRoutes);
app.use('/api/student/lessons', authenticate, studentLessonRoutes);
app.use('/api/student/dashboard', authenticate, studentDashboardRoutes);
// PUBLIC — no authenticate, no requireModule. Certificate verification
// must work for anyone holding a verification code, including unregistered
// users outside the school. A school that later disables the 'courses'
// module should still have its previously-issued certificates verifiable.
app.use('/api/certificates', coursePublicRoutes);

// Static file serving — uploaded assets.
// Marking images (uploads/markings/, uploads/markings-batch/) are NOT served
// statically because they may contain student work that must be auth-gated.
// Use the AITools controller routes for those instead.
app.use('/uploads', (req, res, next) => {
  if (req.path.startsWith('/markings/') || req.path.startsWith('/markings-batch/')) {
    res.status(404).json({ success: false, error: 'Use the API endpoint to access marking images' });
    return;
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
