import { ForbiddenError } from '../../common/errors.js';
import type { IAssessmentPaper } from './model-papers.js';

export const PAPER_ADMIN_ROLES = new Set(['school_admin', 'super_admin', 'principal']);
const PAPER_REVIEW_ROLES = new Set(['school_admin', 'super_admin', 'principal', 'hod']);

export type PaperAction =
  | 'read'
  | 'update'
  | 'delete'
  | 'finalise'
  | 'add-question'
  | 'edit-question'
  | 'remove-question'
  | 'edit-memo';

/**
 * Assert that the caller may perform `action` on the given assessment paper.
 * Only the paper's creator OR a school/super admin is permitted. In addition,
 * mutating actions (everything except `delete` and `finalise`) are blocked
 * once the paper status is `finalised` — the paper must be reopened first.
 *
 * `createdBy` may arrive as an ObjectId, a string, or a populated User doc.
 * All three shapes are resolved safely; a populated doc falls back to its `_id`.
 */
export function assertCanEditPaper(
  paper: Pick<IAssessmentPaper, '_id' | 'createdBy' | 'status'>,
  actorId: string,
  actorRole: string,
  action: PaperAction,
): void {
  const teacherIdStr =
    typeof paper.createdBy === 'string'
      ? paper.createdBy
      : paper.createdBy && typeof paper.createdBy === 'object' && '_id' in paper.createdBy
        ? String((paper.createdBy as { _id: unknown })._id)
        : String(paper.createdBy);
  const isOwner = teacherIdStr === actorId;
  const isAdmin = PAPER_ADMIN_ROLES.has(actorRole);
  const isReviewerRead = action === 'read' && PAPER_REVIEW_ROLES.has(actorRole);
  if (!isOwner && !isAdmin && !isReviewerRead) {
    throw new ForbiddenError(`You can only ${action} your own papers`);
  }
  // Question/memo mutations are blocked once the paper is finalised.
  // `delete` and `finalise` are allowed regardless (delete is owner/admin
  // discretion; finalise is itself the transition we're guarding against).
  const mutating = action !== 'read' && action !== 'finalise' && action !== 'delete';
  if (mutating && paper.status === 'finalised') {
    throw new ForbiddenError(`Cannot ${action} on a finalised paper. Reopen first.`);
  }
}
