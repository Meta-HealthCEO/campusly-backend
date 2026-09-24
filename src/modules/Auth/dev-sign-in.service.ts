// Development-only sign-in: lists the accounts on offer (the developer's own
// DEV_SIGN_IN_EMAILS, then one demo account per role) and opens a session as
// one of them with the same tokens as the password login. Only those accounts
// qualify, so a production account copied into a local database cannot be
// opened by id.
import mongoose from 'mongoose';
import { logger } from '../../common/logger.js';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';
import { DEV_SIGN_IN_ROLE_EMAILS, devSignInEmails, isDevSignInEnabled } from '../../config/dev-sign-in.js';
import { User, type IUser } from './model.js';
import { AuthService, type TokenPair } from './service.js';
import { School } from '../School/model.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';

export interface DevSignInAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  /** One muted line under the name, e.g. "Teacher · Grade 1 - A". */
  detail: string;
  /** True for an account named in DEV_SIGN_IN_EMAILS. */
  isOwn: boolean;
}

interface AccountRow {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  schoolId?: mongoose.Types.ObjectId;
  isHOD?: boolean;
  isStandaloneTeacher?: boolean;
}

const MAX_NAMES = 2;

const fullName = (row: { firstName?: string; lastName?: string }): string =>
  `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim();

const humanise = (role: string): string => {
  const words = role.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** "A", "A and B", or "A, B +2 more". */
const listNames = (names: string[]): string => {
  if (names.length <= MAX_NAMES) return names.join(' and ');
  return `${names.slice(0, MAX_NAMES).join(', ')} +${names.length - MAX_NAMES} more`;
};

const withDetail = (prefix: string, rest: string): string => (rest ? `${prefix} · ${rest}` : prefix);

async function describeTeacher(row: AccountRow): Promise<string> {
  if (row.isHOD) return 'Head of department';
  if (row.isStandaloneTeacher) return 'Standalone teacher';
  const classes = await Class.find({ schoolId: row.schoolId, teacherId: row._id, isDeleted: false })
    .select('name').sort({ name: 1 }).lean();
  return withDetail('Teacher', listNames(classes.map((c) => c.name)));
}

async function describeLearner(row: AccountRow): Promise<string> {
  const student = await Student.findOne({ schoolId: row.schoolId, userId: row._id, isDeleted: false })
    .select('classId').lean();
  if (!student) return 'Learner';
  const cls = await Class.findOne({ _id: student.classId, schoolId: row.schoolId, isDeleted: false })
    .select('name').lean();
  return withDetail('Learner', cls?.name ?? '');
}

async function describeParent(row: AccountRow): Promise<string> {
  const parent = await Parent.findOne({ schoolId: row.schoolId, userId: row._id, isDeleted: false })
    .select('childrenIds').lean();
  if (!parent?.childrenIds.length) return 'Parent';
  const children = await Student.find({ _id: { $in: parent.childrenIds }, schoolId: row.schoolId, isDeleted: false })
    .select('userId').lean();
  const userIds = children.flatMap((c) => (c.userId ? [c.userId] : []));
  const users = await User.find({ _id: { $in: userIds }, schoolId: row.schoolId, isDeleted: false })
    .select('firstName lastName').lean();
  return users.length ? `Parent of ${listNames(users.map(fullName))}` : 'Parent';
}

async function describeSchoolAdmin(row: AccountRow): Promise<string> {
  const school = await School.findOne({ _id: row.schoolId, isDeleted: false }).select('name').lean();
  return withDetail('School admin', school?.name ?? '');
}

function describeAccount(row: AccountRow): Promise<string> | string {
  switch (row.role) {
    case 'super_admin': return 'Super admin · All schools';
    case 'school_admin': return describeSchoolAdmin(row);
    case 'teacher': return describeTeacher(row);
    case 'student': return describeLearner(row);
    case 'parent': return describeParent(row);
    default: return humanise(row.role);
  }
}

/** Own emails first (in env order), then the role accounts, without repeats. */
function offeredEmails(): string[] {
  return [...new Set([...devSignInEmails(), ...DEV_SIGN_IN_ROLE_EMAILS])];
}

async function findOfferedRows(): Promise<AccountRow[]> {
  const emails = offeredEmails();
  const rows = await User.find({ email: { $in: emails }, isDeleted: false, isActive: true })
    .select('email firstName lastName role schoolId isHOD isStandaloneTeacher')
    .lean<AccountRow[]>();
  return rows.sort((a, b) => emails.indexOf(a.email) - emails.indexOf(b.email));
}

async function listAccounts(): Promise<DevSignInAccount[]> {
  if (!isDevSignInEnabled()) throw new NotFoundError('Route not found');
  const own = new Set(devSignInEmails());
  const rows = await findOfferedRows();
  return Promise.all(rows.map(async (row) => ({
    id: String(row._id),
    name: fullName(row),
    email: row.email,
    role: row.role,
    detail: await describeAccount(row),
    isOwn: own.has(row.email),
  })));
}

async function signIn(userId: string): Promise<{ user: IUser; tokens: TokenPair }> {
  if (!isDevSignInEnabled()) throw new NotFoundError('Route not found');

  const offered = await findOfferedRows();
  if (!offered.some((row) => String(row._id) === userId)) {
    throw new ForbiddenError('That account is not offered for development sign-in');
  }
  const user = await User.findOne({ _id: userId, isDeleted: false, isActive: true });
  if (!user) throw new ForbiddenError('That account is not offered for development sign-in');

  // Same bookkeeping as the password login, written atomically because the
  // document is loaded without its (required) password.
  const tokens = AuthService.generateTokenPair(user);
  user.lastLoginAt = new Date();
  await User.updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: user.lastLoginAt }, $push: { refreshTokens: tokens.refreshToken } },
  );
  // Every password-free sign-in leaves a trace in the log.
  logger.warn({ userId: String(user._id), email: user.email, role: user.role }, '[dev-sign-in] signed in without a password');
  return { user, tokens };
}

export const DevSignInService = { listAccounts, signIn };
