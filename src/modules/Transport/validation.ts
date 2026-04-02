import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const busStopSchema = z.object({
  name: z.string().min(1, 'Stop name is required'),
  time: z.string().min(1, 'Stop time is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createBusRouteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  schoolId: objectIdSchema,
  driverName: z.string().min(1, 'Driver name is required'),
  driverPhone: z.string().min(1, 'Driver phone is required'),
  vehicleRegistration: z.string().min(1, 'Vehicle registration is required'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  stops: z.array(busStopSchema).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const updateBusRouteSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  driverName: z.string().min(1, 'Driver name is required').optional(),
  driverPhone: z.string().min(1, 'Driver phone is required').optional(),
  vehicleRegistration: z.string().min(1, 'Vehicle registration is required').optional(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
  stops: z.array(busStopSchema).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const createAssignmentSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  busRouteId: objectIdSchema,
  stopName: z.string().min(1, 'Stop name is required'),
  direction: z.enum(['morning', 'afternoon', 'both']),
}).strict();

export const updateAssignmentSchema = z.object({
  busRouteId: objectIdSchema.optional(),
  stopName: z.string().min(1, 'Stop name is required').optional(),
  direction: z.enum(['morning', 'afternoon', 'both']).optional(),
}).strict();

// ─── Boarding Log Schemas ──────────────────────────────────────────────────

export const createBoardingLogSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  routeId: objectIdSchema,
  boardedAt: z.coerce.date(),
  boardingLat: z.number().optional(),
  boardingLng: z.number().optional(),
}).strict();

export const logAlightSchema = z.object({
  alightedAt: z.coerce.date(),
  alightingLat: z.number().optional(),
  alightingLng: z.number().optional(),
}).strict();

// ─── Transport Alert Schemas ──────────────────────────────────────────────

export const createTransportAlertSchema = z.object({
  schoolId: objectIdSchema,
  routeId: objectIdSchema.optional(),
  type: z.enum(['delay', 'breakdown', 'route_change', 'emergency', 'weather']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  createdBy: objectIdSchema,
}).strict();

// ─── Type Exports ─────────────────────────────────────────────────────────

export type CreateBusRouteInput = z.infer<typeof createBusRouteSchema>;
export type UpdateBusRouteInput = z.infer<typeof updateBusRouteSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CreateBoardingLogInput = z.infer<typeof createBoardingLogSchema>;
export type LogAlightInput = z.infer<typeof logAlightSchema>;
export type CreateTransportAlertInput = z.infer<typeof createTransportAlertSchema>;
