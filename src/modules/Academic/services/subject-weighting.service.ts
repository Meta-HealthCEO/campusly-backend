// Subject weighting service.
//
// SA CAPS gradebooks compute per-subject averages by grouping assessments
// into type buckets (test, exam, assignment, practical, project) and
// applying a per-bucket percentage that sums to 100. This service owns:
//
//   • getMatrix       — the 4-term × 5-type config for one (subject, grade)
//   • setTermBuckets  — atomic upsert of all 5 buckets for a single term;
//                       enforces sum-to-100 inside a transaction so we never
//                       leave a half-saved config behind
//   • getWeightingMap — fast lookup the term-summary calc joins against
//
// The model already has per-row CRUD endpoints in misc.service; those are
// kept for backwards compatibility but the gradebook uses the bulk paths
// below.
//
// Multi-tenant: every query is scoped by schoolId. The model's unique
// partial index on (schoolId, subjectId, gradeId, term, assessmentType,
// isDeleted: false) prevents duplicate buckets.

import mongoose from 'mongoose';
import {
  SubjectWeighting, type AssessmentType, Subject, Grade,
} from '../model.js';
import { BadRequestError, NotFoundError } from '../../../common/errors.js';

const { Types } = mongoose;

export const ASSESSMENT_TYPES: readonly AssessmentType[] = [
  'test', 'exam', 'assignment', 'practical', 'project',
] as const;

export interface BucketRow {
  assessmentType: AssessmentType;
  weightPercentage: number;
}

export interface TermBuckets {
  term: number;
  buckets: BucketRow[];
  // True if every bucket weight is zero — i.e. nothing has been configured
  // for this term yet. The gradebook uses this to surface a "configure
  // weightings" empty state.
  isEmpty: boolean;
}

export interface SubjectWeightingMatrix {
  subjectId: string;
  subjectName: string;
  gradeId: string;
  gradeName: string;
  terms: TermBuckets[];
}

// (subjectId → term → assessmentType → weightPercentage)
// Used by term-summary / student-term-detail to apply buckets.
export type WeightingMap = Map<string, Map<number, Map<AssessmentType, number>>>;

export async function getMatrix(input: {
  schoolId: string;
  subjectId: string;
  gradeId: string;
}): Promise<SubjectWeightingMatrix> {
  const schoolOid = new Types.ObjectId(input.schoolId);
  const subjectOid = new Types.ObjectId(input.subjectId);
  const gradeOid = new Types.ObjectId(input.gradeId);

  const [subject, grade] = await Promise.all([
    Subject.findOne({ _id: subjectOid, schoolId: schoolOid, isDeleted: false }).lean(),
    Grade.findOne({ _id: gradeOid, schoolId: schoolOid, isDeleted: false }).lean(),
  ]);
  if (!subject) throw new NotFoundError('Subject not found');
  if (!grade) throw new NotFoundError('Grade not found');

  const rows = await SubjectWeighting.find({
    schoolId: schoolOid,
    subjectId: subjectOid,
    gradeId: gradeOid,
    isDeleted: false,
  }).lean();

  // term → type → weight
  const byTerm = new Map<number, Map<AssessmentType, number>>();
  for (const r of rows) {
    const t = byTerm.get(r.term) ?? new Map();
    t.set(r.assessmentType as AssessmentType, r.weightPercentage);
    byTerm.set(r.term, t);
  }

  const terms: TermBuckets[] = [1, 2, 3, 4].map((term) => {
    const lookup = byTerm.get(term) ?? new Map<AssessmentType, number>();
    const buckets: BucketRow[] = ASSESSMENT_TYPES.map((type) => ({
      assessmentType: type,
      weightPercentage: lookup.get(type) ?? 0,
    }));
    const total = buckets.reduce((s, b) => s + b.weightPercentage, 0);
    return { term, buckets, isEmpty: total === 0 };
  });

  return {
    subjectId: input.subjectId,
    subjectName: subject.name,
    gradeId: input.gradeId,
    gradeName: grade.name,
    terms,
  };
}

export async function setTermBuckets(input: {
  schoolId: string;
  subjectId: string;
  gradeId: string;
  term: number;
  buckets: BucketRow[];
}): Promise<TermBuckets> {
  if (input.term < 1 || input.term > 4) {
    throw new BadRequestError('term must be 1-4');
  }

  // Normalise: ensure every type appears exactly once so the upsert is
  // deterministic. Missing types default to 0; extras are rejected.
  const provided = new Map<AssessmentType, number>();
  for (const b of input.buckets) {
    if (!ASSESSMENT_TYPES.includes(b.assessmentType)) {
      throw new BadRequestError(`Unknown assessment type: ${b.assessmentType}`);
    }
    if (provided.has(b.assessmentType)) {
      throw new BadRequestError(`Duplicate bucket for type: ${b.assessmentType}`);
    }
    if (b.weightPercentage < 0 || b.weightPercentage > 100) {
      throw new BadRequestError(
        `weightPercentage for ${b.assessmentType} must be 0-100`,
      );
    }
    provided.set(b.assessmentType, b.weightPercentage);
  }

  const sum = ASSESSMENT_TYPES.reduce(
    (s, t) => s + (provided.get(t) ?? 0), 0,
  );
  // Round-trip tolerance: 100 ± 0.1 covers UI sliders that may send 99.9.
  if (Math.abs(sum - 100) > 0.1) {
    throw new BadRequestError(
      `Bucket weights must sum to 100 (received ${sum.toFixed(1)})`,
    );
  }

  const schoolOid = new Types.ObjectId(input.schoolId);
  const subjectOid = new Types.ObjectId(input.subjectId);
  const gradeOid = new Types.ObjectId(input.gradeId);

  // Upsert each of the 5 type rows. We do this in a transaction so a
  // partial save can't leave the calc in a corrupt state.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const type of ASSESSMENT_TYPES) {
        await SubjectWeighting.findOneAndUpdate(
          {
            schoolId: schoolOid,
            subjectId: subjectOid,
            gradeId: gradeOid,
            term: input.term,
            assessmentType: type,
            isDeleted: false,
          },
          {
            $set: { weightPercentage: provided.get(type) ?? 0 },
            $setOnInsert: {
              schoolId: schoolOid,
              subjectId: subjectOid,
              gradeId: gradeOid,
              term: input.term,
              assessmentType: type,
            },
          },
          { upsert: true, session },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const buckets: BucketRow[] = ASSESSMENT_TYPES.map((type) => ({
    assessmentType: type,
    weightPercentage: provided.get(type) ?? 0,
  }));
  return { term: input.term, buckets, isEmpty: sum === 0 };
}

// Pulls every weighting row for the given grade + (optional) subject set
// and shapes them into a Map for O(1) lookup by the calc services.
export async function getWeightingMap(input: {
  schoolId: string;
  gradeId: string;
  subjectIds?: string[];
}): Promise<WeightingMap> {
  const filter: Record<string, unknown> = {
    schoolId: new Types.ObjectId(input.schoolId),
    gradeId: new Types.ObjectId(input.gradeId),
    isDeleted: false,
  };
  if (input.subjectIds && input.subjectIds.length > 0) {
    filter.subjectId = { $in: input.subjectIds.map((id) => new Types.ObjectId(id)) };
  }
  const rows = await SubjectWeighting.find(filter).lean();

  const map: WeightingMap = new Map();
  for (const r of rows) {
    const subjectId = String(r.subjectId);
    let perSubject = map.get(subjectId);
    if (!perSubject) {
      perSubject = new Map();
      map.set(subjectId, perSubject);
    }
    let perTerm = perSubject.get(r.term);
    if (!perTerm) {
      perTerm = new Map();
      perSubject.set(r.term, perTerm);
    }
    perTerm.set(r.assessmentType as AssessmentType, r.weightPercentage);
  }
  return map;
}

// Helper used by calc services. Returns the per-bucket weights for a
// given (subject, term), or null when nothing is configured.
export function getBucketsFor(
  map: WeightingMap,
  subjectId: string,
  term: number,
): Map<AssessmentType, number> | null {
  const perSubject = map.get(subjectId);
  if (!perSubject) return null;
  const perTerm = perSubject.get(term);
  if (!perTerm) return null;
  let any = false;
  for (const w of perTerm.values()) if (w > 0) { any = true; break; }
  return any ? perTerm : null;
}
