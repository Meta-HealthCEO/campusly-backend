import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { BadRequestError } from '../../common/errors.js';

/**
 * The curriculum tree lets a teacher "Select" a whole term, but papers are
 * built from topics: verifyPaperRefs only accepts topic/subtopic/outcome
 * nodes, and the AI prompt needs topic names, not "Term 1". Replace each
 * selected term with the topics beneath it (visible to this school, in
 * curriculum order). Non-term ids pass through; duplicates are dropped.
 */
export async function expandTermSelections(
  topicIds: string[],
  schoolId: string,
): Promise<string[]> {
  if (topicIds.length === 0) return topicIds;

  const soid = new mongoose.Types.ObjectId(schoolId);
  const visibleToSchool = { $or: [{ schoolId: null }, { schoolId: soid }] };

  const terms = await CurriculumNode.find({
    _id: { $in: topicIds.map((id) => new mongoose.Types.ObjectId(id)) },
    type: 'term',
    isDeleted: false,
    ...visibleToSchool,
  }).select('_id title').lean();
  if (terms.length === 0) return topicIds;

  const children = await CurriculumNode.find({
    parentId: { $in: terms.map((t) => t._id) },
    type: 'topic',
    isDeleted: false,
    ...visibleToSchool,
  }).select('_id parentId order').sort({ order: 1 }).lean();

  const topicsByTerm = new Map<string, string[]>();
  for (const child of children) {
    const key = String(child.parentId);
    topicsByTerm.set(key, [...(topicsByTerm.get(key) ?? []), String(child._id)]);
  }

  const emptyTerm = terms.find((t) => !topicsByTerm.has(String(t._id)));
  if (emptyTerm) {
    throw new BadRequestError(
      `${emptyTerm.title} has no topics to build a paper from. Pick specific topics instead.`,
    );
  }

  const expanded = topicIds.flatMap((id) => topicsByTerm.get(id) ?? [id]);
  return Array.from(new Set(expanded));
}
