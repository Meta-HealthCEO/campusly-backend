import type mongoose from 'mongoose';
import { User } from './model.js';
import { School, generateJoinCode } from '../School/model.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { CurriculumFramework } from '../TeacherWorkbench/model.js';
import { Lesson } from '../Lesson/model.js';
import { Homework } from '../Homework/model.js';
import { GeneratedPaper } from '../AITools/model.js';
import { AuthService } from './service.js';
import { SubscriptionService } from '../subscription/service.js';
import { ConflictError, NotFoundError } from '../../common/errors.js';

interface StandaloneSignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country?: string;
  subjects?: string[];
}

interface OnboardingStatus {
  hasClass: boolean;
  hasStudent: boolean;
  hasFramework: boolean;
  hasFirstContent: boolean;
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
      modulesEnabled: [
        'auth',
        'academic',
        'ai_tools',
        'teacher_workbench',
        'learning',
        'homework',
        'attendance',
        'incident_wellbeing',
        'communication',
      ],
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
    const [hasLesson, hasHomework, hasPaper] = await Promise.all([
      Lesson.exists({ schoolId, isDeleted: false }),
      Homework.exists({ schoolId, isDeleted: false }),
      GeneratedPaper.exists({ schoolId, isDeleted: false }),
    ]);
    const hasFirstContent = Boolean(hasLesson || hasHomework || hasPaper);

    return {
      hasClass: classCount > 0,
      hasStudent: studentCount > 0,
      hasFramework: frameworkCount > 0,
      hasFirstContent,
      dismissed: user.onboardingDismissed,
    };
  }

  static async dismissOnboarding(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { onboardingDismissed: true } });
  }
}
