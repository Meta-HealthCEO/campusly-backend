import {
  CoachAssignment,
  type ICoachAssignment,
} from './model-coach-assignment.js';
import { SportTeam } from './model.js';
import { User } from '../Auth/model.js';
import { ConflictError, NotFoundError } from '../../common/errors.js';
import type {
  CreateCoachAssignmentInput,
  UpdateCoachAssignmentInput,
} from './validation-coach-assignment.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';

interface ListFilters {
  schoolId: string;
  userId?: string;
  teamId?: string;
}

export class CoachAssignmentService {
  static async create(
    input: CreateCoachAssignmentInput,
    schoolId: string,
  ): Promise<ICoachAssignment> {
    const [team, user] = await Promise.all([
      SportTeam.findOne({ _id: input.teamId, schoolId, isDeleted: false }),
      User.findOne({ _id: input.userId, schoolId }),
    ]);
    if (!team) throw new NotFoundError('Team not found');
    if (!user) throw new NotFoundError('User not found in this school');

    const existing = await CoachAssignment.findOne({
      teamId: input.teamId,
      userId: input.userId,
      isDeleted: false,
    });
    if (existing) throw new ConflictError('This user is already assigned to the team');

    return CoachAssignment.create({
      ...input,
      schoolId,
    });
  }

  static async list(filters: ListFilters): Promise<ICoachAssignment[]> {
    const query: Record<string, unknown> = {
      schoolId: filters.schoolId,
      isDeleted: false,
    };
    if (filters.userId) query.userId = filters.userId;
    if (filters.teamId) query.teamId = filters.teamId;
    return CoachAssignment.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email role')
      .populate('teamId', 'name sport')
      .lean();
  }

  static async update(
    id: string,
    schoolId: string,
    input: UpdateCoachAssignmentInput,
  ): Promise<ICoachAssignment> {
    const assignment = await CoachAssignment.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: input },
      { new: true },
    )
      .populate('userId', 'firstName lastName email role')
      .populate('teamId', 'name sport');
    if (!assignment) throw new NotFoundError('Coach assignment not found');
    return assignment;
  }

  static async remove(id: string, schoolId: string): Promise<void> {
    const result = await CoachAssignment.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Coach assignment not found');
  }

  /**
   * Returns the team IDs a coach/sports_manager is assigned to, or `null`
   * if no scoping should be applied (admins, standalone coaches, or super_admin).
   *
   * Pass the returned array as an optional filter in downstream queries:
   *   if (allowed) query.teamId = { $in: allowed };
   */
  static async getScopedTeamIds(
    user: AuthenticatedUser,
  ): Promise<string[] | null> {
    if (!user.schoolId) return null;
    // Admins / standalone coaches see everything in their school
    if (
      user.role === 'super_admin'
      || user.role === 'school_admin'
      || user.role === 'teacher'
      || user.isStandaloneCoach
      || user.isStandaloneTeacher
    ) {
      return null;
    }
    if (user.role !== 'coach' && user.role !== 'sports_manager') {
      return null;
    }
    const assignments = await CoachAssignment.find({
      schoolId: user.schoolId,
      userId: user.id,
      isActive: true,
      isDeleted: false,
    }).select('teamId').lean();
    return assignments.map((a) => a.teamId.toString());
  }
}
