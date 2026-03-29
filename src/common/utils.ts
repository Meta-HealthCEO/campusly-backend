import { PAGINATION_DEFAULTS } from './constants.js';

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function apiResponse<T = unknown>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponseBody<T> {
  const response: ApiResponseBody<T> = { success };
  if (data !== undefined) response.data = data;
  if (message !== undefined) response.message = message;
  if (error !== undefined) response.error = error;
  return response;
}

export function paginationHelper(
  page?: number,
  limit?: number
): { skip: number; limit: number } {
  const sanitizedPage = Math.max(1, Math.floor(page ?? PAGINATION_DEFAULTS.page));
  const sanitizedLimit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, Math.floor(limit ?? PAGINATION_DEFAULTS.limit))
  );
  return {
    skip: (sanitizedPage - 1) * sanitizedLimit,
    limit: sanitizedLimit,
  };
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}
