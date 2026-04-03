import mongoose from 'mongoose';
import { Question } from './model.js';
import type { IQuestion, QuestionType, CapsLevel, IPaperSection } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import type { GeneratePaperInput } from './validation.js';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CognitiveWeighting {
  knowledge: number;
  routine: number;
  complex: number;
  problemSolving: number;
}

interface ParsedGenQuestion {
  stem: string;
  type: QuestionType;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
  answer: string;
  markingRubric: string;
  marks: number;
  capsLevel: CapsLevel;
}

const CAPS_TO_QUERY: Record<string, CapsLevel> = {
  knowledge: 'knowledge',
  routine: 'routine',
  complex: 'complex',
  problemSolving: 'problem_solving',
};

const SECTION_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True or False',
  short_answer: 'Short Answer',
  structured: 'Structured Questions',
  essay: 'Essay Questions',
  match: 'Matching',
  fill_blank: 'Fill in the Blank',
  calculation: 'Calculations',
  diagram_label: 'Diagram Labelling',
  case_study: 'Case Study',
};

// ─── Question Selection ────────────────────────────────────────────────────

export function selectQuestions(
  questions: IQuestion[],
  targetMarks: number,
  weighting: CognitiveWeighting,
  difficulty: string,
): IQuestion[] {
  const targets: Record<string, number> = {
    knowledge: Math.round((weighting.knowledge / 100) * targetMarks),
    routine: Math.round((weighting.routine / 100) * targetMarks),
    complex: Math.round((weighting.complex / 100) * targetMarks),
    problemSolving: Math.round((weighting.problemSolving / 100) * targetMarks),
  };

  const sorted = [...questions].sort((a, b) => {
    if (difficulty === 'easy') return a.difficulty - b.difficulty;
    if (difficulty === 'challenging') return b.difficulty - a.difficulty;
    return Math.abs(a.difficulty - 3) - Math.abs(b.difficulty - 3);
  });

  const selected: IQuestion[] = [];
  const allocated: Record<string, number> = {
    knowledge: 0, routine: 0, complex: 0, problemSolving: 0,
  };
  let totalAllocated = 0;

  for (const q of sorted) {
    if (totalAllocated >= targetMarks) break;
    const capsKey = q.cognitiveLevel.caps === 'problem_solving'
      ? 'problemSolving' : q.cognitiveLevel.caps;
    const target = targets[capsKey] ?? 0;
    if (allocated[capsKey] < target && totalAllocated + q.marks <= targetMarks) {
      selected.push(q);
      allocated[capsKey] += q.marks;
      totalAllocated += q.marks;
    }
  }

  for (const q of sorted) {
    if (totalAllocated >= targetMarks) break;
    if (selected.includes(q)) continue;
    if (totalAllocated + q.marks <= targetMarks) {
      selected.push(q);
      totalAllocated += q.marks;
    }
  }

  return selected;
}

// ─── AI Generation of Missing Questions ────────────────────────────────────

export async function generateMissingQuestions(
  schoolId: string,
  userId: string,
  data: GeneratePaperInput,
  weighting: CognitiveWeighting,
  deficit: number,
  existingQuestions: IQuestion[],
): Promise<IQuestion[]> {
  const existingMarks: Record<string, number> = {
    knowledge: 0, routine: 0, complex: 0, problemSolving: 0,
  };
  for (const q of existingQuestions) {
    const key = q.cognitiveLevel.caps === 'problem_solving'
      ? 'problemSolving' : q.cognitiveLevel.caps;
    existingMarks[key] += q.marks;
  }

  let topicContext = 'General curriculum topic';
  if (data.topicNodeIds.length > 0) {
    const node = await CurriculumNode.findOne({
      _id: new mongoose.Types.ObjectId(data.topicNodeIds[0]),
      isDeleted: false,
    }).lean();
    if (node) topicContext = `${node.title}${node.description ? ` — ${node.description}` : ''}`;
  }

  const neededLevels = Object.entries(weighting)
    .filter(([key]) => {
      const target = Math.round((weighting[key as keyof CognitiveWeighting] / 100) * data.totalMarks);
      return existingMarks[key] < target;
    })
    .map(([key, pct]) => {
      const target = Math.round((pct / 100) * data.totalMarks);
      const remaining = target - existingMarks[key];
      return { key, capsLevel: CAPS_TO_QUERY[key] ?? ('routine' as CapsLevel), marks: Math.max(remaining, 0) };
    })
    .filter((l) => l.marks > 0);

  if (neededLevels.length === 0) {
    neededLevels.push({ key: 'routine', capsLevel: 'routine' as CapsLevel, marks: deficit });
  }

  const aiResponse = await callAIForQuestions(topicContext, deficit, neededLevels, data.difficulty);
  const parsed = parseGeneratedQuestions(aiResponse);
  if (parsed.length === 0) return [];

  return saveGeneratedQuestions(parsed, schoolId, userId, data);
}

async function callAIForQuestions(
  topicContext: string,
  deficit: number,
  neededLevels: Array<{ capsLevel: CapsLevel; marks: number }>,
  difficulty: string,
): Promise<string> {
  const systemPrompt = [
    'You are an expert assessment question creator for South African CAPS curriculum.',
    'Respond ONLY with a valid JSON array of question objects.',
    'Each object: { "stem": string, "type": "mcq"|"structured"|"short_answer", "options": [{label,text,isCorrect}] (4 options for MCQ, empty for others),',
    '"answer": string, "markingRubric": string, "marks": number, "capsLevel": "knowledge"|"routine"|"complex"|"problem_solving" }',
  ].join(' ');

  const levelDetails = neededLevels.map((l) => `${l.capsLevel}: ~${l.marks} marks`).join(', ');
  const userPrompt = [
    `Generate questions totalling approximately ${deficit} marks for:`,
    `Topic: ${topicContext}`,
    `Cognitive levels needed: ${levelDetails}`,
    `Difficulty preference: ${difficulty}`,
    `Mix of question types: MCQ (1-2 marks each), structured (3-5 marks), short answer (2-3 marks).`,
    `Ensure total marks across all questions is close to ${deficit}.`,
  ].join('\n');

  return AIService.generateCompletion(systemPrompt, userPrompt, {
    maxTokens: 4096,
    temperature: 0.7,
  });
}

async function saveGeneratedQuestions(
  parsed: ParsedGenQuestion[],
  schoolId: string,
  userId: string,
  data: GeneratePaperInput,
): Promise<IQuestion[]> {
  const soid = new mongoose.Types.ObjectId(schoolId);
  const uoid = new mongoose.Types.ObjectId(userId);
  const suboid = new mongoose.Types.ObjectId(data.subjectId);
  const groid = new mongoose.Types.ObjectId(data.gradeId);
  const nodeId = data.topicNodeIds.length > 0
    ? new mongoose.Types.ObjectId(data.topicNodeIds[0])
    : suboid;

  const docs = parsed.map((q) => ({
    curriculumNodeId: nodeId,
    schoolId: soid,
    subjectId: suboid,
    gradeId: groid,
    type: q.type,
    stem: q.stem,
    media: [],
    options: q.options,
    answer: q.answer,
    markingRubric: q.markingRubric,
    marks: q.marks,
    cognitiveLevel: { caps: q.capsLevel, blooms: capsToDefaultBlooms(q.capsLevel) },
    difficulty: data.difficulty === 'easy' ? 2 : data.difficulty === 'challenging' ? 4 : 3,
    tags: ['ai_paper_generation'],
    source: 'ai_generated' as const,
    status: 'draft' as const,
    createdBy: uoid,
  }));

  const saved = await Question.insertMany(docs);
  return saved.map((q) => q.toObject()) as IQuestion[];
}

// ─── Section Organisation ──────────────────────────────────────────────────

export function organiseSections(questions: IQuestion[]): IPaperSection[] {
  const groups = new Map<QuestionType, IQuestion[]>();
  for (const q of questions) {
    const existing = groups.get(q.type);
    if (existing) existing.push(q);
    else groups.set(q.type, [q]);
  }

  const sections: IPaperSection[] = [];
  let sectionIndex = 1;
  const sectionLetter = (idx: number) => String.fromCharCode(64 + idx);

  for (const [type, qs] of groups) {
    const label = SECTION_LABELS[type] ?? type.replace(/_/g, ' ');
    const sectionQuestions = qs.map((q, i) => ({
      questionId: q._id as mongoose.Types.ObjectId,
      questionNumber: `${sectionIndex}.${i + 1}`,
      marks: q.marks,
      order: i,
    }));

    sections.push({
      title: `Section ${sectionLetter(sectionIndex)}: ${label}`,
      instructions: getSectionInstructions(type, qs.length),
      order: sectionIndex - 1,
      questions: sectionQuestions,
    });
    sectionIndex++;
  }

  return sections;
}

function getSectionInstructions(type: QuestionType, count: number): string {
  switch (type) {
    case 'mcq': return `Answer ALL ${count} questions. Choose the correct answer (A, B, C or D).`;
    case 'true_false': return `Indicate whether the following ${count} statements are TRUE or FALSE.`;
    case 'short_answer': return `Answer ALL ${count} questions in the space provided.`;
    case 'structured': return `Answer ALL ${count} questions. Show all working where applicable.`;
    case 'essay': return `Answer the following essay question(s). Pay attention to structure and content.`;
    case 'calculation': return `Answer ALL questions. Show ALL calculations clearly.`;
    default: return `Answer ALL ${count} questions.`;
  }
}

// ─── Parse Helpers ─────────────────────────────────────────────────────────

function parseGeneratedQuestions(response: string): ParsedGenQuestion[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: unknown) => {
      const q = item as Record<string, unknown>;
      const options = Array.isArray(q.options)
        ? (q.options as unknown[]).map((opt: unknown) => {
            const o = opt as Record<string, unknown>;
            return {
              label: typeof o.label === 'string' ? o.label : '',
              text: typeof o.text === 'string' ? o.text : '',
              isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : false,
            };
          })
        : [];

      const validTypes: QuestionType[] = ['mcq', 'structured', 'short_answer', 'essay', 'calculation'];
      const rawType = typeof q.type === 'string' ? q.type : 'structured';
      const type: QuestionType = validTypes.includes(rawType as QuestionType)
        ? (rawType as QuestionType) : 'structured';

      const validCaps: CapsLevel[] = ['knowledge', 'routine', 'complex', 'problem_solving'];
      const rawCaps = typeof q.capsLevel === 'string' ? q.capsLevel : 'routine';
      const capsLevel: CapsLevel = validCaps.includes(rawCaps as CapsLevel)
        ? (rawCaps as CapsLevel) : 'routine';

      return {
        stem: typeof q.stem === 'string' ? q.stem : 'Generated question',
        type, options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : 2,
        capsLevel,
      };
    });
  } catch {
    return [];
  }
}

function capsToDefaultBlooms(caps: CapsLevel): string {
  const map: Record<CapsLevel, string> = {
    knowledge: 'remember', routine: 'apply', complex: 'analyse', problem_solving: 'evaluate',
  };
  return map[caps];
}
