import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { SuperAdminController } from './controller.js';
import {
  onboardSchoolSchema,
  updateTenantStatusSchema,
  updateTenantModulesSchema,
  suspendTenantSchema,
  generatePlatformInvoiceSchema,
  createSupportTicketSchema,
  replyToTicketSchema,
  assignTicketSchema,
  updateTicketStatusSchema,
} from './validation.js';

const router = Router();

// All routes require authentication and super_admin role
router.use(authenticate, authorize('super_admin'));

// ─── Platform Stats & Analytics ──────────────────────────────────────────────
router.get('/stats', SuperAdminController.getPlatformStats);
router.get('/analytics', SuperAdminController.getPlatformAnalytics);
router.get('/health-overview', SuperAdminController.getHealthOverview);

// ─── Tenant Management ────────────────────────────────────────────────────────
router.post('/tenants/onboard', validate(onboardSchoolSchema), SuperAdminController.onboardSchool);
router.get('/tenants', SuperAdminController.getAllTenants);
router.get('/tenants/:id', SuperAdminController.getTenantDetail);
router.patch(
  '/tenants/:id/status',
  validate(updateTenantStatusSchema),
  SuperAdminController.updateTenantStatus,
);
router.patch(
  '/tenants/:id/modules',
  validate(updateTenantModulesSchema),
  SuperAdminController.updateTenantModules,
);
router.post(
  '/tenants/:id/suspend',
  validate(suspendTenantSchema),
  SuperAdminController.suspendTenant,
);
router.get('/tenants/:id/health', SuperAdminController.getTenantHealthScore);

// ─── Platform Invoices ────────────────────────────────────────────────────────
router.post(
  '/invoices',
  validate(generatePlatformInvoiceSchema),
  SuperAdminController.generatePlatformInvoice,
);
router.get('/revenue', SuperAdminController.getPlatformRevenue);
router.get('/tenants/:tenantId/invoices', SuperAdminController.getInvoicesByTenant);

// ─── Support Tickets ──────────────────────────────────────────────────────────
router.post(
  '/tickets',
  validate(createSupportTicketSchema),
  SuperAdminController.createSupportTicket,
);
router.get('/tickets', SuperAdminController.listSupportTickets);
router.get('/tickets/:id', SuperAdminController.getTicketDetail);
router.post(
  '/tickets/:id/reply',
  validate(replyToTicketSchema),
  SuperAdminController.replyToTicket,
);
router.patch(
  '/tickets/:id/assign',
  validate(assignTicketSchema),
  SuperAdminController.assignTicket,
);
router.patch(
  '/tickets/:id/status',
  validate(updateTicketStatusSchema),
  SuperAdminController.updateTicketStatus,
);

export default router;
