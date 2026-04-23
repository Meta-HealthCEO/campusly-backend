// src/common/pdf/types.ts

export interface NormalisedDiagram {
  svgUrl: string | null;
  alt: string;
  renderStatus: 'pending' | 'rendered' | 'failed';
}

export interface NormalisedQuestionOption {
  label: string;
  text: string;
  isCorrect?: boolean;
}

export type NormalisedQuestionType = 'mcq' | 'true_false' | 'short' | 'long' | 'structured';

export interface NormalisedQuestion {
  number: string;
  marks: number;
  stem: string;
  type: NormalisedQuestionType;
  options: NormalisedQuestionOption[];
  answer: string;
  markingRubric: string;
  diagram: NormalisedDiagram | null;
}

export interface NormalisedSection {
  title: string;
  instructions: string;
  questions: NormalisedQuestion[];
}

export interface NormalisedPaperMeta {
  schoolName: string;
  subject: string;
  gradeLabel: string;
  term: number | string;
  year?: number | string;
  totalMarks: number;
  duration: number;
  paperTypeLabel?: string;
  instructions?: string;
}
