import type mongoose from 'mongoose';
import { User } from './model.js';
import { School, generateJoinCode } from '../School/model.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { CurriculumFramework } from '../TeacherWorkbench/model.js';
import { Lesson } from '../Lesson/model.js';
import { Homework } from '../Homework/model.js';
import { GeneratedPaper } from '../AITools/model.js';
import { Course } from '../Course/model.js';
import { AuthService } from './service.js';
import { SubscriptionService } from '../subscription/service.js';
import { ConflictError, NotFoundError } from '../../common/errors.js';
import { STANDALONE_DEFAULT_MODULES } from '../../common/moduleConfig.js';
import { logger } from '../../common/logger.js';
import { issueEmailVerification } from './email-verification.js';

interface StandaloneSignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country?: string;
  subjects?: string[];
}

interface OnboardingStatus {
  /** Step 1: the teacher picked at least one CAPS grade (with subjects). */
  hasScope: boolean;
  hasClass: boolean;
  hasStudent: boolean;
  hasFramework: boolean;
  hasFirstContent: boolean;
  /** Step 3: the teacher has built a class unit (shown as a "lesson"). */
  hasUnit: boolean;
  dismissed: boolean;
}

export class StandaloneService {
  static async signup(data: StandaloneSignupInput) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const school = await School.create({
      name: `${data.firstName}'s Classroom`,
      type: 'combined',
      address: {
        street: 'TBD',
        city: 'TBD',
        province: 'TBD',
        postalCode: '0000',
        country: data.country ?? 'South Africa',
      },
      contactInfo: { email: data.email.toLowerCase(), phone: '0000000000' },
      modulesEnabled: [...STANDALONE_DEFAULT_MODULES],
      settings: {
        academicYear: new Date().getFullYear(),
        terms: 4,
        gradingSystem: 'percentage',
      },
      principal: `${data.firstName} ${data.lastName}`,
      joinCode: generateJoinCode(),
      isActive: true,
      plan: 'standalone',
    });

    await SubscriptionService.createInitialFreeSubscription(school._id as mongoose.Types.ObjectId);

    const user = await User.create({
      email: data.email.toLowerCase(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'teacher',
      schoolId: school._id,
      isSchoolPrincipal: true,
      isStandaloneTeacher: true,
    });

    school.ownerUserId = user._id as typeof school.ownerUserId;
    await school.save();

    const tokens = AuthService.generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // The teacher can start without verifying; a failed email never fails sign-up.
    try {
      await issueEmailVerification(String(user._id));
    } catch (err: unknown) {
      logger.error({ err, userId: String(user._id) }, 'Sending the email verification link failed');
    }

    return { user, tokens };
  }

  static async getOnboardingStatus(userId: string, schoolId: string): Promise<OnboardingStatus> {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }

    const classCount = await Class.countDocuments({ schoolId, isDeleted: false });
    const studentCount = await Student.countDocuments({ schoolId, isDeleted: false });
    const frameworkCount = await CurriculumFramework.countDocuments({
      $or: [{ schoolId: null }, { schoolId }],
      isDeleted: false,
    });
    const [hasLesson, hasHomework, hasPaper, hasUnit] = await Promise.all([
      Lesson.exists({ schoolId, isDeleted: false }),
      Homework.exists({ schoolId, isDeleted: false }),
      GeneratedPaper.exists({ schoolId, isDeleted: false }),
      Course.exists({ schoolId, kind: 'class_unit', isDeleted: false }),
    ]);
    const hasFirstContent = Boolean(hasLesson || hasHomework || hasPaper);

    return {
      hasScope: (user.teachingScope?.grades?.length ?? 0) > 0,
      hasClass: classCount > 0,
      hasStudent: studentCount > 0,
      hasFramework: frameworkCount > 0,
      hasFirstContent,
      hasUnit: Boolean(hasUnit),
      dismissed: user.onboardingDismissed,
    };
  }

  static async dismissOnboarding(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { onboardingDismissed: true } });
  }
}
