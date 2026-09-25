/**
 * Email verification for standalone teachers: a random token is emailed,
 * only its sha256 is stored, the link lasts 24 hours and can be re-sent
 * three times an hour. Unverified teachers can use the app but not AI.
 */
import crypto from 'crypto';
import { config } from '../../config/env.js';
import { User } from './model.js';
import { AppError, BadRequestError, NotFoundError } from '../../common/errors.js';
import { EmailService } from '../../services/email.service.js';

export const EMAIL_VERIFY_LINK_TTL_MS = 24 * 60 * 60 * 1000;
export const EMAIL_VERIFY_RESENDS_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

const LINK_UNUSABLE = 'This link has expired or was already used. Send a new one.';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isEmailVerified(user: { emailVerifiedAt?: Date | null }): boolean {
  return user.emailVerifiedAt instanceof Date;
}

function newLink(now: number): { token: string; set: Record<string, unknown> } {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    set: { emailVerifyToken: hashToken(token), emailVerifyExpires: new Date(now + EMAIL_VERIFY_LINK_TTL_MS) },
  };
}

function linkUrl(token: string): string {
  return `${config.app.url}/verify-email?token=${token}`;
}

/**
 * Creates a fresh link (replacing any earlier one) and emails it. Used at
 * sign-up; it does not count toward the resend limit.
 */
export async function issueEmailVerification(userId: string): Promise<{ token: string }> {
  const { token, set } = newLink(Date.now());
  const user = await User.findOneAndUpdate({ _id: userId, isDeleted: false }, { $set: set }, { returnDocument: 'after' })
    .select('email');
  if (!user) throw new NotFoundError('User not found');
  await EmailService.sendEmailVerification(user.email, linkUrl(token));
  return { token };
}

/** Marks the teacher verified; a link works once and only before it expires. */
export async function verifyEmail(token: string): Promise<{ userId: string }> {
  const now = new Date();
  const user = await User.findOneAndUpdate(
    { emailVerifyToken: hashToken(token), emailVerifyExpires: { $gt: now }, isDeleted: false },
    { $set: { emailVerifiedAt: now }, $unset: { emailVerifyToken: 1, emailVerifyExpires: 1 } },
    { returnDocument: 'after' },
  ).select('_id');
  if (!user) throw new BadRequestError(LINK_UNUSABLE);
  return { userId: String(user._id) };
}

/**
 * Sends a new link unless three were re-sent in the last hour. The limit check
 * and the new send time are one conditional update, so parallel requests
 * can't all pass. Already verified: nothing to send.
 */
export async function resendEmailVerification(userId: string): Promise<{ sent: boolean }> {
  const now = Date.now();
  const hourAgo = new Date(now - HOUR_MS);
  const { token, set } = newLink(now);
  const recentSends = {
    $size: {
      $filter: { input: { $ifNull: ['$emailVerifySentAt', []] }, as: 'sentAt', cond: { $gte: ['$$sentAt', hourAgo] } },
    },
  };
  const user = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false, emailVerifiedAt: null, $expr: { $lt: [recentSends, EMAIL_VERIFY_RESENDS_PER_HOUR] } },
    {
      $set: set,
      // Only the last few send times matter for the limit.
      $push: { emailVerifySentAt: { $each: [new Date(now)], $slice: -EMAIL_VERIFY_RESENDS_PER_HOUR } },
    },
    { returnDocument: 'after' },
  ).select('email');

  if (!user) {
    const current = await User.findOne({ _id: userId, isDeleted: false }).select('emailVerifiedAt');
    if (!current) throw new NotFoundError('User not found');
    if (isEmailVerified(current)) return { sent: false };
    throw new AppError(`You've asked for ${EMAIL_VERIFY_RESENDS_PER_HOUR} links in the last hour. Try again in an hour.`, 429);
  }
  await EmailService.sendEmailVerification(user.email, linkUrl(token));
  return { sent: true };
}
