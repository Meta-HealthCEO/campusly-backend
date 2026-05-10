import { AIService } from '../../services/ai.service.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { logger } from '../../common/logger.js';
import {
  scaffoldedOutlineSchema,
  type ScaffoldLessonInput,
  type ScaffoldedOutline,
} from './validation.js';

const SYSTEM_PROMPT = `You are a CAPS-aligned South African secondary school teacher. Given a curriculum topic, grade level, and lesson duration, produce a structured lesson outline.

Output strict JSON matching this schema (no markdown, no commentary):
{
  "objectives": string[3-5],
  "phases": [
    { "phase": "introduction",        "suggestions": [{ "kind": "...", "title": "...", "notes": "..." }] },
    { "phase": "direct_instruction",  "suggestions": [...] },
    { "phase": "practice",            "suggestions": [...] },
    { "phase": "assessment",          "suggestions": [...] },
    { "phase": "homework",            "suggestions": [...] }
  ]
}

Each phase has 1-3 suggestions. Each suggestion's "kind" must be one of:
"reading" | "worksheet" | "activity" | "notes" | "worked_example" | "quiz" | "practice_questions" | "homework" | "paper".

Pedagogical guidance per phase:
- introduction: notes (hook / recap) or short activity
- direct_instruction: notes (concept exposition) or worked_example
- practice: worksheet or activity or practice_questions
- assessment: quiz or practice_questions or paper
- homework: homework (always)`;

const DEFAULT_FALLBACK: ScaffoldedOutline = {
  objectives: ['Understand key concepts of the topic'],
  phases: [
    { phase: 'introduction',       suggestions: [{ kind: 'notes',              title: 'Topic introduction' }] },
    { phase: 'direct_instruction', suggestions: [{ kind: 'worked_example',     title: 'Worked example' }] },
    { phase: 'practice',           suggestions: [{ kind: 'worksheet',          title: 'Practice worksheet' }] },
    { phase: 'assessment',         suggestions: [{ kind: 'practice_questions', title: 'Quick check' }] },
    { phase: 'homework',           suggestions: [{ kind: 'homework',           title: 'Reinforcement homework' }] },
  ],
};

export async function scaffoldLesson(input: ScaffoldLessonInput): Promise<ScaffoldedOutline> {
  const node = await CurriculumNode.findById(input.curriculumNodeId).lean();
  if (!node) throw new Error('Curriculum node not found');

  const userPrompt = [
    `Topic: ${node.title}${node.code ? ` (${node.code})` : ''}`,
    `Type: ${node.type}`,
    `Duration: ${input.durationMinutes} minutes`,
    input.hints ? `Teacher hints: ${input.hints}` : '',
  ].filter(Boolean).join('\n');

  const raw = await AIService.generateJSON<unknown>(SYSTEM_PROMPT, userPrompt);
  const parsed = scaffoldedOutlineSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn(
      { errors: parsed.error.issues },
      '[scaffold] AI returned invalid outline shape; using fallback',
    );
    return DEFAULT_FALLBACK;
  }
  return parsed.data;
}
