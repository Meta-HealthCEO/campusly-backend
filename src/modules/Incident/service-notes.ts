import mongoose from 'mongoose';
import { ConfidentialNote } from './model.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import type { CreateNoteInput, UpdateNoteInput } from './validation.js';

export class ConfidentialNoteService {
  static async list(incidentId: string, schoolId: string) {
    return ConfidentialNote.find({
      incidentId: new mongoose.Types.ObjectId(incidentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async create(
    incidentId: string,
    schoolId: string,
    userId: string,
    data: CreateNoteInput,
  ) {
    const note = await ConfidentialNote.create({
      incidentId: new mongoose.Types.ObjectId(incidentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      createdBy: new mongoose.Types.ObjectId(userId),
      content: data.content,
    });
    return note.toObject();
  }

  static async update(
    incidentId: string,
    noteId: string,
    schoolId: string,
    userId: string,
    data: UpdateNoteInput,
  ) {
    const note = await ConfidentialNote.findOne({
      _id: noteId,
      incidentId: new mongoose.Types.ObjectId(incidentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();

    if (!note) throw new NotFoundError('Confidential note not found');

    // Only the original author can edit
    if (note.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the original author can edit this note');
    }

    const updated = await ConfidentialNote.findByIdAndUpdate(
      noteId,
      { content: data.content },
      { new: true },
    )
      .populate('createdBy', 'firstName lastName')
      .lean();

    return updated;
  }
}
