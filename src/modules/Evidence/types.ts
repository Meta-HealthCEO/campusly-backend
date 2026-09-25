// src/modules/Evidence/types.ts
//
// Shapes of the evidence stream (Phase E spec §3): one row per answered
// question per attempt, written by one writer per source.
import type { Types } from 'mongoose';
import type { CapsLevel } from '../QuestionBank/model-shared.js';

export type Oid = Types.ObjectId;
export type { CapsLevel };

export const SOURCE_TYPES = ['test', 'homework', 'unit_check', 'practice', 'library'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];
export const TOPIC_FROM = ['question', 'paper_question', 'block', 'practice', 'ai_tag', 'none'] as const;
export type TopicFrom = (typeof TOPIC_FROM)[number];
export const CHANNELS = ['online', 'photo', 'typed_by_teacher'] as const;
export type Channel = (typeof CHANNELS)[number];
export const ANSWER_KINDS = ['typed', 'choice', 'transcribed', 'structured'] as const;
export type AnswerKind = (typeof ANSWER_KINDS)[number];
export const MARKED_BY = ['deterministic', 'ai', 'teacher'] as const;
export type MarkedBy = (typeof MARKED_BY)[number];
export const DIAGNOSIS_STATES = ['none', 'pending', 'queued', 'ready', 'skipped', 'skipped_budget', 'failed', 'dismissed'] as const;
export type DiagnosisState = (typeof DIAGNOSIS_STATES)[number];
/** `wrong_paper`: a photo of another paper, waiting for the teacher (checkpoint fix 1). */
export const DELETED_REASONS = ['source_deleted', 'superseded', 'item_removed', 'wrong_paper'] as const;
export type DeletedReason = (typeof DELETED_REASONS)[number];

/** One answered question as a source's writer sees it. */
export interface EvidenceItem {
  itemKey: string;
  position: number;
  questionKey: string;
  questionId: Oid | null;
  /** Any curriculum node; the row writer resolves it to a topic and subtopic. */
  nodeId: Oid | null;
  topicFrom: TopicFrom;
  cognitiveLevel: CapsLevel | null;
  marksAwarded: number;
  marksAvailable: number;
  answerText: string;
  answerKind: AnswerKind;
  markedBy: MarkedBy;
  markerNote: string;
}

/** What is the same for every item of one source record. */
export interface EvidenceRecord {
  schoolId: Oid;
  studentId: Oid;
  userId: Oid | null;
  classId: Oid | null;
  subjectId: Oid | null;
  gradeId: Oid | null;
  source: { type: SourceType; channel: Channel | null; recordId: Oid; parentId: Oid; attemptNumber: number };
  markedAt: Date;
  status: 'provisional' | 'final';
  finalAt: Date | null;
  totalOverridden: boolean;
}

export interface WriteResult {
  written: number;
  updated: number;
  unchanged: number;
  removed: number;
  withTopic: number;
  withLevel: number;
  skipped: Record<string, number>;
}

export interface WriterOptions { dryRun?: boolean }

export const emptyResult = (): WriteResult => ({
  written: 0, updated: 0, unchanged: 0, removed: 0, withTopic: 0, withLevel: 0, skipped: {},
});
