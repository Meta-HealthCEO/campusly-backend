// src/modules/Readiness/types.ts
//
// Shapes shared by the blueprint, the engine and the APIs (spec §2–§6).
import type { Types } from 'mongoose';
import type { CapsLevel } from '../QuestionBank/model.js';

export type Oid = Types.ObjectId;
export type { CapsLevel };

// Phase E's evidence vocabulary (Evidence/types.ts and Evidence/model-taxonomy.ts on feat/evidence-diagnosis),
// mirrored here until R is rebased onto E; then these three become imports (ledger ruling R1).
export type SourceType = 'test' | 'homework' | 'unit_check' | 'practice' | 'library';
export type TopicFrom = 'question' | 'paper_question' | 'block' | 'practice' | 'ai_tag' | 'none';
export type TypeKind = 'misconception' | 'procedural' | 'generic';

export interface MappedNode { code: string; nodeId: string; level: 'topic' | 'subtopic'; grade: number; termNumber: number | null }
export interface BlueprintTopic {
  key: string; label: string; group: string; marks: number; tolerance: number | null;
  sourceRef: string; verified: boolean; note: string; nodes: MappedNode[];
}
export interface BlueprintPaper {
  key: string; title: string; totalMarks: number; durationMinutes: number;
  examDate: string | null; sitting: 'morning' | 'afternoon' | null; sourceRef: string; verified: boolean;
  topics: BlueprintTopic[];
}
export interface BlueprintLevel { key: string; label: string; percent: number; fromStored: CapsLevel[]; sourceRef: string; verified: boolean }
export interface BlueprintSource { ref: string; title: string; edition: string; publisher: string }
export interface BlueprintData {
  family: string; examBody: 'DBE'; qualification: 'NSC'; session: 'november';
  subjectKey: string; slug: string; subjectTitle: string; grade: number; examYear: number;
  sources: BlueprintSource[];
  cognitiveScheme: { key: string; levels: BlueprintLevel[] };
  papers: BlueprintPaper[];
}

/** The part of a ready diagnosis R uses (a row's misconception, E §6.2). */
export interface EngineMisconception {
  typeId: string; kind: TypeKind; label: string; learnerLabel: string; learnerVisible: boolean;
  confidence: number | null; topicNodeId: string | null;
}
/** One final evidence row as the engine sees it (spec §3.1). */
export interface EngineRow {
  id: string; topicNodeId: string | null; subtopicNodeId: string | null; cognitiveLevel: CapsLevel | null;
  marksAwarded: number; marksAvailable: number; markedAt: Date; sourceType: SourceType; attemptNumber: number;
  questionKey: string; topicFrom: TopicFrom; totalOverridden: boolean;
  recordId: string; parentId: string; itemKey: string;
  misconception: EngineMisconception | null;
}

export type TopicStatus = 'tested' | 'thin' | 'untested';
export interface TopicMisconception {
  typeId: string; kind: TypeKind; label: string; learnerLabel: string; learnerVisible: boolean; count: number; lastSeenAt: string;
}
export interface TopicResult {
  key: string; label: string; group: string; marks: number; status: TopicStatus;
  /** 0–100, whole percent, only when tested. */
  mastery: number | null;
  answers: number; effectiveAnswers: number; lastAnsweredAt: string | null;
  marksToGain: number | null; due: boolean;
  subtopics: Array<{ nodeId: string; title: string; mastery: number | null; answers: number }>;
  misconceptions: TopicMisconception[];
  bySource: Partial<Record<SourceType, { answers: number; mastery: number | null }>>;
}
export interface Band { low: number; high: number; mid: number; lowMarks: number; highMarks: number }
export interface LevelResult { key: string; label: string; examPercent: number; evidencePercent: number | null; mastery: number | null; answers: number }
export interface PaperResult {
  key: string; title: string; totalMarks: number; durationMinutes: number; examDate: string | null;
  state: 'predicted' | 'not_enough_evidence'; band: Band | null; predictedMarks: number; sigmaMarks: number;
  gate: { answers: number; answersNeeded: number; testedMarks: number; testedMarksNeeded: number };
  levels: LevelResult[]; adjustmentMarks: number | null;
  explanation: { learner: string[]; teacher: string[] };
  topics: TopicResult[];
}
export interface ReadinessCore {
  answers: number; unmappedAnswers: number;
  /** The learner's weighted average over tested topics, 0–100, or null. */
  average: number | null;
  lastMarkedAt: string | null;
  papers: PaperResult[];
  both: { state: PaperResult['state']; band: Band | null } | null;
  defaultTarget: number | null;
}
