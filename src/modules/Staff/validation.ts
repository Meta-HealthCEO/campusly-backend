import { z } from 'zod/v4';

export const createStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.email('Valid email is required'),
  phone: z.string().trim().optional(),
  department: z.string().trim().optional(),
  subjects: z.union([
    z.string().trim(),
    z.array(z.string().trim()),
  ]).optional(),
}).strict();

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
