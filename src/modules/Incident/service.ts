import mongoose from 'mongoose';
import {
  Incident, IncidentAction, IncidentCounter,
  type IncidentStatus,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type {
  CreateIncidentInput, UpdateIncidentInput,
  CreateActionInput, UpdateActionInput,
} from './validation.js';

// Valid status transitions
const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  reported: ['investigating'],
  investigating: ['resolved', 'escalated'],
  escalated: ['investigating', 'resolved'],
  resolved: [],
};

interface ListIncidentsQuery {
  schoolId: string;
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

export class IncidentService {
  // ─── Number Generation ─────────────────────────────────────────────────

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

  // ─── CRUD ──────────────────────────────────────────────────────────────

  static async create(
    schoolId: string,
    reportedBy: string,
    data: CreateIncidentInput,
  ) {
    const incidentNumber = await this.generateIncidentNumber(schoolId);
    const incident = await Incident.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      reportedBy: new mongoose.Types.ObjectId(reportedBy),
      incidentNumber,
      status: 'reported',
      statusHistory: [{ status: 'reported', date: new Date(), changedBy: new mongoose.Types.ObjectId(reportedBy) }],
    });
    logger.info({ incidentId: incident._id, incidentNumber }, 'Incident created');
    return incident.toObject();
  }

  static async list(query: ListIncidentsQuery) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(query.schoolId),
      isDeleted: false,
    };

    if (query.status) {
      const statuses = query.status.split(',');
      filter.status = { $in: statuses };
    }
    if (query.type) filter.type = query.type;
    if (query.severity) filter.severity = query.severity;
    if (query.studentId) {
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
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { incidentNumber: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Incident.find(filter)
        .populate('reportedBy', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Incident.countDocuments(filter),
    ]);

    return { items, total, page: query.page ?? 1, limit };
  }

  static async getById(id: string, schoolId: string) {
    const incident = await Incident.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('involvedParties.studentId', 'admissionNumber')
      .populate('witnesses.studentId', 'admissionNumber')
      .populate('witnesses.staffId', 'firstName lastName')
      .populate('statusHistory.changedBy', 'firstName lastName')
      .lean();

    if (!incident) throw new NotFoundError('Incident not found');
    return incident;
  }

  static async update(
    id: string, schoolId: string, userId: string,
    data: UpdateIncidentInput,
  ) {
    const incident = await Incident.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
    if (!incident) throw new NotFoundError('Incident not found');

    // Validate status transition
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
        changedBy: new mongoose.Types.ObjectId(userId),
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

  static async softDelete(id: string, schoolId: string) {
    const incident = await Incident.findOneAndUpdate(
      { _id: id, schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false },
      { isDeleted: true },
      { new: true },
    ).lean();
    if (!incident) throw new NotFoundError('Incident not found');
    return incident;
  }

  // ─── Actions ───────────────────────────────────────────────────────────

  static async listActions(incidentId: string, schoolId: string) {
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
    incidentId: string, schoolId: string, userId: string,
    data: CreateActionInput,
  ) {
    // Verify incident exists and belongs to school
    const incident = await Incident.findOne({
      _id: incidentId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!incident) throw new NotFoundError('Incident not found');

    const action = await IncidentAction.create({
      incidentId: new mongoose.Types.ObjectId(incidentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      description: data.description,
      assignedTo: new mongoose.Types.ObjectId(data.assignedToUserId),
      dueDate: new Date(data.dueDate),
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return action.toObject();
  }

  static async updateAction(
    incidentId: string, actionId: string, schoolId: string,
    data: UpdateActionInput,
  ) {
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
