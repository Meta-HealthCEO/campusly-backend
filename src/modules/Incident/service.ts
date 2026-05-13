import mongoose from 'mongoose';
import {
  Incident, IncidentAction, IncidentCounter,
  type IIncident,
  type IncidentStatus,
} from './model.js';
import { Student } from '../Student/model.js';
import { GradeService } from '../Academic/services/grade.service.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import type {
  CreateIncidentInput, UpdateIncidentInput,
  CreateActionInput, UpdateActionInput,
} from './validation.js';

interface WelfareUser extends AuthenticatedUser {
  isCounselor?: boolean;
  isSchoolPrincipal?: boolean;
}

interface ListIncidentsQuery {
  status?: string;
  type?: string;
  severity?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

function hasSchoolWideAccess(user: WelfareUser): boolean {
  return (
    user.role === 'super_admin' ||
    user.role === 'school_admin' ||
    (user.role === 'teacher' && !!user.isCounselor) ||
    (user.role === 'teacher' && !!user.isSchoolPrincipal)
  );
}

function studentPopulate(path: string) {
  return {
    path,
    select: 'admissionNumber userId gradeId classId',
    populate: [
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'gradeId', select: 'name level' },
      { path: 'classId', select: 'name' },
    ],
  };
}

async function getTeacherStudentIds(user: WelfareUser, schoolId: string): Promise<string[]> {
  const load = await GradeService.getTeacherTeachingLoad(user.id, schoolId);
  const ids = new Set<string>();
  const collect = (student: { _id?: unknown; id?: unknown }) => {
    const id = student.id ?? student._id;
    if (id) ids.add(String(id));
  };

  load.homeroom?.students.forEach(collect);
  load.subjectClasses.forEach((entry) => entry.students.forEach(collect));
  return Array.from(ids);
}

function collectStudentIds(data: Pick<CreateIncidentInput, 'involvedParties' | 'witnesses'>): string[] {
  const ids = new Set<string>();
  data.involvedParties?.forEach((party) => ids.add(party.studentId));
  data.witnesses?.forEach((witness) => {
    if (witness.studentId) ids.add(witness.studentId);
  });
  return Array.from(ids);
}

async function assertStudentsVisible(
  user: WelfareUser,
  schoolId: string,
  studentIds: string[],
): Promise<void> {
  if (studentIds.length === 0) return;

  const students = await Student.find({
    _id: { $in: studentIds.map((id) => new mongoose.Types.ObjectId(id)) },
    schoolId,
    isDeleted: false,
  })
    .select('_id classId')
    .lean();

  if (students.length !== studentIds.length) {
    throw new BadRequestError('One or more learners do not belong to this school');
  }

  if (hasSchoolWideAccess(user)) return;

  const accessibleIds = new Set(await getTeacherStudentIds(user, schoolId));
  const allVisible = studentIds.every((id) => accessibleIds.has(id));
  if (!allVisible) {
    throw new ForbiddenError('You can only report incidents for learners in your classes');
  }
}

async function assertCanAccessIncident(
  user: WelfareUser,
  incident: Pick<IIncident, 'reportedBy' | 'involvedParties' | 'witnesses'>,
  schoolId: string,
): Promise<void> {
  if (hasSchoolWideAccess(user)) return;

  if (String(incident.reportedBy) === user.id) return;
  if (incident.witnesses?.some((witness) => witness.staffId && String(witness.staffId) === user.id)) return;

  const accessibleIds = new Set(await getTeacherStudentIds(user, schoolId));
  const involvedVisible = incident.involvedParties?.some((party) =>
    accessibleIds.has(String(party.studentId)),
  );
  const witnessVisible = incident.witnesses?.some((witness) =>
    witness.studentId ? accessibleIds.has(String(witness.studentId)) : false,
  );

  if (involvedVisible || witnessVisible) return;
  throw new ForbiddenError('You can only view incidents you reported or that involve learners in your classes');
}

function assertCanManageIncident(
  user: WelfareUser,
  incident: Pick<IIncident, 'reportedBy'>,
): void {
  if (hasSchoolWideAccess(user)) return;
  if (String(incident.reportedBy) === user.id) return;
  throw new ForbiddenError('Only the reporter, counselor, or school leadership can update this incident');
}

export class IncidentService {
  static async generateIncidentNumber(schoolId: string): Promise<string> {
    const year = new Date().getFullYear();
    const counter = await IncidentCounter.findOneAndUpdate(
      { schoolId: new mongoose.Types.ObjectId(schoolId), year },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    ).lean();
    const seq = String(counter.seq).padStart(5, '0');
    return `INC-${year}-${seq}`;
  }

  static async create(user: WelfareUser, data: CreateIncidentInput) {
    const schoolId = user.schoolId!;
    await assertStudentsVisible(user, schoolId, collectStudentIds(data));

    const incidentNumber = await this.generateIncidentNumber(schoolId);
    const incident = await Incident.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      reportedBy: new mongoose.Types.ObjectId(user.id),
      incidentNumber,
      status: 'reported',
      statusHistory: [{
        status: 'reported',
        date: new Date(),
        changedBy: new mongoose.Types.ObjectId(user.id),
      }],
    });
    logger.info({ incidentId: incident._id, incidentNumber }, 'Incident created');
    return incident.toObject();
  }

  static async list(user: WelfareUser, query: ListIncidentsQuery) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const schoolId = user.schoolId!;
    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };
    const andFilters: Record<string, unknown>[] = [];

    if (query.status) {
      const statuses = query.status.split(',');
      filter.status = { $in: statuses };
    }
    if (query.type) filter.type = query.type;
    if (query.severity) filter.severity = query.severity;
    if (query.studentId) {
      await assertStudentsVisible(user, schoolId, [query.studentId]);
      filter['involvedParties.studentId'] = new mongoose.Types.ObjectId(query.studentId);
    }
    if (query.dateFrom || query.dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (query.dateFrom) dateFilter.$gte = new Date(query.dateFrom);
      if (query.dateTo) dateFilter.$lte = new Date(query.dateTo);
      filter.incidentDate = dateFilter;
    }
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      andFilters.push({
        $or: [
          { title: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { incidentNumber: { $regex: escaped, $options: 'i' } },
        ],
      });
    }

    if (user.role === 'teacher' && !hasSchoolWideAccess(user) && !query.studentId) {
      const accessibleStudentIds = (await getTeacherStudentIds(user, schoolId))
        .map((id) => new mongoose.Types.ObjectId(id));
      andFilters.push({
        $or: [
          { reportedBy: new mongoose.Types.ObjectId(user.id) },
          { 'witnesses.staffId': new mongoose.Types.ObjectId(user.id) },
          { 'involvedParties.studentId': { $in: accessibleStudentIds } },
          { 'witnesses.studentId': { $in: accessibleStudentIds } },
        ],
      });
    }

    if (andFilters.length > 0) filter.$and = andFilters;

    const [items, total] = await Promise.all([
      Incident.find(filter)
        .populate('reportedBy', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName')
        .populate(studentPopulate('involvedParties.studentId'))
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Incident.countDocuments(filter),
    ]);

    return { items, total, page: query.page ?? 1, limit };
  }

  static async getById(id: string, user: WelfareUser) {
    const schoolId = user.schoolId!;
    const incident = await Incident.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate(studentPopulate('involvedParties.studentId'))
      .populate(studentPopulate('witnesses.studentId'))
      .populate('witnesses.staffId', 'firstName lastName')
      .populate('statusHistory.changedBy', 'firstName lastName')
      .lean();

    if (!incident) throw new NotFoundError('Incident not found');
    await assertCanAccessIncident(user, incident, schoolId);
    return incident;
  }

  static async update(
    id: string,
    user: WelfareUser,
    data: UpdateIncidentInput,
  ) {
    const schoolId = user.schoolId!;
    const incident = await Incident.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
    if (!incident) throw new NotFoundError('Incident not found');
    await assertCanAccessIncident(user, incident, schoolId);
    assertCanManageIncident(user, incident);

    if (data.involvedParties || data.witnesses) {
      await assertStudentsVisible(user, schoolId, collectStudentIds({
        involvedParties: data.involvedParties,
        witnesses: data.witnesses,
      }));
    }

    if (data.status && data.status !== incident.status) {
      const allowed = VALID_TRANSITIONS[incident.status];
      if (!allowed.includes(data.status)) {
        throw new BadRequestError(
          `Cannot transition from ${incident.status} to ${data.status}`,
        );
      }
      incident.statusHistory.push({
        status: data.status,
        date: new Date(),
        changedBy: new mongoose.Types.ObjectId(user.id),
        notes: data.resolutionSummary,
      } as never);
      if (data.status === 'resolved') {
        incident.resolvedAt = new Date();
      }
    }

    Object.assign(incident, data);
    await incident.save();
    return incident.toObject();
  }

  static async softDelete(id: string, user: WelfareUser) {
    const schoolId = user.schoolId!;
    const incident = await Incident.findOneAndUpdate(
      { _id: id, schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false },
      { isDeleted: true },
      { new: true },
    ).lean();
    if (!incident) throw new NotFoundError('Incident not found');
    return incident;
  }

  static async listActions(incidentId: string, user: WelfareUser) {
    const schoolId = user.schoolId!;
    const incident = await Incident.findOne({
      _id: incidentId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!incident) throw new NotFoundError('Incident not found');
    await assertCanAccessIncident(user, incident, schoolId);

    return IncidentAction.find({
      incidentId: new mongoose.Types.ObjectId(incidentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1 })
      .lean();
  }

  static async createAction(
    incidentId: string,
    user: WelfareUser,
    data: CreateActionInput,
  ) {
    const schoolId = user.schoolId!;
    const incident = await Incident.findOne({
      _id: incidentId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!incident) throw new NotFoundError('Incident not found');
    await assertCanAccessIncident(user, incident, schoolId);
    assertCanManageIncident(user, incident);

    const action = await IncidentAction.create({
      incidentId: new mongoose.Types.ObjectId(incidentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      description: data.description,
      assignedTo: new mongoose.Types.ObjectId(data.assignedToUserId),
      dueDate: new Date(data.dueDate),
      createdBy: new mongoose.Types.ObjectId(user.id),
    });
    return action.toObject();
  }

  static async updateAction(
    incidentId: string,
    actionId: string,
    user: WelfareUser,
    data: UpdateActionInput,
  ) {
    const schoolId = user.schoolId!;
    const incident = await Incident.findOne({
      _id: incidentId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!incident) throw new NotFoundError('Incident not found');
    await assertCanAccessIncident(user, incident, schoolId);
    assertCanManageIncident(user, incident);

    const update: Record<string, unknown> = { ...data };
    if (data.completedAt) update.completedAt = new Date(data.completedAt);
    const action = await IncidentAction.findOneAndUpdate(
      {
        _id: actionId,
        incidentId: new mongoose.Types.ObjectId(incidentId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      update,
      { new: true },
    )
      .populate('assignedTo', 'firstName lastName')
      .lean();
    if (!action) throw new NotFoundError('Action not found');
    return action;
  }
}

const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  reported: ['investigating'],
  investigating: ['resolved', 'escalated'],
  escalated: ['investigating', 'resolved'],
  resolved: [],
};
