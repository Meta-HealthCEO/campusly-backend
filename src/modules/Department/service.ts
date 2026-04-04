import mongoose from 'mongoose';
import { Department, TeacherObservation } from './model.js';
import type { IDepartment, ITeacherObservation } from './model.js';
import type { CreateDepartmentInput, UpdateDepartmentInput } from './validation.js';
import type { CreateObservationInput, UpdateObservationInput } from './validation.js';
import { User } from '../Auth/model.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';

export class DepartmentService {
  // ─── Department CRUD ─────────────────────────────────────────────────────

  static async createDepartment(
    schoolId: string,
    data: CreateDepartmentInput,
  ): Promise<IDepartment> {
    const existing = await Department.findOne({
      schoolId,
      name: data.name,
      isDeleted: false,
    }).lean().exec();
    if (existing) throw new ConflictError('Department with this name already exists');

    const dept = await Department.create({ ...data, schoolId });

    // If HOD assigned, update User record
    if (data.hodUserId) {
      await User.findByIdAndUpdate(data.hodUserId, {
        isHOD: true,
        departmentId: dept._id,
      });
    }

    return dept;
  }

  static async listDepartments(schoolId: string): Promise<IDepartment[]> {
    return Department.find({ schoolId, isDeleted: false })
      .populate('subjectIds', 'name code')
      .populate('hodUserId', 'firstName lastName email')
      .lean()
      .exec() as Promise<IDepartment[]>;
  }

  static async getDepartmentById(
    id: string,
    schoolId: string,
  ): Promise<IDepartment> {
    const dept = await Department.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectIds', 'name code')
      .populate('hodUserId', 'firstName lastName email')
      .lean()
      .exec();
    if (!dept) throw new NotFoundError('Department not found');
    return dept as IDepartment;
  }

  static async updateDepartment(
    id: string,
    schoolId: string,
    data: UpdateDepartmentInput,
  ): Promise<IDepartment> {
    const dept = await Department.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true },
    )
      .populate('subjectIds', 'name code')
      .populate('hodUserId', 'firstName lastName email')
      .lean()
      .exec();
    if (!dept) throw new NotFoundError('Department not found');

    // If HOD changed, update both old and new User records
    if (data.hodUserId !== undefined) {
      // Clear old HOD
      await User.updateMany(
        { departmentId: new mongoose.Types.ObjectId(id), isHOD: true },
        { isHOD: false, departmentId: null },
      );
      // Set new HOD
      if (data.hodUserId) {
        await User.findByIdAndUpdate(data.hodUserId, {
          isHOD: true,
          departmentId: new mongoose.Types.ObjectId(id),
        });
      }
    }

    return dept as IDepartment;
  }

  static async deleteDepartment(id: string, schoolId: string): Promise<void> {
    const dept = await Department.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true, isActive: false } },
    ).lean().exec();
    if (!dept) throw new NotFoundError('Department not found');

    // Clear HOD flag on the user
    if (dept.hodUserId) {
      await User.findByIdAndUpdate(dept.hodUserId, {
        isHOD: false,
        departmentId: null,
      });
    }
  }

  // ─── Observation CRUD ────────────────────────────────────────────────────

  static async createObservation(
    departmentId: string,
    schoolId: string,
    observerId: string,
    data: CreateObservationInput,
  ): Promise<ITeacherObservation> {
    return TeacherObservation.create({
      ...data,
      schoolId,
      departmentId,
      observerId,
    });
  }

  static async listObservations(
    departmentId: string,
    schoolId: string,
    filters: { teacherId?: string; status?: string; page?: number; limit?: number },
  ): Promise<{ items: ITeacherObservation[]; total: number }> {
    const query: Record<string, unknown> = {
      schoolId,
      departmentId,
      isDeleted: false,
    };
    if (filters.teacherId) query.teacherId = filters.teacherId;
    if (filters.status) query.status = filters.status;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [items, total] = await Promise.all([
      TeacherObservation.find(query)
        .populate('teacherId', 'firstName lastName email')
        .populate('observerId', 'firstName lastName email')
        .populate('classId', 'name')
        .populate('subjectId', 'name')
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      TeacherObservation.countDocuments(query),
    ]);
    return { items: items as ITeacherObservation[], total };
  }

  static async updateObservation(
    observationId: string,
    departmentId: string,
    schoolId: string,
    data: UpdateObservationInput,
  ): Promise<ITeacherObservation> {
    const obs = await TeacherObservation.findOneAndUpdate(
      { _id: observationId, departmentId, schoolId, isDeleted: false },
      { $set: data },
      { new: true },
    )
      .populate('teacherId', 'firstName lastName email')
      .populate('observerId', 'firstName lastName email')
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .lean()
      .exec();
    if (!obs) throw new NotFoundError('Observation not found');
    return obs as ITeacherObservation;
  }

  static async deleteObservation(
    observationId: string,
    departmentId: string,
    schoolId: string,
  ): Promise<void> {
    const obs = await TeacherObservation.findOneAndUpdate(
      { _id: observationId, departmentId, schoolId, isDeleted: false },
      { $set: { isDeleted: true, status: 'cancelled' } },
    ).lean().exec();
    if (!obs) throw new NotFoundError('Observation not found');
  }

  // ─── Helper: Get teacher IDs for a department ────────────────────────────

  static async getDepartmentTeacherIds(
    departmentId: string,
    schoolId: string,
  ): Promise<string[]> {
    const users = await User.find({
      schoolId,
      departmentId: new mongoose.Types.ObjectId(departmentId),
      isDeleted: false,
      isActive: true,
    })
      .select('_id')
      .lean()
      .exec();

    // Also include the HOD themselves
    const dept = await Department.findOne({
      _id: departmentId,
      schoolId,
      isDeleted: false,
    }).select('hodUserId').lean().exec();

    const ids = new Set(users.map((u) => u._id.toString()));
    if (dept?.hodUserId) ids.add(dept.hodUserId.toString());
    return Array.from(ids);
  }
}
