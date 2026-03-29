import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  schoolId: objectIdSchema,
  targetAmount: z.number().int().positive('Target amount must be a positive integer in cents'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  targetAmount: z.number().int().positive('Target amount must be a positive integer in cents').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const createDonationSchema = z.object({
  campaignId: objectIdSchema,
  schoolId: objectIdSchema,
  donorName: z.string().min(1, 'Donor name is required'),
  donorEmail: z.string().email('Invalid email format').optional(),
  amount: z.number().int().positive('Amount must be a positive integer in cents'),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export const createRaffleSchema = z.object({
  campaignId: objectIdSchema,
  ticketPrice: z.number().int().positive('Ticket price must be a positive integer'),
  totalTickets: z.number().int().positive('Total tickets must be a positive integer'),
  drawDate: z.string().datetime(),
  prizes: z
    .array(
      z.object({
        place: z.number().int().positive(),
        description: z.string().min(1),
        value: z.number().int().positive('Prize value must be a positive integer'),
      }),
    )
    .optional(),
});

export const buyRaffleTicketsSchema = z.object({
  raffleId: objectIdSchema,
  parentId: objectIdSchema,
  studentId: objectIdSchema,
  quantity: z.number().int().min(1).max(100),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;
export type BuyRaffleTicketsInput = z.infer<typeof buyRaffleTicketsSchema>;
