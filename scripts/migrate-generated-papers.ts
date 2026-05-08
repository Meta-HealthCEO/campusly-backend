/**
 * Migrate GeneratedPaper docs to AssessmentPaper + PaperMemo.
 * One-shot, idempotent (skips already-migrated docs via soft-delete on the source).
 *
 * Run: npx tsx scripts/migrate-generated-papers.ts
 */
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import { config } from '../src/config/env.js';
import { GeneratedPaper } from '../src/modules/AITools/model.js';
import type { IPaperQuestion as IGenPaperQuestion } from '../src/modules/AITools/model.js';
import { AssessmentPaper } from '../src/modules/QuestionBank/model.js';
import type {
  IPaperSection as IAssessmentPaperSection,
  IPaperQuestion as IAssessmentPaperQuestion,
  IPaperQuestionDiagram,
  PaperType,
  PaperDifficulty,
} from '../src/modules/QuestionBank/model-papers.js';
import { PaperMemo } from '../src/modules/TeacherWorkbench/model.assessment.js';
import type {
  IMemoSection,
  IMemoAnswer,
} from '../src/modules/TeacherWorkbench/model.assessment.js';
import { Grade, Subject } from '../src/modules/Academic/model.js';
import { CurriculumNode } from '../src/modules/CurriculumStructure/model.js';
import { logger } from '../src/common/logger.js';

const PAPER_DIFFICULTIES: ReadonlySet<PaperDifficulty> = new Set([
  'easy',
  'medium',
  'hard',
]);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normaliseDifficulty(raw: string | undefined): PaperDifficulty {
  if (raw && PAPER_DIFFICULTIES.has(raw as PaperDifficulty)) {
    return raw as PaperDifficulty;
  }
  return 'medium';
}

async function findGradeByNumber(
  schoolId: Types.ObjectId,
  gradeNumber: number,
): Promise<{ _id: Types.ObjectId } | null> {
  // Grade.name is stored as e.g. "Grade 10" or "10" — try common patterns.
  const candidates = [
    `Grade ${gradeNumber}`,
    `Gr ${gradeNumber}`,
    `Gr. ${gradeNumber}`,
    String(gradeNumber),
  ];
  for (const candidate of candidates) {
    const match = await Grade.findOne({
      schoolId,
      isDeleted: false,
      name: { $regex: new RegExp(`^${escapeRegex(candidate)}$`, 'i') },
    })
      .select('_id')
      .lean<{ _id: Types.ObjectId } | null>();
    if (match) return match;
  }
  return null;
}

function mapDiagram(
  diagram: IGenPaperQuestion['diagram'],
): IPaperQuestionDiagram | null {
  if (!diagram) return null;
  return {
    tikz: diagram.tikz ?? null,
    caption: diagram.alt ?? null,
    svgUrl: diagram.svgUrl ?? null,
    renderStatus: diagram.renderStatus ?? 'pending',
  };
}

function buildPaperQuestions(
  questions: IGenPaperQuestion[],
): IAssessmentPaperQuestion[] {
  return questions.map((q, idx) => ({
    questionId: null,
    questionText: q.questionText ?? '',
    marks: q.marks ?? 1,
    position: idx,
    modelAnswer: q.modelAnswer ?? null,
    markingGuideline: q.markingGuideline ?? null,
    diagram: mapDiagram(q.diagram),
  }));
}

function buildMemoSections(
  sections: ReadonlyArray<{
    sectionLabel: string;
    questionType: string;
    questions: IGenPaperQuestion[];
  }>,
): IMemoSection[] {
  return sections.map((sec, sIdx) => {
    const sectionTitle =
      sec.sectionLabel?.trim().length > 0
        ? sec.sectionLabel
        : `Section ${sIdx + 1}`;
    const answers: IMemoAnswer[] = (sec.questions ?? []).map((q, qIdx) => {
      const questionNumber =
        Number.isFinite(q.questionNumber) && q.questionNumber > 0
          ? String(q.questionNumber)
          : `${sIdx + 1}.${qIdx + 1}`;
      const criterion =
        (q.markingGuideline ?? '').trim().length > 0
          ? q.markingGuideline
          : 'Full marks awarded for a correct answer';
      return {
        questionNumber,
        expectedAnswer: q.modelAnswer ?? '',
        markAllocation: [
          {
            criterion,
            marks: q.marks ?? 0,
          },
        ],
        commonMistakes: [],
        acceptableAlternatives: [],
      };
    });
    return { sectionTitle, answers };
  });
}

async function migrate(): Promise<void> {
  await mongoose.connect(config.mongodb.uri);
  logger.info('Connected to MongoDB');

  const generated = await GeneratedPaper.find({ isDeleted: false }).lean();
  logger.info(`Found ${generated.length} GeneratedPaper docs to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const gp of generated) {
    try {
      const subjectName = String(gp.subject ?? '').trim();
      if (!subjectName) {
        logger.warn(`Skipping GeneratedPaper ${String(gp._id)}: empty subject`);
        skipped++;
        continue;
      }

      const subject = await Subject.findOne({
        schoolId: gp.schoolId,
        isDeleted: false,
        name: { $regex: new RegExp(`^${escapeRegex(subjectName)}$`, 'i') },
      })
        .select('_id')
        .lean<{ _id: Types.ObjectId } | null>();
      if (!subject) {
        logger.warn(
          `Skipping GeneratedPaper ${String(gp._id)}: subject "${subjectName}" not found for school ${String(gp.schoolId)}`,
        );
        skipped++;
        continue;
      }

      const grade = await findGradeByNumber(gp.schoolId, gp.grade);
      if (!grade) {
        logger.warn(
          `Skipping GeneratedPaper ${String(gp._id)}: grade ${gp.grade} not found for school ${String(gp.schoolId)}`,
        );
        skipped++;
        continue;
      }

      const topicTitle = String(gp.topic ?? '').trim();
      const topicNode = topicTitle
        ? await CurriculumNode.findOne({
            type: 'topic',
            isDeleted: false,
            title: { $regex: new RegExp(`^${escapeRegex(topicTitle)}`, 'i') },
          })
            .select('_id')
            .lean<{ _id: Types.ObjectId } | null>()
        : null;
      if (!topicNode) {
        logger.warn(
          `Skipping GeneratedPaper ${String(gp._id)}: topic "${topicTitle}" not matched in CurriculumNode`,
        );
        skipped++;
        continue;
      }

      const sections: IAssessmentPaperSection[] = (gp.sections ?? []).map(
        (s, sIdx) => ({
          title:
            s.sectionLabel?.trim().length > 0
              ? s.sectionLabel
              : `Section ${sIdx + 1}`,
          instructions: s.questionType ?? '',
          order: sIdx,
          questions: buildPaperQuestions(s.questions ?? []),
        }),
      );

      const year = gp.createdAt
        ? new Date(gp.createdAt).getFullYear()
        : new Date().getFullYear();
      const title = `${subjectName} — Grade ${gp.grade} — ${topicTitle || 'Paper'} (Term ${gp.term})`;

      const paper = await AssessmentPaper.create({
        title,
        schoolId: gp.schoolId,
        subjectId: subject._id,
        gradeId: grade._id,
        topicIds: [topicNode._id],
        term: gp.term,
        year,
        paperType: 'class_test' satisfies PaperType,
        duration: gp.duration ?? 60,
        totalMarks: gp.totalMarks ?? 0,
        difficulty: normaliseDifficulty(gp.difficulty),
        aiGenerated: true,
        sections,
        instructions: '',
        status: 'draft',
        createdBy: gp.teacherId,
      });

      const memoSections = buildMemoSections(gp.sections ?? []);
      await PaperMemo.create({
        paperId: paper._id,
        schoolId: gp.schoolId,
        teacherId: gp.teacherId,
        sections: memoSections,
        totalMarks: gp.totalMarks ?? 0,
        status: 'draft',
      });

      await GeneratedPaper.updateOne(
        { _id: gp._id },
        { $set: { isDeleted: true } },
      );
      migrated++;
      logger.info(
        `Migrated GeneratedPaper ${String(gp._id)} -> AssessmentPaper ${String(paper._id)}`,
      );
    } catch (err: unknown) {
      logger.error(
        { err, paperId: String(gp._id) },
        'Failed to migrate GeneratedPaper',
      );
      skipped++;
    }
  }

  logger.info(`Migration complete. Migrated: ${migrated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err: unknown) => {
  logger.error({ err }, 'Migration failed');
  process.exit(1);
});
