export interface PaperAssessmentRef { assessmentId: string; paperId: string; classId: string }
export interface MarkRef { markId: string; studentId: string; studentClassId: string | null }
export interface MisfiledMark { markId: string; studentId: string; paperId: string; filedUnderClassId: string; belongsToClassId: string }

/** Marks on a paper's gradebook assessment that belong to learners in another class. */
export function misfiledMarks(assessment: PaperAssessmentRef, marks: MarkRef[]): MisfiledMark[] {
  return marks
    .filter((m) => m.studentClassId !== null && m.studentClassId !== assessment.classId)
    .map((m) => ({
      markId: m.markId,
      studentId: m.studentId,
      paperId: assessment.paperId,
      filedUnderClassId: assessment.classId,
      belongsToClassId: m.studentClassId as string,
    }));
}
