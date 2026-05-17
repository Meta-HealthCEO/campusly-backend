import type { Types } from 'mongoose';
import { LessonService } from './service.js';
import type { ILesson, ILessonMaterial, LessonMaterialKind, LessonPhase } from './types.js';
import { LESSON_PHASES } from './types.js';
import { School } from '../School/model.js';
import { HomeworkService } from '../Homework/service.js';
import { collectPaperQuestions } from '../QuestionBank/service-papers-helpers.js';
import type { IQuestion, IPaperQuestion, IPaperSection } from '../QuestionBank/model.js';
import type { IContentBlock } from '../ContentLibrary/model.js';
import { createDocument, finalise } from '../../common/pdf/document.js';
import { checkPageSpace } from '../../common/pdf/primitives.js';
import { renderMemoSections, renderQuestionSections } from '../../common/pdf/question-rendering.js';
import type {
  NormalisedQuestion,
  NormalisedQuestionOption,
  NormalisedQuestionType,
  NormalisedSection,
} from '../../common/pdf/types.js';
import {
  CONTENT_WIDTH,
  FONT_ITALIC,
  FONT_NORMAL,
  FONT_TITLE,
  MARGIN,
  PAGE_WIDTH,
} from '../../common/pdf/constants.js';
import { schoolIdFromScope, type LessonScope } from './service-access.js';
import { logger } from '../../common/logger.js';
import { renderPremiumLessonPdf } from './service-export-premium.js';

const PHASE_LABELS: Record<LessonPhase, string> = {
  introduction: 'Introduction',
  direct_instruction: 'Direct instruction',
  practice: 'Practice',
  assessment: 'Assessment',
  homework: 'Homework',
};

const KIND_LABELS: Record<LessonMaterialKind, string> = {
  reading: 'Reading',
  worksheet: 'Worksheet',
  activity: 'Activity',
  study_notes: 'Study notes',
  worked_example: 'Worked example',
  quiz: 'Quiz',
  practice_questions: 'Practice questions',
  homework: 'Homework',
  paper: 'Assessment paper',
};

const MAX_MATERIALS = 30;
const BLUE = '#1d4ed8';
const DARK = '#111827';
const MUTED = '#6b7280';
const BORDER = '#d1d5db';
const LIGHT = '#eff6ff';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const DIAGRAM_BASE_DIR = `${UPLOAD_DIR}/diagrams`;
const DIAGRAM_URL_PREFIX = '/uploads/diagrams';

type PackMode = 'teacher' | 'student';

interface PackContext {
  mode: PackMode;
  schoolId: string;
  schoolName: string;
  lesson: ILesson;
}

interface MarkdownTable {
  headers: string[];
  rows: string[][];
}

interface MermaidNode {
  id: string;
  label: string;
  children: string[];
  parents: string[];
}

interface MermaidGraph {
  direction: 'TD' | 'LR';
  nodes: Map<string, MermaidNode>;
  rootIds: string[];
}

async function renderLessonPdf(
  lessonId: string,
  scope: LessonScope,
  mode: PackMode,
): Promise<Buffer> {
  const schoolId = schoolIdFromScope(scope);
  const [lesson, school] = await Promise.all([
    LessonService.getById(lessonId, scope),
    School.findOne({ _id: schoolId, isDeleted: false }).select('name').lean(),
  ]);

  if (lesson.materials.length > MAX_MATERIALS) {
    throw new Error('Lesson too large to export - split it into two lessons first');
  }

  const doc = createDocument();
  const ctx: PackContext = {
    mode,
    schoolId,
    schoolName: readName(school, 'Campusly'),
    lesson,
  };

  renderCoverPage(doc, ctx);
  renderOverviewPage(doc, ctx);

  for (const phase of LESSON_PHASES) {
    await renderPhase(doc, ctx, phase);
  }

  return finalise(doc);
}

function renderCoverPage(doc: PDFKit.PDFDocument, ctx: PackContext): void {
  const { lesson, mode } = ctx;
  const packTitle = mode === 'teacher' ? 'Teacher Pack' : 'Student Pack';
  const topic = readName(lesson.curriculumNodeId, 'Curriculum topic');
  const subject = resolveSubjectName(lesson);
  const grade = resolveGradeName(lesson);

  doc
    .rect(MARGIN, MARGIN, CONTENT_WIDTH, 155)
    .fill(LIGHT);
  doc.fillColor(DARK).font(FONT_TITLE).fontSize(11).text(ctx.schoolName, MARGIN + 24, MARGIN + 22);
  doc.fillColor(BLUE).font(FONT_TITLE).fontSize(12).text(packTitle.toUpperCase(), {
    align: 'right',
  });

  doc.moveDown(2.5);
  doc
    .fillColor(DARK)
    .font(FONT_TITLE)
    .fontSize(24)
    .text(lesson.title, MARGIN + 24, doc.y, {
      width: CONTENT_WIDTH - 48,
      align: 'center',
    });

  doc.moveDown(0.7);
  doc
    .font(FONT_NORMAL)
    .fontSize(12)
    .fillColor(MUTED)
    .text(topic, { width: CONTENT_WIDTH - 48, align: 'center' });

  doc.moveDown(4);
  renderMetaTable(doc, [
    ['Subject', subject],
    ['Grade', grade],
    ['Term', lesson.termNumber ? `Term ${lesson.termNumber}` : 'Term not set'],
    ['Duration', `${lesson.durationMinutes} minutes`],
    ['Generated', formatDate(new Date())],
  ]);

  if (mode === 'student') {
    doc.moveDown(2);
    doc.font(FONT_TITLE).fontSize(11).fillColor(DARK).text('Learner details');
    doc.moveDown(0.6);
    drawWriteLine(doc, 'Name');
    drawWriteLine(doc, 'Class');
    drawWriteLine(doc, 'Date');
  } else if (lesson.assignedClasses.length > 0) {
    doc.moveDown(1.5);
    doc.font(FONT_TITLE).fontSize(11).fillColor(DARK).text('Scheduled classes');
    doc.moveDown(0.4);
    for (const assignment of lesson.assignedClasses) {
      const className = readName(assignment.classId, 'Class');
      const status = assignment.status === 'taught' ? ' (taught)' : '';
      doc.font(FONT_NORMAL).fontSize(10).text(
        `- ${className}: ${formatDate(assignment.scheduledDate)}${status}`,
        { width: CONTENT_WIDTH },
      );
    }
  }

  doc.addPage();
}

function renderOverviewPage(doc: PDFKit.PDFDocument, ctx: PackContext): void {
  renderDocumentHeading(doc, ctx.mode === 'teacher' ? 'Lesson Overview' : 'Learning Overview');
  doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(
    ctx.mode === 'teacher'
      ? 'This pack contains the full lesson sequence, printable learner materials, and teacher-only notes, answers and marking guidance.'
      : 'This pack contains the lesson materials, activities and practice work for learners. Answer keys and teacher notes are not included.',
    { width: CONTENT_WIDTH },
  );
  doc.moveDown(1);

  if (ctx.lesson.objectives.length > 0) {
    renderSubheading(doc, 'Learning objectives');
    renderBullets(doc, ctx.lesson.objectives);
    doc.moveDown(0.7);
  }

  const rows = ctx.lesson.materials
    .filter((material) => ctx.mode === 'teacher' || !isPlaceholder(material))
    .map((material) => {
      const phase = findMaterialPhase(ctx.lesson, material._id);
      return [
        phase ? PHASE_LABELS[phase] : 'Lesson',
        KIND_LABELS[material.kind],
        material.title,
      ];
    });

  if (rows.length > 0) {
    renderSubheading(doc, 'Pack contents');
    renderSimpleTable(doc, ['Phase', 'Type', 'Material'], rows);
  }

  doc.addPage();
}

async function renderPhase(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  phase: LessonPhase,
): Promise<void> {
  const entry = ctx.lesson.phases.find((p) => p.phase === phase);
  if (!entry || entry.materialIds.length === 0) return;

  const phaseMaterials = entry.materialIds
    .map((id) => ctx.lesson.materials.find((m) => m._id.toString() === id.toString()))
    .filter((material): material is ILessonMaterial => !!material)
    .filter((material) => ctx.mode === 'teacher' || !isPlaceholder(material));

  if (phaseMaterials.length === 0) return;

  if (doc.y > MARGIN + 80) doc.addPage();
  checkPageSpace(doc, 90);
  renderDocumentHeading(doc, PHASE_LABELS[phase]);
  for (const [index, material] of phaseMaterials.entries()) {
    if (index > 0) doc.addPage();
    await renderMaterial(doc, ctx, material);
  }
}

async function renderMaterial(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<void> {
  checkPageSpace(doc, 90);
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 38, 4).fillAndStroke('#f9fafb', BORDER);
  doc
    .fillColor(BLUE)
    .font(FONT_TITLE)
    .fontSize(9.5)
    .text(KIND_LABELS[material.kind].toUpperCase(), MARGIN + 12, y + 12, {
      continued: true,
    })
    .fillColor(DARK)
    .fontSize(11)
    .text(`  ${material.title}`, { width: CONTENT_WIDTH - 24 });
  doc.y = y + 52;

  if (ctx.mode === 'teacher' && material.teacherNotes) {
    renderTeacherNote(doc, material.teacherNotes);
  }

  if (isPlaceholder(material)) {
    renderMuted(doc, 'This material is still a placeholder and has not been generated yet.');
    doc.moveDown(0.6);
    return;
  }

  switch (material.kind) {
    case 'reading':
      renderReading(doc, ctx, material);
      break;
    case 'worksheet':
    case 'activity':
    case 'study_notes':
    case 'worked_example':
      renderContentBackedMaterial(doc, ctx, material);
      break;
    case 'practice_questions':
      renderQuestionMaterial(doc, ctx, 'Practice Questions', getArray(material, 'questionIds'));
      break;
    case 'homework':
      await renderHomeworkMaterial(doc, ctx, material);
      break;
    case 'paper':
      await renderPaperMaterial(doc, ctx, material);
      break;
    case 'quiz':
      renderQuizMaterial(doc, ctx, material);
      break;
  }

  doc.moveDown(0.8);
}

function renderReading(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  material: ILessonMaterial,
): void {
  const ref = getRecord(material, 'textbookRef');
  if (ref) {
    const source = getString(ref.source);
    if (source === 'internal') {
      const textbook = readName(ref.textbookId, 'Textbook');
      const pages = formatPageRange(ref.pageStart, ref.pageEnd);
      renderMuted(doc, `${textbook}${pages ? `, ${pages}` : ''}`);
    } else {
      const title = getString(ref.title) || 'Textbook reference';
      const publisher = getString(ref.publisher);
      const pages = formatPageRange(ref.pageStart, ref.pageEnd);
      renderMuted(doc, [title, publisher, pages].filter(Boolean).join(' - '));
      const excerpt = getString(ref.excerpt);
      if (excerpt) {
        doc.moveDown(0.4);
        renderMarkdownish(doc, excerpt);
      }
    }
    const notes = getString(ref.notes);
    if (notes && ctx.mode === 'teacher') renderTeacherNote(doc, notes);
  }

  renderQuestionMaterial(doc, ctx, 'Comprehension Questions', getArray(material, 'comprehensionQuestionIds'));
}

function renderContentBackedMaterial(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  material: ILessonMaterial,
): void {
  const resource = getRecord(material, 'contentResourceId');
  if (!resource) {
    renderMuted(doc, 'The linked content resource could not be loaded.');
    return;
  }

  const blocks = getArray(resource, 'blocks')
    .filter((block): block is IContentBlock => isRecord(block))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (blocks.length === 0) {
    renderMuted(doc, 'No printable content blocks are available yet.');
    return;
  }

  for (const block of blocks) {
    renderContentBlock(doc, ctx, block);
    doc.moveDown(0.45);
  }
}

async function renderHomeworkMaterial(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<void> {
  const homework = await resolveHomework(material, ctx.schoolId);
  if (!homework) {
    renderMuted(doc, 'The linked homework could not be loaded.');
    return;
  }

  renderMetaLine(doc, [
    `Due: ${formatDate(homework.dueDate)}`,
    `Marks: ${String(homework.totalMarks ?? 0)}`,
    `Type: ${titleCase(String(homework.type ?? 'homework'))}`,
  ]);

  if (homework.type === 'reading') {
    const resource = isRecord(homework.contentResourceId) ? homework.contentResourceId : null;
    if (resource) {
      renderSubheading(doc, 'Reading');
      for (const block of getArray(resource, 'blocks').filter((b): b is IContentBlock => isRecord(b))) {
        renderContentBlock(doc, ctx, block);
      }
    }
    renderQuestionMaterial(doc, ctx, 'Comprehension Questions', getArray(homework, 'comprehensionQuestionIds'));
    return;
  }

  if (homework.type === 'quiz' && isRecord(homework.quizId)) {
    renderQuiz(doc, ctx, homework.quizId);
    return;
  }

  renderQuestionMaterial(doc, ctx, 'Homework Questions', getArray(homework, 'exerciseQuestionIds'));
}

async function renderPaperMaterial(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<void> {
  const paper = getRecord(material, 'paperId');
  if (!paper) {
    renderMuted(doc, 'The linked paper could not be loaded.');
    return;
  }

  renderMetaLine(doc, [
    `${String(paper.totalMarks ?? 0)} marks`,
    `${String(paper.duration ?? 0)} minutes`,
    `Term ${String(paper.term ?? ctx.lesson.termNumber ?? '')}`,
  ]);

  const instructions = getString(paper.instructions);
  if (instructions) {
    renderSubheading(doc, 'Instructions');
    renderMarkdownish(doc, instructions);
  }

  const sections = await normalisePaperSections(paper, ctx.schoolId);
  if (sections.length === 0) {
    renderMuted(doc, 'This paper has no printable questions yet.');
    return;
  }

  renderQuestionSections(doc, sections, {
    baseDir: DIAGRAM_BASE_DIR,
    urlPrefix: DIAGRAM_URL_PREFIX,
  });

  if (ctx.mode === 'teacher') {
    checkPageSpace(doc, 80);
    renderSubheading(doc, 'Memo');
    renderMemoSections(doc, sections, {
      baseDir: DIAGRAM_BASE_DIR,
      urlPrefix: DIAGRAM_URL_PREFIX,
    });
  }
}

function renderQuizMaterial(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  material: ILessonMaterial,
): void {
  const quiz = getRecord(material, 'quizId');
  if (!quiz) {
    renderMuted(doc, 'The linked quiz could not be loaded.');
    return;
  }
  renderQuiz(doc, ctx, quiz);
}

function renderQuiz(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  quiz: Record<string, unknown>,
): void {
  const questions = getArray(quiz, 'questions');
  if (questions.length === 0) {
    renderMuted(doc, 'This quiz has no questions yet.');
    return;
  }

  const section: NormalisedSection = {
    title: readName(quiz, 'Quiz'),
    instructions: '',
    questions: questions
      .filter((q): q is Record<string, unknown> => isRecord(q))
      .map((q, index) => normaliseQuizQuestion(q, index)),
  };
  renderQuestionSections(doc, [section], {
    baseDir: DIAGRAM_BASE_DIR,
    urlPrefix: DIAGRAM_URL_PREFIX,
  });

  if (ctx.mode === 'teacher') {
    renderSubheading(doc, 'Quiz memo');
    renderMemoSections(doc, [section], {
      baseDir: DIAGRAM_BASE_DIR,
      urlPrefix: DIAGRAM_URL_PREFIX,
    });
  }
}

function renderQuestionMaterial(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  title: string,
  questions: unknown[],
): void {
  const normalised = questions
    .filter((q): q is Record<string, unknown> => isRecord(q))
    .map((q, index) => normaliseBankQuestion(q, index));

  if (normalised.length === 0) {
    renderMuted(doc, 'No printable questions are available yet.');
    return;
  }

  const section: NormalisedSection = { title, instructions: '', questions: normalised };
  renderQuestionSections(doc, [section], {
    baseDir: DIAGRAM_BASE_DIR,
    urlPrefix: DIAGRAM_URL_PREFIX,
  });

  if (ctx.mode === 'teacher') {
    renderSubheading(doc, `${title} Memo`);
    renderMemoSections(doc, [section], {
      baseDir: DIAGRAM_BASE_DIR,
      urlPrefix: DIAGRAM_URL_PREFIX,
    });
  }
}

function renderContentBlock(
  doc: PDFKit.PDFDocument,
  ctx: PackContext,
  block: IContentBlock,
): void {
  checkPageSpace(doc, 70);

  if (block.type === 'text') {
    renderMarkdownish(doc, block.content);
    return;
  }

  if (block.type === 'quiz') {
    const quiz = parseJsonRecord(block.content);
    const question = stripMarkdown(getString(quiz.question) || getString(block.content));
    renderSubheading(doc, 'Checkpoint');
    doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(question, { width: CONTENT_WIDTH });
    const options = normaliseContentOptions(
      quiz.options ?? block.metadata?.options,
      quiz.correctIndex,
      quiz.correctAnswer ?? block.metadata?.correctAnswer,
    );
    renderOptionsList(doc, options, false);
    if (ctx.mode === 'teacher') {
      renderTeacherAnswer(
        doc,
        options,
        getString(quiz.explanation) || block.explanation,
      );
    }
    return;
  }

  if (block.type === 'fill_blank') {
    const data = parseJsonRecord(block.content);
    renderSubheading(doc, 'Fill in the blanks');
    renderMarkdownish(doc, getString(data.text) || block.content);
    if (ctx.mode === 'teacher') {
      const answerSource = getArray(data, 'blanks').length > 0
        ? getArray(data, 'blanks')
        : getArray(block.metadata, 'blanks');
      const answers = answerSource.map((value) => String(value));
      renderTeacherAnswerText(doc, answers.length ? answers.join(', ') : block.explanation);
    }
    return;
  }

  if (block.type === 'match_columns') {
    const data = parseJsonRecord(block.content);
    renderSubheading(doc, 'Match the columns');
    renderMarkdownish(doc, block.content.startsWith('{') ? 'Match each item in Column A with Column B.' : block.content);
    renderTwoColumns(doc, getArray(data, 'left'), getArray(data, 'right'));
    if (ctx.mode === 'teacher') {
      const pairs = getArray(data, 'correctPairs').map((pair) => Array.isArray(pair) ? pair.join(' -> ') : String(pair));
      renderTeacherAnswerText(doc, pairs.join('; '));
    }
    return;
  }

  if (block.type === 'ordering') {
    const data = parseJsonRecord(block.content);
    renderSubheading(doc, 'Order the items');
    const items = getArray(data, 'items').map((value) => String(value));
    renderNumbered(doc, items);
    if (ctx.mode === 'teacher') {
      const order = getArray(data, 'correctOrder').map((value) => Number(value));
      const answer = order.map((index) => items[index]).filter(Boolean).join(' -> ');
      renderTeacherAnswerText(doc, answer);
    }
    return;
  }

  if (block.type === 'step_reveal') {
    const data = parseJsonRecord(block.content);
    const steps = getArray(data, 'steps').filter((s): s is Record<string, unknown> => isRecord(s));
    renderSubheading(doc, 'Worked steps');
    for (const [index, step] of steps.entries()) {
      doc.font(FONT_TITLE).fontSize(10).fillColor(DARK).text(`${index + 1}. ${readName(step, 'Step')}`);
      renderMarkdownish(doc, getString(step.content));
      doc.moveDown(0.2);
    }
    return;
  }

  if (block.type === 'image' || block.type === 'video') {
    if (block.type === 'image' && renderMermaidDiagram(doc, block)) return;
    renderMediaPlaceholder(doc, block);
    return;
  }

  renderSubheading(doc, titleCase(block.type));
  renderMarkdownish(doc, block.content);
}

async function resolveHomework(
  material: ILessonMaterial,
  schoolId: string,
): Promise<Record<string, unknown> | null> {
  const ref = getRecord(material, 'homeworkId');
  const id = getId((material as unknown as Record<string, unknown>).homeworkId);
  if (!id) return ref;
  try {
    return await HomeworkService.getById(id, schoolId) as unknown as Record<string, unknown>;
  } catch {
    return ref;
  }
}

async function normalisePaperSections(
  paper: Record<string, unknown>,
  schoolId: string,
): Promise<NormalisedSection[]> {
  const sections = getArray(paper, 'sections').filter((s): s is IPaperSection => isRecord(s));
  if (sections.length === 0) return [];

  const bankQuestions = await collectPaperQuestions(sections, schoolId);
  const questionMap = new Map<string, IQuestion>();
  for (const question of bankQuestions) questionMap.set(question._id.toString(), question);

  return sections
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((section, sectionIndex) => ({
      title: section.title,
      instructions: section.instructions,
      questions: section.questions
        .sort((a, b) => a.position - b.position)
        .map((question) => normalisePaperQuestion(question, sectionIndex, questionMap)),
    }))
    .filter((section) => section.questions.length > 0);
}

function normalisePaperQuestion(
  question: IPaperQuestion,
  sectionIndex: number,
  bankQuestions: Map<string, IQuestion>,
): NormalisedQuestion {
  const bank = question.questionId ? bankQuestions.get(question.questionId.toString()) : undefined;
  const options = normaliseQuestionOptions(
    bank?.options?.length ? bank.options : question.options,
  );
  return {
    number: `${sectionIndex + 1}.${question.position + 1}`,
    marks: question.marks ?? bank?.marks ?? 0,
    stem: stripMarkdown(question.questionText ?? bank?.stem ?? ''),
    type: mapQuestionType(bank?.type, options),
    options,
    answer: stripMarkdown(question.modelAnswer ?? bank?.answer ?? ''),
    markingRubric: stripMarkdown(question.markingGuideline ?? bank?.markingRubric ?? ''),
    diagram: null,
  };
}

function normaliseBankQuestion(question: Record<string, unknown>, index: number): NormalisedQuestion {
  const options = normaliseQuestionOptions(getArray(question, 'options'));
  return {
    number: String(index + 1),
    marks: Number(question.marks ?? 0),
    stem: stripMarkdown(getString(question.stem)),
    type: mapQuestionType(getString(question.type), options),
    options,
    answer: stripMarkdown(getString(question.answer)),
    markingRubric: stripMarkdown(getString(question.markingRubric)),
    diagram: null,
  };
}

function normaliseQuizQuestion(question: Record<string, unknown>, index: number): NormalisedQuestion {
  const rawOptions = getArray(question, 'options')
    .filter((option): option is Record<string, unknown> => isRecord(option))
    .map((option, optIndex) => ({
      label: optionLabel(optIndex),
      text: stripMarkdown(getString(option.text)),
      isCorrect: Boolean(option.isCorrect),
    }));

  return {
    number: String(index + 1),
    marks: Number(question.points ?? 1),
    stem: stripMarkdown(getString(question.questionText)),
    type: mapQuestionType(getString(question.questionType), rawOptions),
    options: rawOptions,
    answer: stripMarkdown(getString(question.correctAnswer)),
    markingRubric: stripMarkdown(getString(question.explanation)),
    diagram: null,
  };
}

function normaliseContentOptions(
  raw: unknown,
  correctIndex?: unknown,
  correctAnswer?: unknown,
): NormalisedQuestionOption[] {
  if (!Array.isArray(raw)) return [];
  if (typeof raw[0] === 'string') {
    return raw.map((text, index) => ({
      label: optionLabel(index),
      text: stripMarkdown(String(text)),
      isCorrect: correctIndex === index || String(text).trim() === getString(correctAnswer),
    }));
  }
  const options = normaliseQuestionOptions(raw);
  if (options.some((option) => option.isCorrect)) return options;
  const answer = getString(correctAnswer);
  if (!answer) return options;
  return options.map((option) => ({
    ...option,
    isCorrect: option.text.trim() === answer || option.label.trim() === answer,
  }));
}

function normaliseQuestionOptions(raw: unknown): NormalisedQuestionOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item, index) => ({
      label: getString(item.label) || optionLabel(index),
      text: stripMarkdown(getString(item.text)),
      isCorrect: Boolean(item.isCorrect),
    }));
}

function mapQuestionType(
  type: unknown,
  options: NormalisedQuestionOption[],
): NormalisedQuestionType {
  const value = String(type ?? '').toLowerCase();
  if (value === 'mcq' || value === 'multiple_choice') return 'mcq';
  if (value === 'true_false') return 'true_false';
  if (value === 'structured') return 'structured';
  if (value === 'essay' || value === 'long') return 'long';
  return options.length > 0 ? 'mcq' : 'short';
}

function renderDocumentHeading(doc: PDFKit.PDFDocument, title: string): void {
  checkPageSpace(doc, 70);
  doc.font(FONT_TITLE).fontSize(18).fillColor(DARK).text(stripMarkdown(title), { width: CONTENT_WIDTH });
  doc
    .moveTo(MARGIN, doc.y + 6)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y + 6)
    .strokeColor(BORDER)
    .stroke();
  doc.moveDown(1.1);
}

function renderSubheading(doc: PDFKit.PDFDocument, title: string): void {
  checkPageSpace(doc, 42);
  doc.font(FONT_TITLE).fontSize(13).fillColor(DARK).text(stripMarkdown(title), { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
}

function renderTeacherNote(doc: PDFKit.PDFDocument, note: string): void {
  checkPageSpace(doc, 45);
  const y = doc.y;
  const height = Math.max(34, estimateTextHeight(note, 9) + 18);
  doc
    .roundedRect(MARGIN, y, CONTENT_WIDTH, height, 4)
    .fillAndStroke('#fef3c7', '#f59e0b');
  doc
    .font(FONT_TITLE)
    .fontSize(8)
    .fillColor('#92400e')
    .text('TEACHER NOTE', MARGIN + 10, y + 8);
  doc
    .font(FONT_NORMAL)
    .fontSize(9)
    .fillColor(DARK)
    .text(note, MARGIN + 10, y + 20, { width: CONTENT_WIDTH - 20 });
  doc.y = y + height;
  doc.moveDown(0.8);
}

function renderTeacherAnswer(
  doc: PDFKit.PDFDocument,
  options: NormalisedQuestionOption[],
  explanation: string,
): void {
  const correct = options.find((option) => option.isCorrect);
  const answer = correct ? `${correct.label}. ${correct.text}` : '';
  renderTeacherAnswerText(doc, [answer, explanation].filter(Boolean).join('\n'));
}

function renderTeacherAnswerText(doc: PDFKit.PDFDocument, answer: string): void {
  const clean = cleanPrintableText(answer, { preserveLineBreaks: true });
  if (!clean) return;
  checkPageSpace(doc, 35);
  doc.font(FONT_TITLE).fontSize(9).fillColor(BLUE).text('Teacher answer:', { continued: true });
  doc.font(FONT_NORMAL).fontSize(9).fillColor(DARK).text(` ${clean}`, { width: CONTENT_WIDTH });
  doc.moveDown(0.35);
}

function renderMarkdownish(doc: PDFKit.PDFDocument, value: unknown): void {
  const text = getString(value).replace(/\r\n/g, '\n').trim();
  if (!text) return;

  const lines = text.split('\n');
  let paragraphBuffer: string[] = [];

  const flushParagraphs = (): void => {
    if (paragraphBuffer.length === 0) return;
    renderMarkdownParagraphs(doc, paragraphBuffer.join('\n'));
    paragraphBuffer = [];
  };

  for (let index = 0; index < lines.length;) {
    const parsed = parseMarkdownTable(lines, index);
    if (parsed) {
      flushParagraphs();
      renderMarkdownTable(doc, parsed.table);
      index = parsed.nextIndex;
      continue;
    }

    paragraphBuffer.push(lines[index] ?? '');
    index += 1;
  }

  flushParagraphs();
}

function renderMarkdownParagraphs(doc: PDFKit.PDFDocument, rawText: string): void {
  const text = cleanPrintableText(rawText, { preserveLineBreaks: true }).trim();
  if (!text) return;

  for (const rawBlock of text.split(/\n{2,}/)) {
    const lines = rawBlock.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines.length === 1) {
      renderMarkdownLine(doc, lines[0] ?? '');
      continue;
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      renderBullets(doc, lines.map((line) => line.replace(/^[-*]\s+/, '')));
      continue;
    }

    if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      renderNumbered(doc, lines.map((line) => line.replace(/^\d+[.)]\s+/, '')));
      continue;
    }

    if (
      lines.some((line) => isDisplayFormula(line)
        || isLabelLine(line)
        || /^#{1,5}\s+/.test(line)
        || /^>/.test(line)
        || /^[-*]\s+/.test(line)
        || /^\d+[.)]\s+/.test(line))
    ) {
      renderMarkdownLinesSequential(doc, lines);
      continue;
    }

    renderPlainLine(doc, lines.join(' '));
  }
}

function renderMarkdownLinesSequential(doc: PDFKit.PDFDocument, lines: string[]): void {
  for (let index = 0; index < lines.length;) {
    const line = lines[index] ?? '';

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^[-*]\s+/, ''));
        index += 1;
      }
      renderBullets(doc, items);
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\d+[.)]\s+/, ''));
        index += 1;
      }
      renderNumbered(doc, items);
      continue;
    }

    renderMarkdownLine(doc, line);
    index += 1;
  }
}

function renderMarkdownLine(doc: PDFKit.PDFDocument, line: string): void {
  const clean = stripMarkdown(line);
  if (!clean) return;

  if (/^#{1,5}\s+/.test(line)) {
    renderMarkdownHeading(doc, clean);
    return;
  }

  if (isDisplayFormula(line)) {
    renderFormulaLine(doc, clean);
    return;
  }

  if (/^>/.test(line)) {
    renderQuoteLine(doc, clean.replace(/^>\s*/, ''));
    return;
  }

  if (/^[-*]\s+/.test(line)) {
    renderBullets(doc, [line.replace(/^[-*]\s+/, '')]);
    return;
  }

  const numbered = line.match(/^\d+[.)]\s+(.+)$/);
  if (numbered) {
    renderNumbered(doc, [numbered[1] ?? '']);
    return;
  }

  const label = clean.match(/^([A-Z][A-Za-z0-9 /()%+-]{2,72}:)\s*(.+)?$/);
  if (label) {
    renderLabeledLine(doc, label[1] ?? '', label[2] ?? '');
    return;
  }

  renderPlainLine(doc, clean);
}

function renderMarkdownHeading(doc: PDFKit.PDFDocument, title: string): void {
  checkPageSpace(doc, 40);
  doc.font(FONT_TITLE).fontSize(12).fillColor(DARK).text(title, { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
}

function renderLabeledLine(doc: PDFKit.PDFDocument, label: string, rest: string): void {
  checkPageSpace(doc, estimateTextHeight(`${label} ${rest}`, 10) + 8);
  doc.font(FONT_TITLE).fontSize(10).fillColor(DARK).text(label, {
    width: CONTENT_WIDTH,
    continued: Boolean(rest),
  });
  if (rest) {
    doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(` ${stripMarkdown(rest)}`, {
      width: CONTENT_WIDTH,
      lineGap: 2,
    });
  }
  doc.moveDown(0.5);
}

function renderBullets(doc: PDFKit.PDFDocument, items: string[]): void {
  for (const item of items) {
    const clean = stripMarkdown(item);
    if (!clean) continue;
    checkPageSpace(doc, 22);
    doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(`- ${clean}`, {
      width: CONTENT_WIDTH,
      lineGap: 1.5,
    });
  }
  doc.moveDown(0.2);
}

function renderNumbered(doc: PDFKit.PDFDocument, items: string[]): void {
  for (const [index, item] of items.entries()) {
    const clean = stripMarkdown(item);
    if (!clean) continue;
    checkPageSpace(doc, 22);
    doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(`${index + 1}. ${clean}`, {
      width: CONTENT_WIDTH,
      lineGap: 1.5,
    });
  }
  doc.moveDown(0.2);
}

function renderPlainLine(doc: PDFKit.PDFDocument, line: string): void {
  const clean = stripMarkdown(line);
  if (!clean) return;
  checkPageSpace(doc, estimateTextHeight(clean, 10) + 8);
  doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(clean, {
    width: CONTENT_WIDTH,
    lineGap: 2,
  });
  doc.moveDown(0.55);
}

function renderFormulaLine(doc: PDFKit.PDFDocument, formula: string): void {
  const clean = stripMarkdown(formula);
  if (!clean) return;
  const height = Math.max(28, estimateTextHeight(clean, 9) + 16);
  checkPageSpace(doc, height + 8);
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, height, 4).fillAndStroke('#f8fafc', BORDER);
  doc.font('Courier').fontSize(9).fillColor(DARK).text(clean, MARGIN + 10, y + 9, {
    width: CONTENT_WIDTH - 20,
  });
  doc.y = y + height + 6;
}

function renderQuoteLine(doc: PDFKit.PDFDocument, text: string): void {
  const clean = stripMarkdown(text);
  if (!clean) return;
  checkPageSpace(doc, estimateTextHeight(clean, 9) + 12);
  doc.font(FONT_ITALIC).fontSize(9).fillColor(MUTED).text(clean, {
    width: CONTENT_WIDTH - 20,
    indent: 12,
    lineGap: 2,
  });
  doc.moveDown(0.5);
}

function parseMarkdownTable(
  lines: string[],
  startIndex: number,
): { table: MarkdownTable; nextIndex: number } | null {
  const headerLine = lines[startIndex]?.trim() ?? '';
  const separatorLine = lines[startIndex + 1]?.trim() ?? '';
  if (!isPipeRow(headerLine) || !isTableSeparator(separatorLine)) return null;

  const headers = splitTableRow(headerLine);
  const rows: string[][] = [];
  let index = startIndex + 2;
  while (index < lines.length && isPipeRow(lines[index]?.trim() ?? '')) {
    rows.push(splitTableRow(lines[index] ?? ''));
    index += 1;
  }

  if (headers.length < 2 || rows.length === 0) return null;
  return { table: { headers, rows }, nextIndex: index };
}

function isPipeRow(line: string): boolean {
  return line.includes('|') && line.replace(/\|/g, '').trim().length > 0;
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cleanTableCell(cell));
}

function cleanTableCell(value: string): string {
  return cleanPrintableText(value, { preserveLineBreaks: true })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderMarkdownTable(doc: PDFKit.PDFDocument, table: MarkdownTable): void {
  const colCount = table.headers.length;
  const widths = resolveTableWidths(colCount);
  const fontSize = colCount > 4 ? 6.8 : 7.4;

  const renderHeader = (): void => {
    const headerHeight = tableRowHeight(doc, table.headers, widths, fontSize, true);
    ensureTableSpace(doc, headerHeight);
    renderTableRow(doc, table.headers, widths, headerHeight, {
      fill: '#eef2ff',
      font: FONT_TITLE,
      fontSize,
    });
  };

  renderHeader();
  for (const row of table.rows) {
    const cells = widths.map((_, index) => row[index] ?? '');
    const rowHeight = tableRowHeight(doc, cells, widths, fontSize, false);
    if (doc.y + rowHeight > doc.page.height - MARGIN - 30) {
      doc.addPage();
      renderHeader();
    }
    renderTableRow(doc, cells, widths, rowHeight, {
      fill: '#ffffff',
      font: FONT_NORMAL,
      fontSize,
    });
  }
  doc.moveDown(0.7);
}

function resolveTableWidths(colCount: number): number[] {
  if (colCount === 3) return [130, 180, CONTENT_WIDTH - 310];
  if (colCount === 4) return [115, 130, 125, CONTENT_WIDTH - 370];
  return Array.from({ length: colCount }, () => CONTENT_WIDTH / colCount);
}

function tableRowHeight(
  doc: PDFKit.PDFDocument,
  cells: string[],
  widths: number[],
  fontSize: number,
  header: boolean,
): number {
  doc.font(header ? FONT_TITLE : FONT_NORMAL).fontSize(fontSize);
  const heights = cells.map((cell, index) => doc.heightOfString(cell, {
    width: (widths[index] ?? 100) - 10,
  }) + 12);
  return Math.max(header ? 26 : 30, ...heights);
}

function renderTableRow(
  doc: PDFKit.PDFDocument,
  cells: string[],
  widths: number[],
  height: number,
  opts: { fill: string; font: string; fontSize: number },
): void {
  const startY = doc.y;
  let x = MARGIN;
  for (const [index, width] of widths.entries()) {
    doc.rect(x, startY, width, height).fillAndStroke(opts.fill, BORDER);
    doc.font(opts.font).fontSize(opts.fontSize).fillColor(DARK).text(cells[index] ?? '', x + 5, startY + 7, {
      width: width - 10,
      lineGap: 1,
    });
    x += width;
  }
  doc.x = MARGIN;
  doc.y = startY + height;
}

function ensureTableSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > doc.page.height - MARGIN - 30) doc.addPage();
}

function renderOptionsList(
  doc: PDFKit.PDFDocument,
  options: NormalisedQuestionOption[],
  showCorrect: boolean,
): void {
  for (const option of options) {
    const correct = showCorrect && option.isCorrect ? ' [correct]' : '';
    const text = stripMarkdown(option.text);
    doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(
      `   ${option.label}. ${text}${correct}`,
      { width: CONTENT_WIDTH - 20 },
    );
  }
  if (options.length > 0) doc.moveDown(0.4);
}

function renderMetaTable(
  doc: PDFKit.PDFDocument,
  rows: Array<[string, string]>,
): void {
  const colWidth = CONTENT_WIDTH / 2;
  const startY = doc.y;
  rows.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * colWidth;
    const y = startY + row * 42;
    doc.rect(x, y, colWidth - 10, 32).strokeColor(BORDER).stroke();
    doc.font(FONT_TITLE).fontSize(7).fillColor(MUTED).text(label.toUpperCase(), x + 8, y + 6);
    doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(value, x + 8, y + 17, {
      width: colWidth - 26,
    });
  });
  doc.x = MARGIN;
  doc.y = startY + Math.ceil(rows.length / 2) * 42;
}

function renderSimpleTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
): void {
  const widths = [105, 95, CONTENT_WIDTH - 200];
  const rowHeight = 24;
  checkPageSpace(doc, rowHeight * (rows.length + 1) + 20);
  let y = doc.y;
  headers.forEach((header, index) => {
    const x = MARGIN + widths.slice(0, index).reduce((sum, width) => sum + width, 0);
    doc.rect(x, y, widths[index] ?? 100, rowHeight).fillAndStroke('#f3f4f6', BORDER);
    doc.font(FONT_TITLE).fontSize(8).fillColor(DARK).text(header, x + 5, y + 8, {
      width: (widths[index] ?? 100) - 10,
    });
  });
  y += rowHeight;
  for (const row of rows) {
    if (y + rowHeight > doc.page.height - MARGIN - 30) {
      doc.addPage();
      y = doc.y;
    }
    row.forEach((cell, index) => {
      const x = MARGIN + widths.slice(0, index).reduce((sum, width) => sum + width, 0);
      doc.rect(x, y, widths[index] ?? 100, rowHeight).strokeColor(BORDER).stroke();
      doc.font(FONT_NORMAL).fontSize(8).fillColor(DARK).text(cell, x + 5, y + 7, {
        width: (widths[index] ?? 100) - 10,
        ellipsis: true,
      });
    });
    y += rowHeight;
  }
  doc.x = MARGIN;
  doc.y = y + 10;
}

function renderTwoColumns(
  doc: PDFKit.PDFDocument,
  left: unknown[],
  right: unknown[],
): void {
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index++) {
    checkPageSpace(doc, 20);
    const leftText = left[index] !== undefined ? String(left[index]) : '';
    const rightText = right[index] !== undefined ? String(right[index]) : '';
    doc.font(FONT_NORMAL).fontSize(9).fillColor(DARK).text(
      `${index + 1}. ${leftText}        ${optionLabel(index)}. ${rightText}`,
      { width: CONTENT_WIDTH },
    );
  }
  doc.moveDown(0.4);
}

function renderMetaLine(doc: PDFKit.PDFDocument, items: string[]): void {
  const text = cleanPrintableText(items.filter(Boolean).join('  |  '), { preserveLineBreaks: false });
  if (!text) return;
  doc.font(FONT_ITALIC).fontSize(9).fillColor(MUTED).text(text, { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
}

function renderMuted(doc: PDFKit.PDFDocument, text: string): void {
  doc.font(FONT_ITALIC).fontSize(9).fillColor(MUTED).text(
    cleanPrintableText(text, { preserveLineBreaks: false }),
    { width: CONTENT_WIDTH },
  );
  doc.moveDown(0.4);
}

function renderMermaidDiagram(doc: PDFKit.PDFDocument, block: IContentBlock): boolean {
  const graph = parseMermaidGraph(block.content);
  if (!graph) return false;

  const roots = graph.rootIds
    .map((id) => graph.nodes.get(id))
    .filter((node): node is MermaidNode => Boolean(node))
    .sort((a, b) => b.children.length - a.children.length);
  const root = roots[0] ?? Array.from(graph.nodes.values())[0];
  if (!root || root.children.length === 0) return false;

  renderSubheading(doc, 'Diagram');
  const caption = getString(block.metadata?.caption)
    || getString(block.metadata?.title)
    || root.label;

  const cards = root.children
    .map((childId) => graph.nodes.get(childId))
    .filter((node): node is MermaidNode => Boolean(node))
    .map((node) => ({
      title: node.label,
      items: node.children
        .map((childId) => graph.nodes.get(childId)?.label)
        .filter((label): label is string => Boolean(label)),
    }));
  if (cards.length === 0) return false;

  const columns = cards.length <= 1 ? 1 : 2;
  const gap = 12;
  const cardWidth = (CONTENT_WIDTH - 32 - gap * (columns - 1)) / columns;
  const cardHeights = cards.map((card) => mermaidCardHeight(card.items));
  const rowHeights: number[] = [];
  for (let i = 0; i < cards.length; i += columns) {
    rowHeights.push(Math.max(...cardHeights.slice(i, i + columns)));
  }
  const bodyHeight = 28 + 44 + 22 + rowHeights.reduce((sum, height) => sum + height, 0)
    + Math.max(0, rowHeights.length - 1) * gap + 20;

  checkPageSpace(doc, bodyHeight + 16);
  const panelY = doc.y;
  doc.roundedRect(MARGIN, panelY, CONTENT_WIDTH, bodyHeight, 5).fillAndStroke('#f8fafc', BORDER);
  doc.font(FONT_ITALIC).fontSize(9).fillColor(MUTED).text(caption, MARGIN + 16, panelY + 12, {
    width: CONTENT_WIDTH - 32,
    lineGap: 1,
  });

  const rootY = panelY + 36;
  drawMermaidBox(doc, MARGIN + CONTENT_WIDTH / 2 - 125, rootY, 250, 38, root.label, {
    fill: '#dbeafe',
    stroke: '#60a5fa',
    font: FONT_TITLE,
    fontSize: 9.5,
    color: DARK,
  });

  let rowY = rootY + 60;
  for (let row = 0; row < rowHeights.length; row++) {
    const rowCards = cards.slice(row * columns, row * columns + columns);
    const rowHeight = rowHeights[row] ?? 80;
    for (const [column, card] of rowCards.entries()) {
      const x = MARGIN + 16 + column * (cardWidth + gap);
      const y = rowY;
      doc
        .moveTo(MARGIN + CONTENT_WIDTH / 2, rootY + 38)
        .lineTo(x + cardWidth / 2, y)
        .strokeColor('#94a3b8')
        .lineWidth(0.8)
        .stroke();
      drawMermaidCard(doc, x, y, cardWidth, rowHeight, card.title, card.items);
    }
    rowY += rowHeight + gap;
  }

  doc.x = MARGIN;
  doc.y = panelY + bodyHeight + 12;
  return true;
}

function parseMermaidGraph(content: unknown): MermaidGraph | null {
  const source = getString(content);
  if (!/^\s*(graph|flowchart)\s+(TD|TB|BT|LR|RL)\b/i.test(source)) return null;

  const lines = source.split('\n').map((line) => line.trim()).filter(Boolean);
  const header = lines.shift() ?? '';
  const directionMatch = header.match(/\b(TD|TB|BT|LR|RL)\b/i);
  const direction = directionMatch?.[1]?.toUpperCase() === 'LR' ? 'LR' : 'TD';
  const nodes = new Map<string, MermaidNode>();

  const ensureNode = (id: string, label?: string): MermaidNode => {
    const existing = nodes.get(id);
    if (existing) {
      if (label && existing.label === id) existing.label = label;
      return existing;
    }
    const node: MermaidNode = { id, label: label || id, children: [], parents: [] };
    nodes.set(id, node);
    return node;
  };

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/%%.*$/, '')
      .replace(/;$/, '')
      .trim();
    if (!line || /^(style|classDef|class|linkStyle|subgraph|end)\b/i.test(line)) continue;

    const normalised = line
      .replace(/--\|[^|]*\|/g, '-->')
      .replace(/\s+--\s+[^-]+-->/g, ' --> ');
    const parts = normalised.split(/\s*(?:-->|---|==>|-.->)\s*/).filter(Boolean);
    if (parts.length < 2) {
      const node = parseMermaidEndpoint(parts[0] ?? line);
      if (node) ensureNode(node.id, node.label);
      continue;
    }

    const endpoints = parts
      .map((part) => parseMermaidEndpoint(part))
      .filter((part): part is { id: string; label: string } => Boolean(part));
    for (const endpoint of endpoints) ensureNode(endpoint.id, endpoint.label);
    for (let index = 0; index < endpoints.length - 1; index++) {
      const from = ensureNode(endpoints[index]!.id, endpoints[index]!.label);
      const to = ensureNode(endpoints[index + 1]!.id, endpoints[index + 1]!.label);
      if (!from.children.includes(to.id)) from.children.push(to.id);
      if (!to.parents.includes(from.id)) to.parents.push(from.id);
    }
  }

  if (nodes.size === 0) return null;
  return {
    direction,
    nodes,
    rootIds: Array.from(nodes.values())
      .filter((node) => node.parents.length === 0)
      .map((node) => node.id),
  };
}

function parseMermaidEndpoint(value: string): { id: string; label: string } | null {
  const endpoint = value.trim().replace(/:::[\w-]+$/, '').replace(/[;,]+$/, '');
  if (!endpoint) return null;
  const match = endpoint.match(/^([A-Za-z0-9_-]+)\s*(?:\["?([^"\]]+)"?\]|\[([^\]]+)\]|\(("?)(.*?)\4\)|\{([^}]+)\})?/);
  if (!match) return null;
  const label = match[2] || match[3] || match[5] || match[6] || match[1] || '';
  return {
    id: match[1] ?? '',
    label: stripMarkdown(label),
  };
}

function mermaidCardHeight(items: string[]): number {
  const visibleItems = Math.min(items.length, 6);
  return Math.max(78, 42 + visibleItems * 15 + (items.length > visibleItems ? 14 : 0));
}

function drawMermaidBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  opts: { fill: string; stroke: string; font: string; fontSize: number; color: string },
): void {
  doc.roundedRect(x, y, width, height, 5).fillAndStroke(opts.fill, opts.stroke);
  doc.font(opts.font).fontSize(opts.fontSize).fillColor(opts.color).text(text, x + 8, y + 10, {
    width: width - 16,
    align: 'center',
    lineGap: 1,
  });
}

function drawMermaidCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  items: string[],
): void {
  doc.roundedRect(x, y, width, height, 5).fillAndStroke('#ffffff', '#cbd5e1');
  doc.font(FONT_TITLE).fontSize(8.5).fillColor(BLUE).text(title, x + 9, y + 9, {
    width: width - 18,
    lineGap: 1,
  });

  const visible = items.slice(0, 6);
  let itemY = y + 30;
  for (const item of visible) {
    doc.font(FONT_NORMAL).fontSize(7.5).fillColor(DARK).text(`- ${item}`, x + 10, itemY, {
      width: width - 20,
      lineGap: 1,
    });
    itemY += 14;
  }
  if (items.length > visible.length) {
    doc.font(FONT_ITALIC).fontSize(7.2).fillColor(MUTED).text(
      `+ ${items.length - visible.length} more`,
      x + 10,
      itemY,
      { width: width - 20 },
    );
  }
}

function renderMediaPlaceholder(doc: PDFKit.PDFDocument, block: IContentBlock): void {
  const caption = getString(block.metadata?.caption)
    || getString(block.metadata?.title)
    || inferVisualDescription(block.content);
  renderSubheading(doc, block.type === 'image' ? 'Diagram' : 'Video resource');
  checkPageSpace(doc, 46);
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 38, 4).fillAndStroke('#f9fafb', BORDER);
  doc.font(FONT_ITALIC).fontSize(9).fillColor(MUTED).text(caption, MARGIN + 10, y + 12, {
    width: CONTENT_WIDTH - 20,
  });
  doc.y = y + 46;
}

function drawWriteLine(doc: PDFKit.PDFDocument, label: string): void {
  const y = doc.y + 12;
  doc.font(FONT_NORMAL).fontSize(10).fillColor(DARK).text(`${label}:`, MARGIN, y - 10, {
    width: 70,
  });
  doc.moveTo(MARGIN + 75, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor(BORDER).stroke();
  doc.y = y + 12;
}

function findMaterialPhase(lesson: ILesson, materialId: Types.ObjectId): LessonPhase | null {
  for (const entry of lesson.phases) {
    if (entry.materialIds.some((id) => id.toString() === materialId.toString())) {
      return entry.phase;
    }
  }
  return null;
}

function resolveSubjectName(lesson: ILesson): string {
  const direct = readName(lesson.subjectId, '');
  if (direct) return direct;
  const node = isRecord(lesson.curriculumNodeId) ? lesson.curriculumNodeId : null;
  return readName(node?.subjectId, 'Subject');
}

function resolveGradeName(lesson: ILesson): string {
  const direct = readName(lesson.gradeId, '');
  if (direct) return direct;
  const node = isRecord(lesson.curriculumNodeId) ? lesson.curriculumNodeId : null;
  return readName(node?.gradeId, 'Grade');
}

function isPlaceholder(material: ILessonMaterial): boolean {
  if (material.generatedAt) return false;
  const record = material as unknown as Record<string, unknown>;
  return !record.contentResourceId
    && !record.homeworkId
    && !record.paperId
    && !record.quizId
    && getArray(record, 'questionIds').length === 0
    && getArray(record, 'comprehensionQuestionIds').length === 0;
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== 'string') return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getRecord(source: unknown, key: string): Record<string, unknown> | null {
  if (!isRecord(source)) return null;
  const value = source[key];
  return isRecord(value) ? value : null;
}

function getArray(source: unknown, key: string): unknown[] {
  if (!isRecord(source)) return [];
  const value = source[key];
  return Array.isArray(value) ? value : [];
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (isRecord(value)) {
    const id = value._id ?? value.id;
    return typeof id === 'string' ? id : id ? String(id) : null;
  }
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readName(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === 'string') return fallback;
  if (!isRecord(value)) return fallback;
  return getString(value.name) || getString(value.title) || fallback;
}

function formatDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function formatPageRange(start: unknown, end: unknown): string {
  if (typeof start !== 'number' && typeof end !== 'number') return '';
  if (typeof start === 'number' && typeof end === 'number') return `pages ${start}-${end}`;
  if (typeof start === 'number') return `page ${start}`;
  return `page ${String(end)}`;
}

function optionLabel(index: number): string {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[index] ?? String(index + 1);
}

function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stripMarkdown(value: string): string {
  return cleanPrintableText(value, { preserveLineBreaks: false })
    .replace(/^#{1,6}\s+/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim();
}

function cleanPrintableText(
  value: unknown,
  opts: { preserveLineBreaks: boolean },
): string {
  const blankToken = 'CAMPUSLY_PRINT_BLANK';
  let text = typeof value === 'string' ? value : String(value ?? '');
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = text.replace(/_{3,}/g, blankToken);
  text = replaceLatexMath(text);
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ');
  text = decodeHtmlEntities(text);
  text = normaliseSpecialCharacters(text);
  text = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1');
  text = text.replace(new RegExp(blankToken, 'g'), '__________');
  text = text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ');
  if (!opts.preserveLineBreaks) text = text.replace(/\s+/g, ' ');
  return text.trim();
}

function replaceLatexMath(text: string): string {
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, formula: string) => normaliseLatexFormula(formula))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula: string) => normaliseLatexFormula(formula))
    .replace(/\$([^$\n]+)\$/g, (_, formula: string) => normaliseLatexFormula(formula));
}

function normaliseLatexFormula(formula: string): string {
  let output = formula
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1');

  let previous = '';
  while (previous !== output) {
    previous = output;
    output = output.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1 / $2)');
  }

  return output
    .replace(/\\times/g, 'x')
    .replace(/\\cdot/g, 'x')
    .replace(/\\div/g, '/')
    .replace(/\\%/g, '%')
    .replace(/\\left|\\right/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(text: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '-',
    mdash: '-',
    hellip: '...',
    times: 'x',
    divide: '/',
  };

  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#x')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity] ?? match;
  });
}

function normaliseSpecialCharacters(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ')
    .replace(/\u00d7/g, 'x')
    .replace(/\u00f7/g, '/')
    .replace(/\u2192/g, ' -> ')
    .replace(/\u2260/g, ' is not equal to ')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    .replace(/\u2212/g, '-')
    .replace(/\u2022/g, '-');
}

function isDisplayFormula(line: string): boolean {
  return /\$\$|\\frac|\\text\{|\\times|\\\(|\\\)/.test(line);
}

function isLabelLine(line: string): boolean {
  return /^\s*(\*\*)?[A-Z][A-Za-z0-9 /()%+-]{2,72}:(\*\*)?/.test(line);
}

function inferVisualDescription(content: unknown): string {
  const text = getString(content);
  if (/^\s*(graph|flowchart|sequenceDiagram|classDiagram|erDiagram)\b/i.test(text)) {
    return 'Diagram for this section. Open the digital lesson workspace to view the interactive version.';
  }
  return 'Visual resource for this section. Open the digital lesson workspace to view the original media.';
}

function estimateTextHeight(text: string, fontSize: number): number {
  return Math.max(16, Math.ceil(text.length / 85) * (fontSize + 4));
}

export async function exportTeacherPack(
  lessonId: string,
  scope: LessonScope,
): Promise<Buffer> {
  if (process.env.LESSON_PDF_ENGINE !== 'legacy') {
    try {
      return await renderPremiumLessonPdf(lessonId, scope, 'teacher');
    } catch (err: unknown) {
      logger.warn({ err, lessonId }, 'Premium teacher lesson PDF render failed; using legacy renderer');
    }
  }
  return renderLessonPdf(lessonId, scope, 'teacher');
}

export async function exportStudentPack(
  lessonId: string,
  scope: LessonScope,
): Promise<Buffer> {
  if (process.env.LESSON_PDF_ENGINE !== 'legacy') {
    try {
      return await renderPremiumLessonPdf(lessonId, scope, 'student');
    } catch (err: unknown) {
      logger.warn({ err, lessonId }, 'Premium student lesson PDF render failed; using legacy renderer');
    }
  }
  return renderLessonPdf(lessonId, scope, 'student');
}
