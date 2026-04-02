import { PaperMemo, IPaperMemo, IMemoSection } from '../model.assessment.js';
import { GeneratedPaper, AIUsageLog } from '../../AITools/model.js';
import { AIService } from '../../../services/ai.service.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

interface AIMarkAllocation {
  criterion: string;
  marks: number;
}

interface AIMemoAnswer {
  questionNumber: string;
  expectedAnswer: string;
  markAllocation: AIMarkAllocation[];
  commonMistakes: string[];
  acceptableAlternatives: string[];
}

interface AIMemoSection {
  sectionTitle: string;
  answers: AIMemoAnswer[];
}

interface AIMemoResult {
  sections: AIMemoSection[];
}

function buildMemoSystemPrompt(): string {
  return `You are an expert South African CAPS-aligned examination memorandum author.
For each question provided, generate a complete marking memorandum entry.
Return valid JSON only with this exact structure:
{
  "sections": [
    {
      "sectionTitle": "Section A",
      "answers": [
        {
          "questionNumber": "1",
          "expectedAnswer": "Full model answer here...",
          "markAllocation": [
            { "criterion": "Criterion description", "marks": 2 }
          ],
          "commonMistakes": ["Mistake 1", "Mistake 2"],
          "acceptableAlternatives": ["Alternative phrasing 1"]
        }
      ]
    }
  ]
}
Rules:
- markAllocation entries must sum to the question's total marks
- Provide 2-3 commonMistakes per question
- Provide 1-2 acceptableAlternatives per question
- Model answers must be complete and CAPS-aligned`;
}

function buildMemoUserPrompt(
  subject: string,
  grade: number,
  topic: string,
  sections: Array<{ sectionLabel: string; questions: Array<{ questionNumber: number; questionText: string; marks: number; markingGuideline: string }> }>,
): string {
  const sectionSummaries = sections.map((s) => {
    const qs = s.questions.map(
      (q) => `Q${q.questionNumber} (${q.marks} marks): ${q.questionText}${q.markingGuideline ? `\nGuideline: ${q.markingGuideline}` : ''}`,
    ).join('\n');
    return `${s.sectionLabel}:\n${qs}`;
  }).join('\n\n');

  return `Generate a complete marking memorandum for the following exam paper:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}

Questions:
${sectionSummaries}`;
}

export class MemoService {
  static async generateMemo(
    paperId: string,
    teacherId: string,
    schoolId: string,
  ): Promise<IPaperMemo> {
    const paper = await GeneratedPaper.findOne({ _id: paperId, isDeleted: false }).lean().exec();
    if (!paper) throw new NotFoundError('Paper not found');

    const systemPrompt = buildMemoSystemPrompt();
    const userPrompt = buildMemoUserPrompt(
      paper.subject,
      paper.grade,
      paper.topic,
      paper.sections,
    );

    const { data: result, usage } = await AIService.generateJSONWithUsage<AIMemoResult>(
      systemPrompt,
      userPrompt,
    );

    const sections: IMemoSection[] = result.sections.map((s) => ({
      sectionTitle: s.sectionTitle,
      answers: s.answers.map((a) => ({
        questionNumber: a.questionNumber,
        expectedAnswer: a.expectedAnswer,
        markAllocation: a.markAllocation,
        commonMistakes: a.commonMistakes,
        acceptableAlternatives: a.acceptableAlternatives,
      })),
    }));

    await AIUsageLog.create({
      schoolId,
      teacherId,
      type: 'memo_generation',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    });

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

  static async regenerateAnswer(
    memoId: string,
    questionNumber: string,
    teacherId: string,
    schoolId: string,
  ): Promise<IPaperMemo> {
    const memo = await PaperMemo.findOne({ _id: memoId }).exec();
    if (!memo) throw new NotFoundError('Memo not found');

    const paper = await GeneratedPaper.findOne({ _id: memo.paperId, isDeleted: false }).lean().exec();
    if (!paper) throw new NotFoundError('Paper not found');

    // Locate the question in the paper
    let targetQuestion: { questionText: string; marks: number; markingGuideline: string } | null = null;
    let sectionLabel = '';
    for (const section of paper.sections) {
      const q = section.questions.find((pq) => String(pq.questionNumber) === questionNumber);
      if (q) {
        targetQuestion = q;
        sectionLabel = section.sectionLabel;
        break;
      }
    }

    if (!targetQuestion) throw new BadRequestError(`Question ${questionNumber} not found in paper`);

    const systemPrompt = `You are an expert South African CAPS-aligned examination memorandum author.
Generate a single marking memorandum answer entry. Return valid JSON only:
{
  "questionNumber": "${questionNumber}",
  "expectedAnswer": "Full model answer here...",
  "markAllocation": [{ "criterion": "Criterion", "marks": 1 }],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "acceptableAlternatives": ["Alternative 1"]
}
Rules: markAllocation must sum to ${targetQuestion.marks} marks. Provide 2-3 commonMistakes and 1-2 acceptableAlternatives.`;

    const userPrompt = `Regenerate the answer for:
Subject: ${paper.subject}, Grade: ${paper.grade}, Topic: ${paper.topic}
Section: ${sectionLabel}
Question ${questionNumber} (${targetQuestion.marks} marks): ${targetQuestion.questionText}
${targetQuestion.markingGuideline ? `Guideline: ${targetQuestion.markingGuideline}` : ''}`;

    const { data: newAnswer, usage } = await AIService.generateJSONWithUsage<AIMemoAnswer>(
      systemPrompt,
      userPrompt,
    );

    await AIUsageLog.create({
      schoolId,
      teacherId,
      type: 'memo_generation',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    });

    // Update the matching answer in the memo sections
    let updated = false;
    for (const section of memo.sections) {
      const answerIndex = section.answers.findIndex((a) => a.questionNumber === questionNumber);
      if (answerIndex !== -1) {
        section.answers[answerIndex] = {
          questionNumber: newAnswer.questionNumber,
          expectedAnswer: newAnswer.expectedAnswer,
          markAllocation: newAnswer.markAllocation,
          commonMistakes: newAnswer.commonMistakes,
          acceptableAlternatives: newAnswer.acceptableAlternatives,
        };
        updated = true;
        break;
      }
    }

    if (!updated) throw new BadRequestError(`Answer for question ${questionNumber} not found in memo`);

    memo.markModified('sections');
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
