// src/modules/QuestionBank/paper-question-tags.ts
//
// An inline paper question's own topic and cognitive level (Phase E §4.2).
// Bank questions resolve both through Question. Tags are metadata: setting
// them never changes what the learner sees.
import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { BadRequestError } from '../../common/errors.js';
import type { CapsLevel, PaperQuestionTagFrom } from './model-shared.js';

type Oid = mongoose.Types.ObjectId;

export interface PaperQuestionTags {
  curriculumNodeId: Oid | null;
  capsLevel: CapsLevel | null;
  tagFrom: PaperQuestionTagFrom | null;
}

export const NO_TAGS: PaperQuestionTags = { curriculumNodeId: null, capsLevel: null, tagFrom: null };

interface TagInput { curriculumNodeId?: string | null; capsLevel?: CapsLevel | null }

/** What a teacher's add/patch leaves on the question: fields they sent replace, the rest stay. */
export function teacherTags(input: TagInput, current: PaperQuestionTags = NO_TAGS): PaperQuestionTags {
  const touched = input.curriculumNodeId !== undefined || input.capsLevel !== undefined;
  if (!touched) return current;
  const node = input.curriculumNodeId === undefined
    ? current.curriculumNodeId
    : input.curriculumNodeId === null ? null : new mongoose.Types.ObjectId(input.curriculumNodeId);
  const level = input.capsLevel === undefined ? current.capsLevel : input.capsLevel;
  return { curriculumNodeId: node, capsLevel: level, tagFrom: node || level ? 'teacher' : null };
}

/** Refuses a topic the school can't see: another school's custom node, or a deleted one. */
export async function assertVisibleNode(nodeId: string | null | undefined, schoolId: string): Promise<void> {
  if (!nodeId) return;
  const visible = await CurriculumNode.exists({
    _id: new mongoose.Types.ObjectId(nodeId),
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: new mongoose.Types.ObjectId(schoolId) }],
  });
  if (!visible) throw new BadRequestError('That curriculum topic is not available');
}

interface TaggedQuestion {
  questionId?: Oid | null;
  questionText?: string | null;
  position: number;
  curriculumNodeId?: Oid | null;
  capsLevel?: CapsLevel | null;
  tagFrom?: PaperQuestionTagFrom | null;
}

/** Same bank question, or both inline. */
const sameSource = (a: TaggedQuestion, b: TaggedQuestion): boolean => String(a.questionId ?? '') === String(b.questionId ?? '');
const sameQuestion = (a: TaggedQuestion, b: TaggedQuestion): boolean =>
  sameSource(a, b) && (a.questionText ?? null) === (b.questionText ?? null);

/** For each next question, the stored one it continues: an unchanged question anywhere, else a text edit in place. */
function storedMatches(stored: ReadonlyArray<TaggedQuestion>, next: ReadonlyArray<TaggedQuestion>): Array<TaggedQuestion | undefined> {
  const taken = new Set<TaggedQuestion>();
  const claim = (hit: TaggedQuestion | undefined): TaggedQuestion | undefined => {
    if (hit) taken.add(hit);
    return hit;
  };
  const exact = next.map((q: TaggedQuestion) => claim(stored.find((o: TaggedQuestion) => !taken.has(o) && sameQuestion(o, q))));
  return next.map((q: TaggedQuestion, i: number) => exact[i]
    ?? claim(stored.find((o: TaggedQuestion) => !taken.has(o) && o.position === q.position && sameSource(o, q))));
}

/**
 * The paper editor saves whole sections without tag fields (service-papers.ts
 * buildPaperSections). Tags change only when the teacher sets them or replaces
 * the question (orchestrator ruling): an unchanged question keeps its tags
 * wherever it moved, a text edit in place keeps them, and a question swapped
 * for another bank question (or inline for bank) starts untagged.
 */
export function carryQuestionTags<Q extends TaggedQuestion, S extends { questions: Q[] }>(
  stored: ReadonlyArray<{ questions?: ReadonlyArray<TaggedQuestion> }>,
  next: readonly S[],
): S[] {
  return next.map((section: S, s: number) => {
    const matches = storedMatches(stored[s]?.questions ?? [], section.questions);
    return {
      ...section,
      questions: section.questions.map((q: Q, i: number) => {
        const old = matches[i];
        if (q.curriculumNodeId || q.capsLevel || !old) return q;
        return { ...q, curriculumNodeId: old.curriculumNodeId ?? null, capsLevel: old.capsLevel ?? null, tagFrom: old.tagFrom ?? null };
      }),
    };
  });
}
