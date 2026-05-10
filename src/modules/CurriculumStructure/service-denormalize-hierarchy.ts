import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import type { NodeType } from './model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'curriculum-denormalize-hierarchy';
const MAX_HOPS = 10;
const TERM_NUMBER_RE = /Term\s+(\d)/i;

function parseTermNumber(title: string): number | null {
  const match = title.match(TERM_NUMBER_RE);
  if (!match) return null;
  const n = Number(match[1]);
  if (Number.isNaN(n) || n < 1 || n > 4) return null;
  return n;
}

interface RawNode {
  _id: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId | null;
  type: NodeType;
  title: string;
}

interface DenormFields {
  phaseId: mongoose.Types.ObjectId | null;
  gradeId: mongoose.Types.ObjectId | null;
  subjectId: mongoose.Types.ObjectId | null;
  termNumber: number | null;
}

function computeDenorm(node: RawNode, byId: Map<string, RawNode>): DenormFields {
  let phaseId: mongoose.Types.ObjectId | null = null;
  let gradeId: mongoose.Types.ObjectId | null = null;
  let subjectId: mongoose.Types.ObjectId | null = null;
  let termNumber: number | null = null;

  // Self-counts (matches pre-save hook semantics).
  if (node.type === 'phase') phaseId = node._id;
  if (node.type === 'grade') gradeId = node._id;
  if (node.type === 'subject') subjectId = node._id;
  if (node.type === 'term') termNumber = parseTermNumber(node.title);

  let cursorParentId: mongoose.Types.ObjectId | null = node.parentId;
  let hops = 0;
  while (cursorParentId && hops < MAX_HOPS) {
    hops += 1;
    const parent = byId.get(cursorParentId.toString());
    if (!parent) break;

    if (parent.type === 'phase' && !phaseId) phaseId = parent._id;
    if (parent.type === 'grade' && !gradeId) gradeId = parent._id;
    if (parent.type === 'subject' && !subjectId) subjectId = parent._id;
    if (parent.type === 'term' && termNumber === null) {
      termNumber = parseTermNumber(parent.title);
    }

    cursorParentId = parent.parentId;
  }

  return { phaseId, gradeId, subjectId, termNumber };
}

export async function runDenormalizeCurriculumHierarchy(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] curriculum-denormalize-hierarchy already complete, skipping');
    return;
  }
  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug(
      '[migrations] curriculum-denormalize-hierarchy lock held by another instance, skipping',
    );
    return;
  }

  try {
    const nodes = await CurriculumNode.find({ isDeleted: false })
      .select('_id parentId type title')
      .lean<RawNode[]>();

    const byId = new Map<string, RawNode>();
    for (const n of nodes) byId.set(n._id.toString(), n);

    const ops: Array<{
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId };
        update: { $set: DenormFields };
      };
    }> = [];

    for (const node of nodes) {
      const fields = computeDenorm(node, byId);
      ops.push({
        updateOne: {
          filter: { _id: node._id },
          update: { $set: fields },
        },
      });
    }

    let updated = 0;
    const CHUNK = 1000;
    for (let i = 0; i < ops.length; i += CHUNK) {
      const slice = ops.slice(i, i + CHUNK);
      if (slice.length === 0) continue;
      const result = await CurriculumNode.bulkWrite(slice, { ordered: false });
      updated += result.modifiedCount ?? 0;
    }

    await markComplete(MIGRATION_NAME);
    logger.info(
      { totalNodes: nodes.length, updated, skipped: nodes.length - updated },
      '[migrations] curriculum-denormalize-hierarchy complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error(
      { err },
      '[migrations] curriculum-denormalize-hierarchy failed; lock released for retry',
    );
    throw err;
  }
}
