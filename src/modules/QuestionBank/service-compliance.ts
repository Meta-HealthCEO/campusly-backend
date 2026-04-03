import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import type { IAssessmentPaper, IQuestion, ICapsComplianceReport } from './model.js';

const TOLERANCE = 5; // ±5% tolerance for cognitive distribution

export class ComplianceService {
  static async calculateCompliance(
    paper: IAssessmentPaper,
    populatedQuestions: IQuestion[],
  ): Promise<ICapsComplianceReport> {
    const totalMarks = populatedQuestions.reduce((sum, q) => sum + q.marks, 0);
    const violations: string[] = [];

    // ── Cognitive distribution ──
    const cogMarks = { knowledge: 0, routine: 0, complex: 0, problemSolving: 0 };

    for (const q of populatedQuestions) {
      const level = q.cognitiveLevel.caps;
      if (level === 'knowledge') cogMarks.knowledge += q.marks;
      else if (level === 'routine') cogMarks.routine += q.marks;
      else if (level === 'complex') cogMarks.complex += q.marks;
      else if (level === 'problem_solving') cogMarks.problemSolving += q.marks;
    }

    const toPercent = (marks: number) =>
      totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0;

    const cognitiveDistribution = {
      knowledge: toPercent(cogMarks.knowledge),
      routine: toPercent(cogMarks.routine),
      complex: toPercent(cogMarks.complex),
      problemSolving: toPercent(cogMarks.problemSolving),
    };

    // ── Target distribution from CurriculumNode metadata ──
    const targetDistribution = await getTargetDistribution(paper.subjectId.toString());

    // ── Compare distributions ──
    const levels: Array<{ key: keyof typeof cognitiveDistribution; label: string }> = [
      { key: 'knowledge', label: 'Knowledge' },
      { key: 'routine', label: 'Routine' },
      { key: 'complex', label: 'Complex' },
      { key: 'problemSolving', label: 'Problem Solving' },
    ];

    for (const { key, label } of levels) {
      const actual = cognitiveDistribution[key];
      const target = targetDistribution[key];
      if (Math.abs(actual - target) > TOLERANCE) {
        violations.push(
          `${label}: ${actual}% (target ${target}% ±${TOLERANCE}%)`,
        );
      }
    }

    // ── Topic coverage ──
    const topicMap = new Map<string, { title: string; marks: number }>();

    for (const q of populatedQuestions) {
      const nodeId = q.curriculumNodeId.toString();
      const existing = topicMap.get(nodeId);
      if (existing) {
        existing.marks += q.marks;
      } else {
        // Attempt to get title from populated field
        const nodeDoc = q.curriculumNodeId as unknown as { title?: string };
        const title = typeof nodeDoc?.title === 'string' ? nodeDoc.title : nodeId;
        topicMap.set(nodeId, { title, marks: q.marks });
      }
    }

    const topicCoverage = Array.from(topicMap.entries()).map(
      ([nodeId, { title, marks }]) => ({
        nodeId,
        title,
        marks,
        percent: toPercent(marks),
      }),
    );

    // ── Difficulty spread ──
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const q of populatedQuestions) {
      if (q.difficulty <= 2) easy += q.marks;
      else if (q.difficulty === 3) medium += q.marks;
      else hard += q.marks;
    }

    const difficultySpread = {
      easy: toPercent(easy),
      medium: toPercent(medium),
      hard: toPercent(hard),
    };

    const compliant = violations.length === 0;

    return {
      topicCoverage,
      cognitiveDistribution,
      targetDistribution,
      compliant,
      violations,
      difficultySpread,
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getTargetDistribution(subjectId: string) {
  // Look for a subject-level curriculum node with cognitive weighting metadata
  const subjectNode = await CurriculumNode.findOne({
    _id: new mongoose.Types.ObjectId(subjectId),
    isDeleted: false,
  }).lean();

  // Fall back: try finding a subject-type node that references this subject
  const fallbackNode = subjectNode ?? await CurriculumNode.findOne({
    type: 'subject',
    isDeleted: false,
    'metadata.cognitiveWeighting': { $ne: null },
  }).lean();

  const weighting = fallbackNode?.metadata?.cognitiveWeighting;

  if (weighting) {
    return {
      knowledge: weighting.knowledge,
      routine: weighting.routine,
      complex: weighting.complex,
      problemSolving: weighting.problemSolving,
    };
  }

  // Default CAPS distribution if no metadata is available
  return {
    knowledge: 20,
    routine: 35,
    complex: 30,
    problemSolving: 15,
  };
}
