import mongoose from 'mongoose';
import { Question, AssessmentPaper } from './model.js';
import type { IQuestion } from './model.js';
import { ComplianceService } from './service-compliance.js';
import { BadRequestError } from '../../common/errors.js';
import {
  selectQuestions,
  generateMissingQuestions,
  organiseSections,
} from './service-paper-gen-helpers.js';
import type { CognitiveWeighting } from './service-paper-gen-helpers.js';
import type { GeneratePaperInput } from './validation.js';

const DAILY_LIMIT = 20;

const DEFAULT_WEIGHTING: CognitiveWeighting = {
  knowledge: 20,
  routine: 35,
  complex: 30,
  problemSolving: 15,
};

export class PaperGenerationService {
  static async generatePaper(
    schoolId: string,
    userId: string,
    data: GeneratePaperInput,
  ) {
    // ── Rate limit: 20 AI generations per day per teacher ──
    await enforceRateLimit(userId);

    const soid = new mongoose.Types.ObjectId(schoolId);
    const suboid = new mongoose.Types.ObjectId(data.subjectId);
    const groid = new mongoose.Types.ObjectId(data.gradeId);
    const weighting = data.cognitiveWeighting ?? DEFAULT_WEIGHTING;

    // ── Fetch approved questions matching criteria ──
    const baseFilter: Record<string, unknown> = {
      subjectId: suboid,
      gradeId: groid,
      isDeleted: false,
      status: 'approved',
      $or: [{ schoolId: null }, { schoolId: soid }],
    };

    if (data.topicNodeIds.length > 0) {
      baseFilter.curriculumNodeId = {
        $in: data.topicNodeIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const bankQuestions = await Question.find(baseFilter)
      .populate({ path: 'curriculumNodeId', select: 'title code type' })
      .lean() as IQuestion[];

    // ── Select questions that fit target marks + cognitive weighting ──
    const selected = selectQuestions(bankQuestions, data.totalMarks, weighting, data.difficulty);
    const selectedMarks = selected.reduce((sum, q) => sum + q.marks, 0);
    const deficit = data.totalMarks - selectedMarks;

    // ── Generate missing questions via AI if needed ──
    let allQuestions = [...selected];
    if (deficit > 0) {
      const generated = await generateMissingQuestions(
        schoolId, userId, data, weighting, deficit, selected,
      );
      allQuestions = [...selected, ...generated];
    }

    if (allQuestions.length === 0) {
      throw new BadRequestError('Could not find or generate any questions for these criteria');
    }

    // ── Organise into sections by question type ──
    const sections = organiseSections(allQuestions);

    // ── Build title ──
    const paperTypeLabel = data.paperType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const title = `Grade ${data.gradeId} – ${paperTypeLabel} – Term ${data.term} ${data.year}`;

    // ── Create the paper ──
    const actualTotal = allQuestions.reduce((sum, q) => sum + q.marks, 0);

    const paper = await AssessmentPaper.create({
      schoolId: soid,
      title,
      subjectId: suboid,
      gradeId: groid,
      term: data.term,
      year: data.year,
      paperType: data.paperType,
      totalMarks: actualTotal,
      duration: data.duration,
      sections,
      instructions: data.instructions,
      capsCompliance: null,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // ── Increment usage counts ──
    const questionIds = allQuestions.map((q) => q._id);
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $inc: { usageCount: 1 } },
    );

    // ── Run compliance check ──
    const compliance = await ComplianceService.calculateCompliance(
      paper,
      allQuestions as IQuestion[],
    );
    paper.capsCompliance = compliance;
    await paper.save();

    return paper.toObject();
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function enforceRateLimit(userId: string): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await AssessmentPaper.countDocuments({
    createdBy: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startOfDay },
    isDeleted: false,
  });

  if (todayCount >= DAILY_LIMIT) {
    throw new BadRequestError(
      `Daily paper generation limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
    );
  }
}
