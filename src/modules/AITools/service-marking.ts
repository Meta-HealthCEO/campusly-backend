import { GeneratedPaper } from './model.js';
import { AssessmentPaper, Question } from '../QuestionBank/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { AIUsageLog } from './model.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

interface MarkPaperQuestionResult {
  questionNumber: number;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

export interface MarkPaperResult {
  studentName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  questions: MarkPaperQuestionResult[];
}

interface MemoQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  modelAnswer: string;
  markingGuideline: string;
}

interface MarkPaperFromImageData {
  paperId: string;
  studentName: string;
  image: string;
  imageType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export async function markPaperFromImage(
  teacherId: string,
  schoolId: string,
  data: MarkPaperFromImageData,
): Promise<MarkPaperResult> {
  const memoQuestions: MemoQuestion[] = [];
  let paperTitle = '';
  let paperMaxMarks = 0;

  const generatedPaper = await GeneratedPaper.findOne({
    _id: data.paperId,
    schoolId,
    isDeleted: false,
  });

  if (generatedPaper) {
    paperTitle = `${generatedPaper.subject} - Grade ${generatedPaper.grade} - ${generatedPaper.topic}`;
    paperMaxMarks = generatedPaper.totalMarks;
    for (const section of generatedPaper.sections) {
      for (const q of section.questions) {
        memoQuestions.push({
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          marks: q.marks,
          modelAnswer: q.modelAnswer,
          markingGuideline: q.markingGuideline,
        });
      }
    }
  } else {
    const assessmentPaper = await AssessmentPaper.findOne({
      _id: data.paperId,
      schoolId,
      isDeleted: false,
    });

    if (!assessmentPaper) {
      throw new NotFoundError('Paper not found');
    }

    paperTitle = assessmentPaper.title;
    paperMaxMarks = assessmentPaper.totalMarks;

    const questionIds = assessmentPaper.sections.flatMap(
      (s) => s.questions.map((q) => q.questionId),
    );

    const questions = await Question.find({
      _id: { $in: questionIds },
      isDeleted: false,
    });

    const questionMap = new Map(
      questions.map((q) => [String(q._id), q]),
    );

    for (const section of assessmentPaper.sections) {
      for (const pq of section.questions) {
        const question = questionMap.get(String(pq.questionId));
        if (question) {
          memoQuestions.push({
            questionNumber: parseInt(pq.questionNumber, 10) || memoQuestions.length + 1,
            questionText: question.stem,
            marks: pq.marks,
            modelAnswer: question.answer,
            markingGuideline: question.markingRubric,
          });
        }
      }
    }
  }

  if (memoQuestions.length === 0) {
    throw new BadRequestError('Paper has no questions to mark against');
  }

  const memoText = memoQuestions
    .map(
      (q: MemoQuestion) =>
        `Question ${q.questionNumber} (${q.marks} marks):\n` +
        `  Question: ${q.questionText}\n` +
        `  Correct Answer: ${q.modelAnswer}\n` +
        `  Marking Guideline: ${q.markingGuideline}`,
    )
    .join('\n\n');

  const systemPrompt = `You are marking a South African school test paper. You will be shown a photograph of a student's handwritten answers. Compare each answer against the memo provided. Award marks according to the marking guideline. For partial answers, award partial marks where appropriate. Be fair but accurate.

Return ONLY valid JSON with this exact structure:
{
  "studentName": "${data.studentName}",
  "totalMarks": <number>,
  "maxMarks": ${paperMaxMarks},
  "percentage": <number>,
  "questions": [
    {
      "questionNumber": <number>,
      "studentAnswer": "<what you read from the handwriting>",
      "correctAnswer": "<from the memo>",
      "marksAwarded": <number>,
      "maxMarks": <number>,
      "feedback": "<brief explanation of marks awarded>"
    }
  ]
}

Important:
- Read the handwriting carefully. If you cannot read a word, indicate [illegible].
- Match each visible answer to the corresponding question number.
- If a question appears unanswered, award 0 marks and note "No answer provided".
- The percentage should be calculated as (totalMarks / maxMarks * 100), rounded to 1 decimal.
- Return ONLY JSON. No markdown fences, no explanation.`;

  const userPrompt = `Paper: ${paperTitle}\nTotal Marks: ${paperMaxMarks}\n\nMEMORANDUM:\n${memoText}\n\nPlease read the student's handwritten answers from the attached image and grade them against this memo.`;

  const { text, usage } = await AIService.generateVisionCompletion(
    systemPrompt,
    userPrompt,
    data.image,
    data.imageType,
    { maxTokens: 4096, temperature: 0.2 },
  );

  await AIUsageLog.create({
    schoolId,
    teacherId,
    type: 'paper_marking',
    tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
    aiModel: ANTHROPIC_MODEL,
  });

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const result = JSON.parse(cleaned) as MarkPaperResult;
  result.studentName = data.studentName;

  return result;
}
