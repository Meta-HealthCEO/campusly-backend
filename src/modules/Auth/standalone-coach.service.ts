import { User } from './model.js';
import { School, generateJoinCode } from '../School/model.js';
import { SportTeam } from '../Sport/model.js';
import { SportFixture } from '../Sport/model.js';
import { AuthService } from './service.js';
import { ConflictError, NotFoundError } from '../../common/errors.js';
import type { TokenPair } from './service.js';
import type { IUser } from './model.js';

interface StandaloneCoachSignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country?: string;
  sports?: string[];
}

interface CoachOnboardingStatus {
  hasTeam: boolean;
  hasFixture: boolean;
  dismissed: boolean;
}

export class StandaloneCoachService {
  static async signup(
    data: StandaloneCoachSignupInput,
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const school = await School.create({
      name: `${data.firstName}'s Sport Club`,
      type: 'combined',
      address: {
        street: 'TBD',
        city: 'TBD',
        province: 'TBD',
        postalCode: '0000',
        country: data.country ?? 'South Africa',
      },
      contactInfo: {
        email: data.email.toLowerCase(),
        phone: '0000000000',
      },
      subscription: {
        tier: 'basic',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      modulesEnabled: [
        'auth',
        'sport',
        'academic',
        'ai_tools',
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

    const user = await User.create({
      email: data.email.toLowerCase(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'coach',
      schoolId: school._id,
      isSchoolPrincipal: true,
      isStandaloneCoach: true,
    });

    school.ownerUserId = user._id as typeof school.ownerUserId;
    await school.save();

    const tokens = AuthService.generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  static async getOnboardingStatus(
    userId: string,
    schoolId: string,
  ): Promise<CoachOnboardingStatus> {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found');
    }

    const [teamCount, fixtureCount] = await Promise.all([
      SportTeam.countDocuments({ schoolId, isDeleted: false }),
      SportFixture.countDocuments({ schoolId, isDeleted: false }),
    ]);

    return {
      hasTeam: teamCount > 0,
      hasFixture: fixtureCount > 0,
      dismissed: user.onboardingDismissed,
    };
  }

  static async dismissOnboarding(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { onboardingDismissed: true } });
  }
}
