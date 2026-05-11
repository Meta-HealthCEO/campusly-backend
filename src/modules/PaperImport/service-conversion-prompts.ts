import type { ResourceType } from '../ContentLibrary/model.js';

const BLOCK_TYPES_BY_RESOURCE: Record<ResourceType, string[]> = {
  lesson: ['text', 'quiz', 'fill_blank', 'step_reveal', 'image'],
  worksheet: ['text', 'quiz', 'fill_blank', 'match_columns', 'ordering'],
  activity: ['text', 'quiz', 'fill_blank', 'match_columns', 'image'],
  study_notes: ['text', 'image', 'quiz', 'step_reveal'],
  worked_example: ['text', 'step_reveal', 'quiz', 'image'],
  reading: ['text', 'image', 'quiz'],
};

export const SEGMENT_SYSTEM = `You are segmenting a teacher's paper resource into one or more digital resources.
Identify resource boundaries using visual cues: section headings, numbered question groups, chapter breaks,
change of layout. A scanned paper may be a single resource or several. Output JSON only.

Schema:
{
  "resources": [
    {
      "kind": "lesson" | "worksheet" | "activity" | "study_notes" | "worked_example" | "reading",
      "title": string (max 200 chars),
      "pageRange": [startPage:int, endPage:int],
      "reasoning": string (short — for our debug logs)
    }
  ]
}

Rules:
- pageRange uses 1-based page numbers.
- Pages cover the entire document with no overlap.
- If unsure, prefer fewer, bigger resources over many small ones.
`;

export function transcribeSystem(kind: ResourceType): string {
  const allowed = BLOCK_TYPES_BY_RESOURCE[kind].join(', ');
  return `You are transcribing pages of a paper resource into a digital resource of type "${kind}".
Allowed block types: ${allowed}.

Faithfully preserve the text, math (output as LaTeX inside $…$), instructions, and question structure.
DO NOT invent content not on the page. If a region is a diagram, figure, or photo that cannot be reliably
transcribed as text, emit an "image" block with a "cropBox" pointing to its location.

Output JSON only:
{
  "title": string,
  "description"?: string,
  "blocks": [
    {
      "blockId": string (uuid-ish),
      "type": one of ${allowed},
      "order": int (0-based),
      "content": JSON-string matching the per-type shape below,
      "confidence": float 0..1 (your self-rated transcription confidence for this block),
      "cropBox"?: { "page": int, "x": 0..1, "y": 0..1, "w": 0..1, "h": 0..1 }   // for image blocks only
    }
  ]
}

Per-type content JSON shapes (the value of "content" is a JSON STRING of one of these):
- text:          { "html": string }
- quiz:          { "stem": string, "options": [{"label": "A"|"B"|"C"|"D"|"E", "text": string, "isCorrect": boolean}] }
- fill_blank:    { "template": string with {{1}} {{2}} markers, "blanks": [string,...] }
- match_columns: { "left": string[], "right": string[], "pairs": [[leftIdx, rightIdx],...] }
- ordering:      { "items": string[], "correctOrder": int[] }
- step_reveal:   { "steps": [{"prompt": string, "reveal": string}] }
- image:         { "src": string, "alt": string }     // src is filled in by the worker post-process

Rules:
- For questions whose correct answer is not visible on the page, leave isCorrect=false on all options and
  set blanks=[] for fill_blank (worker will run a separate ENHANCE pass to fill these in).
- Confidence reflects only how well YOU transcribed the block, not the difficulty of the question.
`;
}

export const ANSWERS_ENHANCEMENT_SYSTEM = `You are filling in correct answers for question blocks whose answer
is not yet known. You are given the question blocks as JSON. For each, output the answer using the same
per-type shape used by the transcriber.

Output JSON only:
{ "answers": [ { "blockId": string, "answer": JSON-string matching the block's per-type shape (only fields needed
to mark correctness — for quiz the same options array but with isCorrect set; for fill_blank, the blanks array) } ] }
`;

export const HINTS_ENHANCEMENT_SYSTEM = `For each question block provided, produce one short hint that nudges
the learner without revealing the answer.

Output JSON only:
{ "hints": [ { "blockId": string, "hints": [string] } ] }
`;

export const EXPLANATIONS_ENHANCEMENT_SYSTEM = `For each question block (with its known answer), produce a 1-3
sentence explanation of why the answer is correct.

Output JSON only:
{ "explanations": [ { "blockId": string, "explanation": string } ] }
`;

export const WORKED_EXAMPLE_ENHANCEMENT_SYSTEM = `Choose the hardest question in the provided resource and
produce a single new "step_reveal" block that demonstrates how to solve it step by step.

Output JSON only:
{ "block": { "blockId": string, "type": "step_reveal", "order": int (place at end), "content": JSON-string of
the step_reveal shape: { "steps": [{"prompt": string, "reveal": string}] } } }
`;

export const STRICTIFY_SUFFIX = `

If your previous response failed JSON parsing, return ONLY a valid JSON object matching the schema above.
Do not include any prose, code fences, or markdown formatting — only the JSON.`;
