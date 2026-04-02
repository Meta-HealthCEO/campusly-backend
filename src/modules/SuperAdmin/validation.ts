import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Tenant ───────────────────────────────────────────────────────────────────

const subscriptionSchema = z.object({
  tier: z.enum(['starter', 'growth', 'enterprise']),
  price: z.number().min(0, 'Price must be non-negative'),
  billingCycle: z.enum(['monthly', 'annual']),
  nextBillingDate: z.string().datetime().optional(),
});

const billingContactSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  phone: z.string().trim().optional(),
});

const limitsSchema = z.object({
  maxStudents: z.number().int().min(1, 'Max students must be at least 1'),
  maxStaff: z.number().int().min(1, 'Max staff must be at least 1'),
});

export const onboardSchoolSchema = z.object({
  schoolId: objectIdSchema,
  trialStartDate: z.string().datetime().optional(),
  trialEndDate: z.string().datetime().optional(),
  subscription: subscriptionSchema.optional(),
  modulesEnabled: z.array(z.string().min(1)).optional().default([]),
  limits: limitsSchema.optional(),
  billingContact: billingContactSchema.optional(),
  onboardingStatus: z.enum(['pending', 'in_progress', 'complete']).optional().default('pending'),
  notes: z.string().trim().optional(),
}).strict();

export const updateTenantStatusSchema = z.object({
  status: z.enum(['trial', 'active', 'suspended', 'cancelled']),
  notes: z.string().trim().optional(),
}).strict();

export const updateTenantModulesSchema = z.object({
  modulesEnabled: z.array(z.string().min(1)),
}).strict();

export const suspendTenantSchema = z.object({
  reason: z.string().min(1, 'Reason is required').trim(),
}).strict();

// ─── Platform Invoice ─────────────────────────────────────────────────────────

const lineItemInputSchema = z.object({
  description: z.string().min(1, 'Description is required').trim(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

export const generatePlatformInvoiceSchema = z.object({
  tenantId: objectIdSchema,
  lineItems: z.array(lineItemInputSchema).min(1, 'At least one line item is required'),
  tax: z.number().min(0).optional().default(0),
  issuedDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional().default('draft'),
}).strict();

// ─── Support Ticket ───────────────────────────────────────────────────────────

export const createSupportTicketSchema = z.object({
  tenantId: objectIdSchema,
  schoolId: objectIdSchema,
  category: z.string().min(1, 'Category is required').trim(),
  subject: z.string().min(1, 'Subject is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
}).strict();

export const replyToTicketSchema = z.object({
  message: z.string().min(1, 'Message is required').trim(),
  isInternal: z.boolean().optional().default(false),
}).strict();

export const assignTicketSchema = z.object({
  assignedTo: objectIdSchema,
}).strict();

export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
}).strict();

// ─── Type exports ─────────────────────────────────────────────────────────────

export type OnboardSchoolInput = z.infer<typeof onboardSchoolSchema>;
export type UpdateTenantStatusInput = z.infer<typeof updateTenantStatusSchema>;
export type UpdateTenantModulesInput = z.infer<typeof updateTenantModulesSchema>;
export type SuspendTenantInput = z.infer<typeof suspendTenantSchema>;
export type GeneratePlatformInvoiceInput = z.infer<typeof generatePlatformInvoiceSchema>;
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type ReplyToTicketInput = z.infer<typeof replyToTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
