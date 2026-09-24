// src/modules/Course/unit-copy.ts
//
// The rules for reusing a class unit: who may copy what, the copy's title
// for another term, and how a released unit reads in the school library.

const TERM = /Term \d/;

/** The copy keeps its title; a copy for another term says so. */
export function copyTitle(sourceTitle: string, termNumber: number, sourceTerm: number): string {
  if (termNumber === sourceTerm) return sourceTitle;
  return TERM.test(sourceTitle) ? sourceTitle.replace(TERM, `Term ${termNumber}`) : `${sourceTitle} · Term ${termNumber}`;
}

export type CopyCheck = { ok: true } | { ok: false; reason: string };

/**
 * Anyone in the school may copy a released unit. The unit's own teacher may
 * copy it before release too, once its outline is approved.
 */
export function canCopyFrom(course: { kind?: string | null; status: string; outlineStatus?: string | null }, canEdit: boolean): CopyCheck {
  if (course.kind !== 'class_unit') return { ok: false, reason: 'Only class units can be copied.' };
  if (course.status === 'published') return { ok: true };
  if (!canEdit) return { ok: false, reason: 'Only released units can be copied.' };
  if (course.outlineStatus !== 'approved') return { ok: false, reason: 'Approve the outline before copying this unit.' };
  return { ok: true };
}

export interface LibraryEntry {
  id: string;
  title: string;
  gradeName: string;
  subjectName: string;
  termNumber: number | null;
  authorName: string;
  items: number;
  minutes: number;
  releasedAt: string | null;
  /** The viewer's own unit. */
  mine: boolean;
}

/** A released unit as the school library lists it. */
export function libraryEntry(
  course: { _id: unknown; title: string; createdBy: unknown; publishedAt?: Date | null; scope?: { termNumber: number } | null },
  ctx: { gradeName: string; subjectName: string; authorName: string; items: number; minutes: number; viewerId: string },
): LibraryEntry {
  return {
    id: String(course._id),
    title: course.title,
    gradeName: ctx.gradeName,
    subjectName: ctx.subjectName,
    termNumber: course.scope?.termNumber ?? null,
    authorName: ctx.authorName,
    items: ctx.items,
    minutes: ctx.minutes,
    releasedAt: course.publishedAt ? course.publishedAt.toISOString() : null,
    mine: String(course.createdBy) === ctx.viewerId,
  };
}
