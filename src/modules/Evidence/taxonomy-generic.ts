// src/modules/Evidence/taxonomy-generic.ts
//
// The generic misconception types (spec §6.2), seeded as data. A reviewer's
// rename survives: seeding only inserts what is missing.
import { MisconceptionType } from './model-taxonomy.js';
import type { Oid } from './types.js';

export const GENERIC_TYPES = [
  { slug: 'unanswered', label: 'Not answered', learnerLabel: 'Not answered', description: 'No answer was given, or only the question was copied out.', learnerVisible: true },
  { slug: 'incomplete-answer', label: 'Answer incomplete', learnerLabel: 'Answer incomplete', description: 'Started on the right lines but stopped before the final answer or a required part.', learnerVisible: true },
  { slug: 'no-working', label: 'Working not shown', learnerLabel: 'Working not shown', description: 'A final answer without the steps the marks are given for.', learnerVisible: true },
  { slug: 'misread-question', label: 'Misread the question', learnerLabel: 'Misread the question', description: 'Answered a different question from the one asked, or used the wrong given value.', learnerVisible: true },
  { slug: 'careless-arithmetic', label: 'Arithmetic slip', learnerLabel: 'Arithmetic slip', description: 'The method is right but a calculation step went wrong.', learnerVisible: true },
  { slug: 'units-notation', label: 'Units or notation', learnerLabel: 'Units or notation', description: 'Missing or wrong units, symbols or notation.', learnerVisible: true },
  { slug: 'wrong-method', label: 'Wrong method', learnerLabel: 'Wrong method', description: 'A method that does not fit the question was used.', learnerVisible: true },
  { slug: 'imprecise-terminology', label: 'Term or definition not precise', learnerLabel: 'Term not precise', description: 'A term or definition is vague, incomplete or not the one required.', learnerVisible: true },
  { slug: 'possible-marking-error', label: 'Check this mark', learnerLabel: 'Check this mark', description: 'The answer may deserve more marks than it was given.', learnerVisible: false },
] as const;

export type GenericSlug = (typeof GENERIC_TYPES)[number]['slug'];
export const genericCode = (slug: GenericSlug): string => `GEN.${slug}`;

let cache: Map<GenericSlug, Oid> | null = null;

/** Inserts any missing generic type and returns slug → id. Cached for the process. */
export async function ensureGenericTypes(): Promise<Map<GenericSlug, Oid>> {
  if (cache) return cache;
  await MisconceptionType.bulkWrite(GENERIC_TYPES.map((t) => ({
    updateOne: {
      filter: { code: genericCode(t.slug) },
      update: { $setOnInsert: {
        code: genericCode(t.slug), kind: 'generic', subjectNodeId: null, topicNodeId: null, schoolId: null,
        label: t.label, learnerLabel: t.learnerLabel, description: t.description, status: 'approved', origin: 'system',
        learnerVisible: t.learnerVisible,
      } },
      upsert: true,
    },
  })));
  const docs = await MisconceptionType.find({ code: { $in: GENERIC_TYPES.map((t) => genericCode(t.slug)) } }).select('code').lean();
  cache = new Map(docs.map((d) => [d.code.slice(4) as GenericSlug, d._id as Oid]));
  return cache;
}

export async function genericTypeId(slug: GenericSlug): Promise<Oid> {
  const id = (await ensureGenericTypes()).get(slug);
  if (!id) throw new Error(`Generic misconception type ${slug} is missing`);
  return id;
}

/** Tests only: forget the ids (another test file may have wiped the collection). */
export function resetGenericTypeCache(): void {
  cache = null;
}
