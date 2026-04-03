import mongoose from 'mongoose';
import { ContentResource } from './model.js';
import type { IContentBlock } from './model.js';
import { StudentAttempt, StudentMastery } from './model-tracking.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import type { SubmitAttemptInput } from './validation-student.js';

// ─── CAPS cognitive level → breakdown key mapping ───────────────────────────

const CAPS_LEVEL_MAP: Record<string, keyof typeof DEFAULT_BREAKDOWN> = {
  knowledge: 'knowledge',
  routine: 'routine',
  'routine procedures': 'routine',
  complex: 'complex',
  'complex procedures': 'complex',
  'problem solving': 'problemSolving',
  'problem-solving': 'problemSolving',
};

const DEFAULT_BREAKDOWN = {
  knowledge: 0,
  routine: 0,
  complex: 0,
  problemSolving: 0,
} as const;

// ─── Auto-grading helpers ───────────────────────────────────────────────────

interface GradeResult {
  correct: boolean;
  score: number;
  maxScore: number;
}

function normalise(s: string): string {
  return s.trim().toLowerCase();
}

function gradeQuiz(content: string, response: string, points: number): GradeResult {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const type = parsed.type as string | undefined;
    const maxScore = points;

    if (type === 'mcq') {
      const options = parsed.options as Array<{ label: string; isCorrect?: boolean }> | undefined;
      const correctOption = options?.find((o) => o.isCorrect);
      const correct = correctOption ? normalise(response) === normalise(correctOption.label) : false;
      return { correct, score: correct ? maxScore : 0, maxScore };
    }

    if (type === 'true_false') {
      const correctAnswer = parsed.correctAnswer as string | undefined;
      const correct = correctAnswer ? normalise(response) === normalise(correctAnswer) : false;
      return { correct, score: correct ? maxScore : 0, maxScore };
    }

    if (type === 'short_answer') {
      const correctAnswer = parsed.correctAnswer as string | undefined;
      const correct = correctAnswer ? normalise(response) === normalise(correctAnswer) : false;
      return { correct, score: correct ? maxScore : 0, maxScore };
    }

    return { correct: false, score: 0, maxScore };
  } catch {
    return { correct: false, score: 0, maxScore: points };
  }
}

function gradeFillBlank(content: string, response: string, points: number): GradeResult {
  try {
    const parsed = JSON.parse(content) as {
      blanks?: string[];
      acceptAlternatives?: string[][];
    };
    const blanks = parsed.blanks ?? [];
    const alternatives = parsed.acceptAlternatives ?? [];
    let answers: string[];
    try {
      const responseArr = JSON.parse(response);
      answers = (Array.isArray(responseArr) ? responseArr : [response]).map((s: unknown) => normalise(String(s)));
    } catch {
      answers = response.split(',').map((s) => normalise(s));
    }
    const maxScore = points;

    let allCorrect = true;
    for (let i = 0; i < blanks.length; i++) {
      const expected = normalise(blanks[i] ?? '');
      const alts = (alternatives[i] ?? []).map(normalise);
      const given = answers[i] ?? '';
      if (given !== expected && !alts.includes(given)) {
        allCorrect = false;
        break;
      }
    }

    return { correct: allCorrect, score: allCorrect ? maxScore : 0, maxScore };
  } catch {
    return { correct: false, score: 0, maxScore: points };
  }
}

function gradeMatchColumns(content: string, response: string, points: number): GradeResult {
  try {
    const parsed = JSON.parse(content) as { correctPairs?: number[][] };
    const correctPairs = parsed.correctPairs ?? [];
    const responsePairs = JSON.parse(response) as number[][];
    const maxScore = points;

    if (correctPairs.length !== responsePairs.length) {
      return { correct: false, score: 0, maxScore };
    }

    const sortedCorrect = correctPairs.map((p) => p.join(',')).sort();
    const sortedResponse = responsePairs.map((p) => p.join(',')).sort();
    const correct = sortedCorrect.every((v, i) => v === sortedResponse[i]);

    return { correct, score: correct ? maxScore : 0, maxScore };
  } catch {
    return { correct: false, score: 0, maxScore: points };
  }
}

function gradeOrdering(content: string, response: string, points: number): GradeResult {
  try {
    const parsed = JSON.parse(content) as { correctOrder?: number[] };
    const correctOrder = parsed.correctOrder ?? [];
    const responseOrder = JSON.parse(response) as number[];
    const maxScore = points;
    const correct =
      correctOrder.length === responseOrder.length &&
      correctOrder.every((v, i) => v === responseOrder[i]);

    return { correct, score: correct ? maxScore : 0, maxScore };
  } catch {
    return { correct: false, score: 0, maxScore: points };
  }
}

function gradeDragDrop(content: string, response: string, points: number): GradeResult {
  // Same structure as match_columns — correct placements
  return gradeMatchColumns(content, response, points);
}

function gradeBlock(block: IContentBlock, response: string): GradeResult {
  const points = block.points || 1;

  switch (block.type) {
    case 'quiz':
      return gradeQuiz(block.content, response, points);
    case 'fill_blank':
      return gradeFillBlank(block.content, response, points);
    case 'match_columns':
      return gradeMatchColumns(block.content, response, points);
    case 'ordering':
      return gradeOrdering(block.content, response, points);
    case 'drag_drop':
      return gradeDragDrop(block.content, response, points);
    case 'text':
    case 'image':
    case 'video':
    case 'step_reveal':
      // Informational blocks — always "correct"
      return { correct: true, score: points, maxScore: points };
    case 'hotspot':
    case 'code':
      // Not auto-graded
      return { correct: false, score: 0, maxScore: points };
    default:
      return { correct: false, score: 0, maxScore: points };
  }
}

// ─── Service ────────────────────────────────────────────────────────────────

export class AttemptsService {
  static async submitAttempt(
    studentId: string,
    schoolId: string,
    resourceId: string,
    data: SubmitAttemptInput,
  ) {
    const soid = new mongoose.Types.ObjectId(studentId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const resourceOid = new mongoose.Types.ObjectId(resourceId);
    const nodeOid = new mongoose.Types.ObjectId(data.curriculumNodeId);

    // 1. Fetch resource + find block
    const resource = await ContentResource.findOne({
      _id: resourceOid,
      isDeleted: false,
      status: 'approved',
      $or: [{ schoolId: null }, { schoolId: schoolOid }],
    }).lean();

    if (!resource) throw new NotFoundError('Content resource not found');

    const block = resource.blocks.find((b) => b.blockId === data.blockId);
    if (!block) throw new BadRequestError('Block not found in resource');

    // 2. Auto-grade
    const result = gradeBlock(block, data.response);

    // 3. Calculate attempt number
    const prevAttempts = await StudentAttempt.countDocuments({
      studentId: soid,
      contentResourceId: resourceOid,
      blockId: data.blockId,
    });
    const attemptNumber = prevAttempts + 1;

    // 4. Save attempt
    const attempt = await StudentAttempt.create({
      studentId: soid,
      contentResourceId: resourceOid,
      blockId: data.blockId,
      curriculumNodeId: nodeOid,
      cognitiveLevel: block.cognitiveLevel
        ? { caps: block.cognitiveLevel.caps ?? '', blooms: block.cognitiveLevel.blooms ?? '' }
        : null,
      correct: result.correct,
      score: result.score,
      maxScore: result.maxScore,
      timeSpentSeconds: data.timeSpentSeconds,
      hintsUsed: data.hintsUsed,
      attemptNumber,
      response: data.response,
      schoolId: schoolOid,
    });

    // 5. Update mastery
    const mastery = await StudentMastery.findOneAndUpdate(
      { studentId: soid, curriculumNodeId: nodeOid, schoolId: schoolOid },
      {
        $inc: { attemptCount: 1, correctCount: result.correct ? 1 : 0 },
        $set: { lastAttemptAt: new Date() },
      },
      { upsert: true, new: true },
    );

    // Recalculate mastery level
    const masteryLevel =
      mastery.attemptCount > 0
        ? Math.round((mastery.correctCount / mastery.attemptCount) * 100)
        : 0;

    // Update cognitive breakdown based on CAPS level
    const rawBreakdown = mastery.cognitiveBreakdown ?? DEFAULT_BREAKDOWN;
    const breakdown = {
      knowledge: rawBreakdown.knowledge ?? 0,
      routine: rawBreakdown.routine ?? 0,
      complex: rawBreakdown.complex ?? 0,
      problemSolving: rawBreakdown.problemSolving ?? 0,
    };
    if (block.cognitiveLevel?.caps) {
      const key = CAPS_LEVEL_MAP[normalise(block.cognitiveLevel.caps)];
      if (key) {
        // Running average: weight new result into existing score
        const oldScore = breakdown[key] ?? 0;
        const newScore = result.correct ? 100 : 0;
        breakdown[key] = Math.round((oldScore + newScore) / 2);
      }
    }

    await StudentMastery.findOneAndUpdate(
      { studentId: soid, curriculumNodeId: nodeOid, schoolId: schoolOid },
      { $set: { masteryLevel, cognitiveBreakdown: breakdown } },
    );

    return attempt.toObject();
  }
}
