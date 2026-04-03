import mongoose from 'mongoose';
import { CurriculumFramework } from '../TeacherWorkbench/model.js';
import { ConflictError } from '../../common/errors.js';
import type { CreateFrameworkInput } from './validation.js';

export class FrameworksService {
  static async listFrameworks(schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const frameworks = await CurriculumFramework.find({
      $or: [{ schoolId: null }, { schoolId: soid }],
      isDeleted: false,
    })
      .sort({ isDefault: -1, name: 1 })
      .lean();
    return frameworks;
  }

  static async createFramework(schoolId: string, userId: string, data: CreateFrameworkInput) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const existing = await CurriculumFramework.findOne({
      schoolId: soid,
      name: data.name,
      isDeleted: false,
    }).lean();
    if (existing) {
      throw new ConflictError(`A framework named "${data.name}" already exists`);
    }
    const framework = await CurriculumFramework.create({
      schoolId: soid,
      name: data.name,
      description: data.description,
      isDefault: false,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return framework.toObject();
  }
}
