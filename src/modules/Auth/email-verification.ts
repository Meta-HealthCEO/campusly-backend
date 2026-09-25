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

/** Creates a fresh link (replacing any earlier one) and emails it. */
export async function issueEmailVerification(userId: string): Promise<{ token: string }> {
  const user = await User.findOne({ _id: userId, isDeleted: false }).select('email emailVerifySentAt');
  if (!user) throw new NotFoundError('User not found');

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const recentSends = (user.emailVerifySentAt ?? []).filter((d: Date) => now - d.getTime() < HOUR_MS);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerifyToken: hashToken(token),
        emailVerifyExpires: new Date(now + EMAIL_VERIFY_LINK_TTL_MS),
        emailVerifySentAt: [...recentSends, new Date(now)],
      },
    },
  );

  await EmailService.sendEmailVerification(user.email, `${config.app.url}/verify-email?token=${token}`);
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

/** Sends a new link unless three were sent in the last hour. Already verified: nothing to send. */
export async function resendEmailVerification(userId: string): Promise<{ sent: boolean }> {
  const user = await User.findOne({ _id: userId, isDeleted: false }).select('emailVerifiedAt emailVerifySentAt');
  if (!user) throw new NotFoundError('User not found');
  if (isEmailVerified(user)) return { sent: false };

  const now = Date.now();
  const recentSends = (user.emailVerifySentAt ?? []).filter((d: Date) => now - d.getTime() < HOUR_MS);
  if (recentSends.length >= EMAIL_VERIFY_RESENDS_PER_HOUR) {
    throw new AppError(`You've asked for ${EMAIL_VERIFY_RESENDS_PER_HOUR} links in the last hour. Try again in an hour.`, 429);
  }
  await issueEmailVerification(userId);
  return { sent: true };
}
