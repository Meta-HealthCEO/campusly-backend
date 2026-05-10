import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { Subject, Grade } from '../Academic/model.js';

/**
 * Resolves an academic Subject / Grade ObjectId to the set of CurriculumNode
 * ObjectIds (the matched ancestor plus all descendants) visible to the school.
 *
 * The Module 2 paper wizard sends academic Subject + Grade IDs from the
 * teacher's school to GET /curriculum-structure/nodes — but CurriculumNode
 * itself stores subject/grade as nodes (`type: 'subject' | 'grade'`) linked
 * through `parentId`. This helper bridges the two by matching the academic
 * record's `name` to a curriculum node's `title` (case-insensitive, exact),
 * then collects every descendant via the denormalized `subjectId` / `gradeId`
 * refs on each node (self-ref convention: the subject/grade node also has
 * `subjectId === _id` / `gradeId === _id`, so the find returns the matched
 * node AND its descendants in one query).
 *
 * Returns:
 *   - `undefined` when caller did not pass this filter (no constraint)
 *   - `null` when filter was passed but no nodes match (force empty result)
 *   - array of ObjectIds otherwise
 */
export async function resolveAcademicAncestor(
  academicId: string | undefined,
  modelType: 'subject' | 'grade',
  schoolOid: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[] | null | undefined> {
  if (!academicId) return undefined;

  const academicOid = new mongoose.Types.ObjectId(academicId);
  const doc = modelType === 'subject'
    ? await Subject.findOne({ _id: academicOid, isDeleted: false }).select('name').lean()
    : await Grade.findOne({ _id: academicOid, isDeleted: false }).select('name').lean();
  if (!doc) return null;

  const escaped = doc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const titleRegex = new RegExp(`^${escaped}$`, 'i');
  const ancestorNodes = await CurriculumNode.find({
    type: modelType,
    title: titleRegex,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  }).select('_id').lean<{ _id: mongoose.Types.ObjectId }[]>();
  if (ancestorNodes.length === 0) return null;

  const ancestorIds = ancestorNodes.map((n: { _id: mongoose.Types.ObjectId }) => n._id);
  // Denormalized lookup: nodes carry subjectId/gradeId pointing at their
  // ancestor subject/grade (and the ancestor itself, by self-ref convention).
  // So a single find() returns the ancestor + every descendant.
  const denormField = modelType === 'subject' ? 'subjectId' : 'gradeId';
  const matches = await CurriculumNode.find({
    [denormField]: { $in: ancestorIds },
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId }[]>();

  if (matches.length === 0) return null;
  return matches.map((m: { _id: mongoose.Types.ObjectId }) => m._id);
}

/**
 * Resolve a subject or grade filter ID to the set of CurriculumNode IDs it
 * scopes a query to.
 *
 * The frontend may send EITHER:
 *   1. A CurriculumNode ID (denormalized-ref form — preferred). Uses the
 *      self-ref convention where a subject node has `subjectId === _id`, so a
 *      single find returns the node and every descendant in one shot.
 *   2. An academic Subject/Grade document ID. Falls back to name-matching via
 *      {@link resolveAcademicAncestor} (older callers like the Module 2 paper
 *      wizard, which only knows the academic IDs).
 *
 * Same return convention as `resolveAcademicAncestor`: undefined = no filter,
 * null = filter passed but no matches, array otherwise.
 */
export async function resolveSubjectOrGradeIds(
  id: string | undefined,
  modelType: 'subject' | 'grade',
  schoolOid: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[] | null | undefined> {
  if (!id) return undefined;

  const oid = new mongoose.Types.ObjectId(id);
  const denormField = modelType === 'subject' ? 'subjectId' : 'gradeId';

  // Path 1 — denormalized self-ref (fast, post-migration).
  const denormMatches = await CurriculumNode.find({
    [denormField]: oid,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId }[]>();

  if (denormMatches.length > 0) {
    return denormMatches.map((m: { _id: mongoose.Types.ObjectId }) => m._id);
  }

  // Path 2 — id is a CurriculumNode but denormalization hasn't populated its
  // descendants yet. Walk via $graphLookup on parentId. Resilient to
  // unmigrated data and any data-quality drift in the denorm fields.
  const node = await CurriculumNode.findOne({
    _id: oid,
    type: modelType,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  }).select('_id').lean<{ _id: mongoose.Types.ObjectId } | null>();
  if (node) {
    const result = await CurriculumNode.aggregate([
      { $match: { _id: node._id } },
      {
        $graphLookup: {
          from: 'curriculumnodes',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          restrictSearchWithMatch: {
            isDeleted: false,
            $or: [{ schoolId: null }, { schoolId: schoolOid }],
          },
        },
      },
      { $project: { ids: { $concatArrays: [['$_id'], '$descendants._id'] } } },
    ]);
    const ids = new Set<string>();
    for (const row of result as Array<{ ids: mongoose.Types.ObjectId[] }>) {
      for (const x of row.ids) ids.add(x.toString());
    }
    if (ids.size > 0) {
      return Array.from(ids).map((s: string) => new mongoose.Types.ObjectId(s));
    }
  }

  // Path 3 — id is an academic Subject/Grade record. Title-bridge to CAPS.
  return resolveAcademicAncestor(id, modelType, schoolOid);
}

/**
 * Resolves `termNumber` (1-4) to the set of CurriculumNode IDs that fall
 * under any matching term ancestor. Mirrors the resilience of
 * resolveSubjectOrGradeIds: works whether the denormalized `termNumber`
 * field is populated or not (uses $graphLookup over parentId).
 *
 * Same return convention: undefined = no filter, null = no matches, array
 * otherwise.
 */
export async function resolveTermNumberToNodeIds(
  termNumber: number | undefined,
  schoolOid: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[] | null | undefined> {
  if (termNumber === undefined) return undefined;

  // Path 1 — denormalized field (fast, post-migration).
  const denormMatches = await CurriculumNode.find({
    termNumber,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId }[]>();

  if (denormMatches.length > 0) {
    return denormMatches.map((m: { _id: mongoose.Types.ObjectId }) => m._id);
  }

  // Path 2 — find term nodes whose title parses to the requested number,
  // then $graphLookup their descendants.
  const titleRegex = new RegExp(`^Term\\s+${termNumber}$`, 'i');
  const termNodes = await CurriculumNode.find({
    type: 'term',
    title: titleRegex,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  }).select('_id').lean<{ _id: mongoose.Types.ObjectId }[]>();
  if (termNodes.length === 0) return null;

  const result = await CurriculumNode.aggregate([
    { $match: { _id: { $in: termNodes.map((t) => t._id) } } },
    {
      $graphLookup: {
        from: 'curriculumnodes',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        restrictSearchWithMatch: {
          isDeleted: false,
          $or: [{ schoolId: null }, { schoolId: schoolOid }],
        },
      },
    },
    { $project: { ids: { $concatArrays: [['$_id'], '$descendants._id'] } } },
  ]);

  const ids = new Set<string>();
  for (const row of result as Array<{ ids: mongoose.Types.ObjectId[] }>) {
    for (const x of row.ids) ids.add(x.toString());
  }
  if (ids.size === 0) return null;
  return Array.from(ids).map((s: string) => new mongoose.Types.ObjectId(s));
}
