import { APIConnectionError, APIError, APIUserAbortError } from '@anthropic-ai/sdk';
import { AppError } from '../common/errors.js';
import { logger } from '../common/logger.js';

/**
 * What a failed AI call becomes: an AppError with a stable `code` the client
 * can act on and a plain message a learner or teacher can read. The raw SDK
 * error never reaches a response.
 */
export const AI_ERRORS = {
  BUSY: { code: 'AI_BUSY', status: 503, message: 'The AI is busy right now. Try again in a minute.' },
  UNAVAILABLE: {
    code: 'AI_UNAVAILABLE',
    status: 503,
    message: "The AI service isn't reachable right now. Try again in a few minutes.",
  },
  TIMED_OUT: { code: 'AI_UNAVAILABLE', status: 503, message: 'The AI took too long to answer. Try again in a minute.' },
  REJECTED: {
    code: 'AI_REQUEST_REJECTED',
    status: 502,
    message: "The AI couldn't process this request. Try again, and tell your administrator if it keeps happening.",
  },
  NOT_CONFIGURED: {
    code: 'AI_NOT_CONFIGURED',
    status: 503,
    message: "AI isn't set up on this server yet. Ask your administrator to check the Anthropic API key.",
  },
  AUDIO_UNSUPPORTED: { code: 'AI_AUDIO_UNSUPPORTED', status: 501, message: "Audio transcription isn't available yet." },
} as const;

export type AIErrorKind = keyof typeof AI_ERRORS;

export function aiAppError(kind: AIErrorKind): AppError {
  const { message, status, code } = AI_ERRORS[kind];
  return new AppError(message, status, true, { code });
}

export interface AICallContext {
  /** The AIService method that made the call. */
  path: string;
  model: string;
  /** True when our own overall deadline aborted the call. */
  timedOut?: boolean;
}

const MAX_LOGGED_API_MESSAGE = 200;

/** The API's error type (e.g. overloaded_error), from an HTTP body or a mid-stream error event. */
function apiErrorType(err: APIError): string | undefined {
  const type = (err.error as { error?: { type?: unknown } } | undefined)?.error?.type;
  return typeof type === 'string' ? type : undefined;
}

function apiErrorMessage(err: APIError): string {
  const message = (err.error as { error?: { message?: unknown } } | undefined)?.error?.message;
  return (typeof message === 'string' ? message : err.message).slice(0, MAX_LOGGED_API_MESSAGE);
}

function kindFor(err: APIError, timedOut: boolean): AIErrorKind | null {
  if (err instanceof APIUserAbortError) return timedOut ? 'TIMED_OUT' : null;
  if (err instanceof APIConnectionError) return 'UNAVAILABLE'; // includes connection timeouts
  const status = err.status;
  const type = apiErrorType(err);
  if (status === 429 || status === 529 || type === 'rate_limit_error' || type === 'overloaded_error') return 'BUSY';
  if (status === 401 || status === 403) return 'NOT_CONFIGURED';
  // No status: an error event mid-stream, after a 200.
  if (status === undefined || status >= 500 || status === 408 || status === 409) return 'UNAVAILABLE';
  return 'REJECTED';
}

/**
 * Only plain fields are logged: never the SDK error object (it can carry the
 * request), the prompt, learner data or the API key.
 */
function logAIError(err: APIError, kind: AIErrorKind, ctx: AICallContext): void {
  const entry = {
    aiPath: ctx.path,
    model: ctx.model,
    code: AI_ERRORS[kind].code,
    status: err.status ?? null,
    errorType: apiErrorType(err) ?? err.constructor.name,
    requestId: err.requestID ?? null,
    apiMessage: apiErrorMessage(err),
  };
  const line = `[AIService] ${ctx.path} failed: ${entry.code} (${entry.status ?? entry.errorType})`;
  if (kind === 'BUSY') logger.warn(entry, line);
  else logger.error(entry, line);
}

/**
 * Turn whatever an Anthropic call threw into what the caller should throw:
 * SDK errors become a logged AppError; AppErrors, a caller's own cancellation
 * and non-SDK errors (bugs) are returned unchanged.
 */
export function toAIError(err: unknown, ctx: AICallContext): unknown {
  if (!(err instanceof APIError)) return err;
  const kind = kindFor(err, ctx.timedOut ?? false);
  if (!kind) return err;
  logAIError(err, kind, ctx);
  return aiAppError(kind);
}
