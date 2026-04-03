import mongoose from 'mongoose';
import { CurriculumPlan, PacingUpdate, CurriculumIntervention } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { computePacingMetrics } from './service-plans.js';
import type { SubmitProgressInput } from './validation.js';

// Threshold: trigger intervention when more than 2 weeks behind
const WEEKS_BEHIND_THRESHOLD = 2;
const WEEK_DAYS = 7;

export class ProgressService {
  static async submitProgress(
    planId: string,
    schoolId: string,
    teacherId: string,
    data: SubmitProgressInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const planOid = new mongoose.Types.ObjectId(planId);
    const teacherOid = new mongoose.Types.ObjectId(teacherId);

    const plan = await CurriculumPlan.findOne({
      _id: planOid,
      schoolId: soid,
      isDeleted: false,
    });
    if (!plan) throw new NotFoundError('Curriculum plan not found');

    // Apply topic updates to the embedded topics array
    for (const update of data.topicUpdates) {
      const topicOid = new mongoose.Types.ObjectId(update.topicId);
      const topic = plan.topics.find((t) => String(t._id) === String(topicOid));
      if (!topic) continue;
      topic.status = update.status as typeof topic.status;
      topic.percentComplete = update.percentComplete;
      if (update.completedDate) {
        topic.completedDate = new Date(update.completedDate);
      } else if (update.status === 'completed' && !topic.completedDate) {
        topic.completedDate = new Date();
      }
    }

    await plan.save();

    // Create pacing update record
    const pacingUpdate = await PacingUpdate.create({
      planId: planOid,
      teacherId: teacherOid,
      schoolId: soid,
      weekEnding: new Date(data.weekEnding),
      topicUpdates: data.topicUpdates.map((u) => ({
        topicId: new mongoose.Types.ObjectId(u.topicId),
        status: u.status,
        completedDate: u.completedDate ? new Date(u.completedDate) : null,
        percentComplete: u.percentComplete,
        notes: u.notes ?? '',
      })),
      overallNotes: data.overallNotes ?? '',
      challengesFaced: data.challengesFaced ?? '',
      plannedContentDelivered: data.plannedContentDelivered ?? 0,
    });

    // Recalculate pacing and check for intervention trigger
    const updatedPlan = await CurriculumPlan.findOne({ _id: planOid, schoolId: soid }).lean();
    if (!updatedPlan) return pacingUpdate.toObject();

    const { pacingPercent, expectedPercent } = computePacingMetrics(updatedPlan.topics);

    // Calculate weeks behind: each topic ≈ proportional to week coverage
    const weeksBehindDecimal = (expectedPercent - pacingPercent) / 100 * updatedPlan.topics.length;
    const weeksBehind = Math.round(weeksBehindDecimal);

    if (weeksBehind >= WEEKS_BEHIND_THRESHOLD) {
      // Check if there is already an active intervention for this plan
      const existingIntervention = await CurriculumIntervention.findOne({
        planId: planOid,
        schoolId: soid,
        status: 'active',
        isDeleted: false,
      }).lean();

      if (!existingIntervention) {
        await CurriculumIntervention.create({
          planId: planOid,
          teacherId: teacherOid,
          schoolId: soid,
          reason: `Pacing ${weeksBehind} week(s) behind schedule`,
          weeksBehind,
          pacingPercent,
          expectedPercent,
          status: 'active',
        });
      } else {
        // Update the existing intervention with current figures
        await CurriculumIntervention.findOneAndUpdate(
          { _id: existingIntervention._id },
          { $set: { weeksBehind, pacingPercent, expectedPercent } },
        );
      }
    } else {
      // Auto-resolve active intervention if now on track
      await CurriculumIntervention.updateMany(
        { planId: planOid, schoolId: soid, status: 'active', isDeleted: false },
        { $set: { status: 'resolved', resolvedAt: new Date(), resolvedBy: teacherOid } },
      );
    }

    const weekMs = WEEK_DAYS * 24 * 60 * 60 * 1000;
    void weekMs; // used for documentation purposes only

    return pacingUpdate.toObject();
  }

  static async listProgress(
    planId: string,
    schoolId: string,
    filters: { page?: number; limit?: number },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const planOid = new mongoose.Types.ObjectId(planId);

    const plan = await CurriculumPlan.findOne({
      _id: planOid,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!plan) throw new NotFoundError('Curriculum plan not found');

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [updates, total] = await Promise.all([
      PacingUpdate.find({ planId: planOid, schoolId: soid, isDeleted: false })
        .sort({ weekEnding: -1 })
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'firstName lastName')
        .lean(),
      PacingUpdate.countDocuments({ planId: planOid, schoolId: soid, isDeleted: false }),
    ]);

    return { updates, total, page: filters.page ?? 1, limit };
  }
}
