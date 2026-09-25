// src/modules/Evidence/writers/test-paper.ts
//
// What a marked test's questions are (spec §2.2): the label `section.position`
// the AI echoes, and for each its question key, topic node and level.
import { AssessmentPaper, Question } from '../../QuestionBank/model.js';
import { GeneratedPaper } from '../../AITools/model.js';
import type { IPaperMarking } from '../../AITools/model-marking.js';
import type { CapsLevel, Oid, TopicFrom } from '../types.js';

export interface PaperQuestionInfo {
  questionKey: string;
  questionId: Oid | null;
  nodeId: Oid | null;
  level: CapsLevel | null;
  topicFrom: TopicFrom;
  hasOptions: boolean;
}

export interface PaperContext {
  subjectId: Oid | null;
  gradeId: Oid | null;
  questions: Map<string, PaperQuestionInfo>;
  /** The key of a question number that is not on the paper. */
  keyFor: (label: string) => string;
}

type MarkingLike = Pick<IPaperMarking, 'paperId' | 'paperType' | 'schoolId' | 'paperVersion'>;

async function assessmentContext(m: MarkingLike): Promise<PaperContext | null> {
  const paper = await AssessmentPaper.findOne({ _id: m.paperId, schoolId: m.schoolId, isDeleted: false })
    .select('sections subjectId gradeId').lean();
  if (!paper) return null;
  const bankIds = paper.sections.flatMap((s) => s.questions.map((q) => q.questionId).filter(Boolean));
  const bank = await Question.find({ _id: { $in: bankIds }, isDeleted: false, $or: [{ schoolId: m.schoolId }, { schoolId: null }] })
    .select('curriculumNodeId cognitiveLevel').lean();
  const bankById = new Map(bank.map((q) => [String(q._id), q]));
  const inlineKey = (label: string): string => `p:${String(m.paperId)}:v${m.paperVersion ?? 1}:${label}`;
  const questions = new Map<string, PaperQuestionInfo>();
  paper.sections.forEach((section, s) => {
    for (const pq of section.questions) {
      const label = `${s + 1}.${pq.position + 1}`;
      const hasOptions = (pq.options ?? []).length > 0;
      if (pq.questionId) {
        const q = bankById.get(String(pq.questionId));
        questions.set(label, {
          questionKey: `q:${String(pq.questionId)}`, questionId: pq.questionId as Oid, nodeId: (q?.curriculumNodeId as Oid | undefined) ?? null,
          level: (q?.cognitiveLevel?.caps as CapsLevel | undefined) ?? null, topicFrom: 'question', hasOptions,
        });
      } else {
        questions.set(label, {
          questionKey: inlineKey(label), questionId: null, nodeId: (pq.curriculumNodeId as Oid | null | undefined) ?? null,
          level: pq.capsLevel ?? null, topicFrom: pq.tagFrom === 'ai_tag' ? 'ai_tag' : 'paper_question', hasOptions,
        });
      }
    }
  });
  return { subjectId: paper.subjectId as Oid, gradeId: paper.gradeId as Oid, questions, keyFor: inlineKey };
}

async function generatedContext(m: MarkingLike): Promise<PaperContext | null> {
  const paper = await GeneratedPaper.findOne({ _id: m.paperId, schoolId: m.schoolId, isDeleted: false }).select('sections').lean();
  if (!paper) return null;
  const key = (label: string): string => `g:${String(m.paperId)}:${label}`;
  const questions = new Map<string, PaperQuestionInfo>();
  for (const section of paper.sections ?? []) {
    for (const q of section.questions ?? []) {
      const label = String(q.questionNumber);
      questions.set(label, { questionKey: key(label), questionId: null, nodeId: null, level: null, topicFrom: 'none', hasOptions: false });
    }
  }
  return { subjectId: null, gradeId: null, questions, keyFor: key };
}

export function loadPaperContext(m: MarkingLike): Promise<PaperContext | null> {
  return m.paperType === 'generated' ? generatedContext(m) : assessmentContext(m);
}
