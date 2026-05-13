// AI generator for assignment brief + rubric.
//
// Design intent: two-part input by convention.
//   1. Structured config (subject, grade, topic, totalMarks, lengthHint,
//      criterionCount) — gives the model the assessment shape.
//   2. `instructions` — the teacher's free-text "exactly what I want" prompt.
//      Required, minimum 10 chars. Generic prompts produce generic output;
//      forcing articulation is a feature, not a UX wart.
//
// The output is a draft the teacher edits and saves. We deliberately do NOT
// persist anything here — generate-and-return only. Persisting half-formed
// AI output leaks into the bank.

import { AIService } from '../../services/ai.service.js';
import { Subject, Grade } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { BadRequestError } from '../../common/errors.js';
import type { GenerateAssignmentInput } from './validation.js';

export interface AIGeneratedRubricCriterion {
  name: string;
  description: string;
  maxMarks: number;
}

export interface AIGeneratedAssignment {
  title: string;
  brief: string;
  rubric: AIGeneratedRubricCriterion[];
  totalMarks: number;
}

const SYSTEM_PROMPT = `You draft long-form school assignments (essays, projects, research tasks) for South African CAPS curriculum teachers. You are NOT drafting timed test papers — assignments are open-ended deliverables marked against a rubric.

You will receive:
  • Structured config: subject, grade, topic, total marks, length hint, rubric criterion count.
  • The teacher's exact instructions for what they want.

Treat the teacher's instructions as the source of truth — weave their wording into the brief verbatim where natural. Do not soften, generalise, or omit specifics they gave you.

Output JSON only. Shape:
{
  "title": "string — short, descriptive, no quotes",
  "brief": "string — markdown-formatted task description for the student. Include: purpose, exact deliverable, submission format hints, any constraints the teacher mentioned. 200-600 words.",
  "rubric": [
    {
      "name": "string — criterion name, e.g. 'Argument structure'",
      "description": "string — what the teacher is looking for, 1-2 sentences",
      "maxMarks": number
    }
  ]
}

Rubric rules:
  • Produce exactly the requested number of criteria.
  • Distribute marks so they sum EXACTLY to totalMarks. Use whole numbers.
  • Criteria should reflect the deliverable type. For an essay: thesis, evidence, structure, language. For a project: research, methodology, presentation, references. Adapt to the teacher's instructions.
  • If the teacher's instructions imply specific marking dimensions, prioritise those.

Do not include preamble, code fences, or explanation — JSON only.`;

function distributeMarks(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  const marks = new Array(count).fill(base);
  for (let i = 0; i < remainder; i += 1) marks[i] += 1;
  return marks;
}

export async function generateAssignmentDraft(
  input: GenerateAssignmentInput,
  schoolId: string,
): Promise<AIGeneratedAssignment> {
  // Resolve names for the prompt — IDs alone aren't useful to the model.
  const [subject, grade] = await Promise.all([
    Subject.findOne({ _id: input.subjectId, schoolId, isDeleted: false })
      .select('name code').lean(),
    Grade.findOne({ _id: input.gradeId, schoolId, isDeleted: false })
      .select('name').lean(),
  ]);
  if (!subject) throw new BadRequestError('Subject not found in this school.');
  if (!grade) throw new BadRequestError('Grade not found in this school.');

  let topicLabel = 'general topic';
  if (input.curriculumNodeId) {
    const node = await CurriculumNode.findOne({
      _id: input.curriculumNodeId,
      schoolId,
      isDeleted: false,
    }).select('title').lean();
    if (node?.title) topicLabel = node.title;
  }

  const lengthLine = input.lengthHint
    ? `Length hint: ${input.lengthHint} (${describeLength(input.lengthHint)}).`
    : 'Length: judge from the teacher\'s instructions.';

  const userPrompt = `Subject: ${subject.name}${subject.code ? ` (${subject.code})` : ''}
Grade: ${grade.name}
Topic: ${topicLabel}
Total marks: ${input.totalMarks}
${lengthLine}
Number of rubric criteria: ${input.criterionCount}

TEACHER'S INSTRUCTIONS — exact wording of what they want:
"""
${input.instructions.trim()}
"""

Produce the JSON now.`;

  const raw = await AIService.generateJSON<unknown>(SYSTEM_PROMPT, userPrompt);
  const draft = normaliseDraft(raw, input.totalMarks, input.criterionCount);
  return draft;
}

function describeLength(hint: NonNullable<GenerateAssignmentInput['lengthHint']>): string {
  switch (hint) {
    case 'short':   return 'worksheet-scale, 1-2 paragraphs of student output';
    case 'medium':  return 'mid-length essay or report, 500-1000 words';
    case 'long':    return 'long essay or case study, 1500-3000 words';
    case 'project': return 'multi-week project with multiple deliverables';
  }
}

interface MaybeDraft {
  title?: unknown;
  brief?: unknown;
  rubric?: unknown;
}

function normaliseDraft(
  raw: unknown,
  totalMarks: number,
  criterionCount: number,
): AIGeneratedAssignment {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestError('AI returned an unparseable response.');
  }
  const obj = raw as MaybeDraft;
  const title = typeof obj.title === 'string' && obj.title.trim().length > 0
    ? obj.title.trim()
    : 'Untitled assignment';
  const brief = typeof obj.brief === 'string' && obj.brief.trim().length > 0
    ? obj.brief.trim()
    : '';
  if (!brief) {
    throw new BadRequestError('AI did not return a brief.');
  }
  const rubricRaw = Array.isArray(obj.rubric) ? obj.rubric : [];
  const cleaned = rubricRaw
    .filter((c): c is Record<string, unknown> => c !== null && typeof c === 'object')
    .map((c) => ({
      name: typeof c.name === 'string' ? c.name.trim() : '',
      description: typeof c.description === 'string' ? c.description.trim() : '',
      maxMarks: typeof c.maxMarks === 'number' && Number.isFinite(c.maxMarks)
        ? Math.max(0, Math.round(c.maxMarks))
        : 0,
    }))
    .filter((c) => c.name.length > 0);

  // If the AI didn't produce the right number of criteria, fall back to a
  // generic skeleton that at least has correct shape — the teacher edits it.
  let rubric: AIGeneratedRubricCriterion[];
  if (cleaned.length === criterionCount) {
    rubric = cleaned;
  } else {
    const fallbackNames = [
      'Content and understanding',
      'Structure and organisation',
      'Evidence and reasoning',
      'Language and presentation',
      'Originality and insight',
      'Referencing',
      'Methodology',
      'Reflection',
      'Visual presentation',
      'Time management',
    ];
    rubric = Array.from({ length: criterionCount }, (_, i) => ({
      name: cleaned[i]?.name ?? fallbackNames[i] ?? `Criterion ${i + 1}`,
      description: cleaned[i]?.description ?? '',
      maxMarks: 0,
    }));
  }

  // Re-distribute marks to sum EXACTLY to totalMarks. The AI is unreliable
  // at arithmetic; doing it deterministically here is cheaper than retrying.
  const distributed = distributeMarks(totalMarks, criterionCount);
  rubric = rubric.map((c, i) => ({ ...c, maxMarks: distributed[i] ?? 0 }));

  return { title, brief, rubric, totalMarks };
}
