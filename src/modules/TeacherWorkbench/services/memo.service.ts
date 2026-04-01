import { PaperMemo, IPaperMemo } from '../model.assessment.js';
import { GeneratedPaper } from '../../AITools/model.js';
import { NotFoundError } from '../../../common/errors.js';

export class MemoService {
  static async generateMemo(
    paperId: string,
    teacherId: string,
    schoolId: string,
  ): Promise<IPaperMemo> {
    const paper = await GeneratedPaper.findOne({ _id: paperId, isDeleted: false }).lean().exec();
    if (!paper) throw new NotFoundError('Paper not found');

    const sections = paper.sections.map((section) => ({
      sectionTitle: section.sectionLabel,
      answers: section.questions.map((q) => ({
        questionNumber: String(q.questionNumber),
        expectedAnswer: q.modelAnswer || '',
        markAllocation: [
          {
            criterion: 'Correct answer',
            marks: q.marks,
          },
        ],
        commonMistakes: [],
        acceptableAlternatives: [],
      })),
    }));

    const memo = new PaperMemo({
      paperId,
      schoolId,
      teacherId,
      sections,
      totalMarks: paper.totalMarks,
      status: 'draft',
    });

    return memo.save();
  }

  static async getMemoByPaper(paperId: string): Promise<IPaperMemo> {
    const memo = await PaperMemo.findOne({ paperId }).lean().exec();
    if (!memo) throw new NotFoundError('Memo not found');
    return memo as IPaperMemo;
  }

  static async updateMemo(
    id: string,
    data: Record<string, unknown>,
  ): Promise<IPaperMemo> {
    const memo = await PaperMemo.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true },
    ).lean().exec();
    if (!memo) throw new NotFoundError('Memo not found');
    return memo as IPaperMemo;
  }
}
