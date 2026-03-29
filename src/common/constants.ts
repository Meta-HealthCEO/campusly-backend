export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 10,
  },
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
} as const;

export const MONEY = {
  currency: 'ZAR',
  minAmount: 0,
} as const;
