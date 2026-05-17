import fs from 'fs/promises';
import path from 'path';
import type { Types } from 'mongoose';
import { LessonService } from './service.js';
import type { ILesson, ILessonMaterial, LessonMaterialKind, LessonPhase } from './types.js';
import { LESSON_PHASES } from './types.js';
import { School } from '../School/model.js';
import { HomeworkService } from '../Homework/service.js';
import { collectPaperQuestions } from '../QuestionBank/service-papers-helpers.js';
import type { IQuestion, IPaperQuestion, IPaperSection } from '../QuestionBank/model.js';
import type { IContentBlock } from '../ContentLibrary/model.js';
import { renderHtmlToPdf } from '../../common/document/html-pdf-renderer.js';
import { classes, escapeAttr, escapeHtml, joinHtml } from '../../common/document/html.js';
import type {
  NormalisedDiagram,
  NormalisedQuestion,
  NormalisedQuestionOption,
  NormalisedQuestionType,
  NormalisedSection,
} from '../../common/pdf/types.js';
import { schoolIdFromScope, type LessonScope } from './service-access.js';

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

interface RenderedMaterial {
  id: string;
  kind: LessonMaterialKind;
  kindLabel: string;
  title: string;
  teacherNotes: string;
  placeholder: boolean;
  html: string;
}

interface RenderedPhase {
  phase: LessonPhase;
  label: string;
  materials: RenderedMaterial[];
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

export async function renderPremiumLessonPdf(
  lessonId: string,
  scope: LessonScope,
  mode: PackMode,
): Promise<Buffer> {
  const ctx = await loadPackContext(lessonId, scope, mode);
  const html = await renderPremiumLessonHtml(ctx);
  return renderHtmlToPdf(html, {
    title: `${ctx.lesson.title} - ${mode === 'teacher' ? 'Teacher' : 'Student'} Pack`,
    footerLabel: `${ctx.schoolName} | ${mode === 'teacher' ? 'Teacher Pack' : 'Student Pack'}`,
  });
}

export async function renderPremiumLessonHtml(ctx: PackContext): Promise<string> {
  const phases = await renderPhases(ctx);
  return renderDocumentShell(ctx, [
    renderCover(ctx),
    renderOverview(ctx, phases),
    phases.map((phase) => renderPhase(ctx, phase)).join(''),
  ].join(''));
}

async function loadPackContext(
  lessonId: string,
  scope: LessonScope,
  mode: PackMode,
): Promise<PackContext> {
  const schoolId = schoolIdFromScope(scope);
  const [lesson, school] = await Promise.all([
    LessonService.getById(lessonId, scope),
    School.findOne({ _id: schoolId, isDeleted: false }).select('name').lean(),
  ]);

  if (lesson.materials.length > MAX_MATERIALS) {
    throw new Error('Lesson too large to export - split it into two lessons first');
  }

  return {
    mode,
    schoolId,
    schoolName: readName(school, 'Campusly'),
    lesson,
  };
}

async function renderPhases(ctx: PackContext): Promise<RenderedPhase[]> {
  const phases: RenderedPhase[] = [];
  for (const phase of LESSON_PHASES) {
    const materials = await renderPhaseMaterials(ctx, phase);
    if (materials.length === 0) continue;
    phases.push({ phase, label: PHASE_LABELS[phase], materials });
  }
  return phases;
}

async function renderPhaseMaterials(
  ctx: PackContext,
  phase: LessonPhase,
): Promise<RenderedMaterial[]> {
  const entry = ctx.lesson.phases.find((item) => item.phase === phase);
  if (!entry) return [];

  const phaseMaterials = entry.materialIds
    .map((id) => ctx.lesson.materials.find((m) => m._id.toString() === id.toString()))
    .filter((material): material is ILessonMaterial => Boolean(material))
    .filter((material) => ctx.mode === 'teacher' || !isPlaceholder(material));

  const rendered: RenderedMaterial[] = [];
  for (const material of phaseMaterials) {
    rendered.push({
      id: material._id.toString(),
      kind: material.kind,
      kindLabel: KIND_LABELS[material.kind],
      title: material.title,
      teacherNotes: material.teacherNotes ?? '',
      placeholder: isPlaceholder(material),
      html: await renderMaterialBody(ctx, material),
    });
  }
  return rendered;
}

function renderDocumentShell(ctx: PackContext, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(ctx.lesson.title)}</title>
  <style>${documentCss()}</style>
</head>
<body>
  <main class="pack ${ctx.mode}">
    ${body}
  </main>
</body>
</html>`;
}

function renderCover(ctx: PackContext): string {
  const { lesson, mode } = ctx;
  const packTitle = mode === 'teacher' ? 'Teacher Pack' : 'Student Pack';
  const topic = readName(lesson.curriculumNodeId, lesson.title);
  const subject = resolveSubjectName(lesson);
  const grade = resolveGradeName(lesson);

  return `
    <section class="cover-page">
      <div class="cover-rule"></div>
      <div class="cover-topline">
        <div>
          <p class="eyebrow">${escapeHtml(ctx.schoolName)}</p>
          <p class="document-type">${escapeHtml(packTitle)}</p>
        </div>
        <div class="document-mark">Campusly</div>
      </div>

      <div class="cover-title-block">
        <p class="subject-kicker">${escapeHtml([subject, grade].filter(Boolean).join(' / '))}</p>
        <h1>${escapeHtml(lesson.title)}</h1>
        <p class="cover-topic">${escapeHtml(topic)}</p>
      </div>

      <div class="cover-meta-grid">
        ${renderCoverMeta('Subject', subject)}
        ${renderCoverMeta('Grade', grade)}
        ${renderCoverMeta('Term', lesson.termNumber ? `Term ${lesson.termNumber}` : 'Term not set')}
        ${renderCoverMeta('Duration', `${lesson.durationMinutes} minutes`)}
        ${renderCoverMeta('Generated', formatDate(new Date()))}
      </div>

      ${mode === 'student' ? renderLearnerDetails() : renderTeacherCoverDetails(ctx)}
    </section>
  `;
}

function renderCoverMeta(label: string, value: string): string {
  return `
    <div class="cover-meta-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderLearnerDetails(): string {
  return `
    <div class="learner-panel">
      <h2>Learner details</h2>
      ${renderWriteLine('Name')}
      ${renderWriteLine('Class')}
      ${renderWriteLine('Date')}
    </div>
  `;
}

function renderTeacherCoverDetails(ctx: PackContext): string {
  if (ctx.lesson.assignedClasses.length === 0) {
    return `
      <div class="teacher-panel">
        <h2>Teaching pack</h2>
        <p>This pack includes lesson materials, printable learner pages, teacher notes, answers, and marking guidance where available.</p>
      </div>
    `;
  }

  const items = ctx.lesson.assignedClasses.map((assignment) => {
    const className = readName(assignment.classId, 'Class');
    const status = assignment.status === 'taught' ? 'Taught' : 'Planned';
    return `<li><strong>${escapeHtml(className)}</strong><span>${escapeHtml(formatDate(assignment.scheduledDate))} / ${escapeHtml(status)}</span></li>`;
  }).join('');

  return `
    <div class="teacher-panel">
      <h2>Scheduled classes</h2>
      <ul class="schedule-list">${items}</ul>
    </div>
  `;
}

function renderWriteLine(label: string): string {
  return `
    <div class="write-line">
      <span>${escapeHtml(label)}</span>
      <b></b>
    </div>
  `;
}

function renderOverview(ctx: PackContext, phases: RenderedPhase[]): string {
  const objectiveItems = ctx.lesson.objectives
    .map((objective) => `<li>${formatInline(objective)}</li>`)
    .join('');

  const contents = phases.flatMap((phase) => phase.materials.map((material) => ({
    phase: phase.label,
    kind: material.kindLabel,
    title: material.title,
  })));

  return `
    <section class="document-page overview-page">
      <div class="page-heading">
        <p>${ctx.mode === 'teacher' ? 'Teaching overview' : 'Learning overview'}</p>
        <h2>${escapeHtml(ctx.lesson.title)}</h2>
      </div>

      <div class="overview-grid">
        <aside class="at-a-glance">
          <h3>At a glance</h3>
          ${renderKeyValue('Subject', resolveSubjectName(ctx.lesson))}
          ${renderKeyValue('Grade', resolveGradeName(ctx.lesson))}
          ${renderKeyValue('Term', ctx.lesson.termNumber ? `Term ${ctx.lesson.termNumber}` : 'Term not set')}
          ${renderKeyValue('Duration', `${ctx.lesson.durationMinutes} min`)}
          ${renderKeyValue('Materials', String(contents.length))}
        </aside>

        <div class="overview-main">
          <section class="premium-card objectives-card">
            <div class="section-label">Learning goals</div>
            ${objectiveItems ? `<ul class="objective-list">${objectiveItems}</ul>` : '<p class="muted">No objectives have been added yet.</p>'}
          </section>

          <section class="premium-card contents-card">
            <div class="section-label">Pack contents</div>
            ${renderContentsTable(contents)}
          </section>
        </div>
      </div>
    </section>
  `;
}

function renderKeyValue(label: string, value: string): string {
  return `
    <div class="key-value">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderContentsTable(rows: Array<{ phase: string; kind: string; title: string }>): string {
  if (rows.length === 0) return '<p class="muted">No printable materials are available yet.</p>';
  return `
    <table class="contents-table">
      <thead>
        <tr><th>Phase</th><th>Type</th><th>Material</th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.phase)}</td>
            <td>${escapeHtml(row.kind)}</td>
            <td>${escapeHtml(row.title)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderPhase(ctx: PackContext, phase: RenderedPhase): string {
  return `
    <section class="document-page phase-page phase-${escapeAttr(phase.phase)}">
      <header class="phase-header">
        <p>Lesson phase</p>
        <h2>${escapeHtml(phase.label)}</h2>
      </header>
      <div class="phase-materials">
        ${phase.materials.map((material) => renderMaterial(ctx, phase, material)).join('')}
      </div>
    </section>
  `;
}

function renderMaterial(
  ctx: PackContext,
  phase: RenderedPhase,
  material: RenderedMaterial,
): string {
  return `
    <article class="${classes('material-card', material.placeholder && 'is-placeholder')}">
      <header class="material-header">
        <div>
          <p>${escapeHtml(phase.label)} / ${escapeHtml(material.kindLabel)}</p>
          <h3>${escapeHtml(material.title)}</h3>
        </div>
        <span>${escapeHtml(material.kindLabel)}</span>
      </header>
      ${ctx.mode === 'teacher' && material.teacherNotes
        ? renderTeacherNote(material.teacherNotes)
        : ''}
      <div class="material-body">
        ${material.html}
      </div>
    </article>
  `;
}

function renderTeacherNote(note: string): string {
  return `
    <aside class="teacher-note">
      <strong>Teacher note</strong>
      <p>${formatInline(note)}</p>
    </aside>
  `;
}

async function renderMaterialBody(
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<string> {
  if (isPlaceholder(material)) {
    return '<p class="muted">This material is still a placeholder and has not been generated yet.</p>';
  }

  switch (material.kind) {
    case 'reading':
      return renderReading(ctx, material);
    case 'worksheet':
    case 'activity':
    case 'study_notes':
    case 'worked_example':
      return renderContentBackedMaterial(ctx, material);
    case 'practice_questions':
      return renderQuestionMaterial(ctx, 'Practice Questions', getArray(material, 'questionIds'));
    case 'homework':
      return renderHomeworkMaterial(ctx, material);
    case 'paper':
      return renderPaperMaterial(ctx, material);
    case 'quiz':
      return renderQuizMaterial(ctx, material);
  }
}

async function renderReading(ctx: PackContext, material: ILessonMaterial): Promise<string> {
  const ref = getRecord(material, 'textbookRef');
  const parts: string[] = [];

  if (ref) {
    const source = getString(ref.source);
    if (source === 'internal') {
      const textbook = readName(ref.textbookId, 'Textbook');
      const pages = formatPageRange(ref.pageStart, ref.pageEnd);
      parts.push(renderSourceLine([textbook, pages].filter(Boolean).join(', ')));
    } else {
      const title = getString(ref.title) || 'Textbook reference';
      const publisher = getString(ref.publisher);
      const pages = formatPageRange(ref.pageStart, ref.pageEnd);
      parts.push(renderSourceLine([title, publisher, pages].filter(Boolean).join(' - ')));
      const excerpt = getString(ref.excerpt);
      if (excerpt) parts.push(renderMarkdownishHtml(excerpt));
    }
    const notes = getString(ref.notes);
    if (notes && ctx.mode === 'teacher') parts.push(renderTeacherNote(notes));
  }

  parts.push(await renderQuestionMaterial(ctx, 'Comprehension Questions', getArray(material, 'comprehensionQuestionIds')));
  return parts.join('');
}

function renderSourceLine(value: string): string {
  return value ? `<p class="source-line">${escapeHtml(value)}</p>` : '';
}

function renderContentBackedMaterial(
  ctx: PackContext,
  material: ILessonMaterial,
): string {
  const resource = getRecord(material, 'contentResourceId');
  if (!resource) return '<p class="muted">The linked content resource could not be loaded.</p>';

  const blocks = getArray(resource, 'blocks')
    .filter((block): block is IContentBlock => isRecord(block))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (blocks.length === 0) return '<p class="muted">No printable content blocks are available yet.</p>';
  return blocks.map((block) => renderContentBlock(ctx, block)).join('');
}

function renderContentBlock(ctx: PackContext, block: IContentBlock): string {
  if (block.type === 'text') return renderMarkdownishHtml(block.content);

  if (block.type === 'quiz') {
    const quiz = parseJsonRecord(block.content);
    const question = stripMarkdown(getString(quiz.question) || getString(block.content));
    const options = normaliseContentOptions(
      quiz.options ?? block.metadata?.options,
      quiz.correctIndex,
      quiz.correctAnswer ?? block.metadata?.correctAnswer,
    );
    return `
      <section class="checkpoint-card keep-together">
        <h4>Checkpoint</h4>
        <p>${formatInline(question)}</p>
        ${renderOptionsList(options, false)}
        ${ctx.mode === 'teacher'
          ? renderAnswerReveal(options, getString(quiz.explanation) || block.explanation)
          : ''}
      </section>
    `;
  }

  if (block.type === 'fill_blank') {
    const data = parseJsonRecord(block.content);
    const answerSource = getArray(data, 'blanks').length > 0
      ? getArray(data, 'blanks')
      : getArray(block.metadata, 'blanks');
    const answers = answerSource.map((value) => String(value)).join(', ');
    return `
      <section class="activity-block">
        <h4>Fill in the blanks</h4>
        ${renderMarkdownishHtml(getString(data.text) || block.content)}
        ${ctx.mode === 'teacher' ? renderTeacherAnswerText(answers || block.explanation) : ''}
      </section>
    `;
  }

  if (block.type === 'match_columns') {
    const data = parseJsonRecord(block.content);
    const pairs = getArray(data, 'correctPairs')
      .map((pair) => Array.isArray(pair) ? pair.join(' -> ') : String(pair))
      .join('; ');
    return `
      <section class="activity-block">
        <h4>Match the columns</h4>
        ${renderMarkdownishHtml(block.content.startsWith('{') ? 'Match each item in Column A with Column B.' : block.content)}
        ${renderTwoColumns(getArray(data, 'left'), getArray(data, 'right'))}
        ${ctx.mode === 'teacher' ? renderTeacherAnswerText(pairs) : ''}
      </section>
    `;
  }

  if (block.type === 'ordering') {
    const data = parseJsonRecord(block.content);
    const items = getArray(data, 'items').map((value) => String(value));
    const order = getArray(data, 'correctOrder').map((value) => Number(value));
    const answer = order.map((index) => items[index]).filter(Boolean).join(' -> ');
    return `
      <section class="activity-block">
        <h4>Order the items</h4>
        <ol class="ordered-work">${items.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ol>
        ${ctx.mode === 'teacher' ? renderTeacherAnswerText(answer) : ''}
      </section>
    `;
  }

  if (block.type === 'step_reveal') {
    const data = parseJsonRecord(block.content);
    const steps = getArray(data, 'steps').filter((s): s is Record<string, unknown> => isRecord(s));
    return `
      <section class="step-block">
        <h4>Worked steps</h4>
        ${steps.map((step, index) => `
          <div class="step-card keep-together">
            <span>${index + 1}</span>
            <div>
              <strong>${escapeHtml(readName(step, 'Step'))}</strong>
              ${renderMarkdownishHtml(getString(step.content))}
            </div>
          </div>
        `).join('')}
      </section>
    `;
  }

  if (block.type === 'image' || block.type === 'video') {
    if (block.type === 'image') {
      const mermaid = renderMermaidDiagram(block);
      if (mermaid) return mermaid;
    }
    return renderMediaPlaceholder(block);
  }

  return `
    <section class="activity-block">
      <h4>${escapeHtml(titleCase(block.type))}</h4>
      ${renderMarkdownishHtml(block.content)}
    </section>
  `;
}

function renderAnswerReveal(
  options: NormalisedQuestionOption[],
  explanation: string,
): string {
  const correct = options.find((option) => option.isCorrect);
  const answer = correct ? `${correct.label}. ${correct.text}` : '';
  return renderTeacherAnswerText([answer, explanation].filter(Boolean).join('\n'));
}

function renderTeacherAnswerText(answer: string): string {
  const clean = cleanPrintableText(answer, { preserveLineBreaks: true });
  if (!clean) return '';
  return `
    <aside class="answer-reveal">
      <strong>Teacher answer</strong>
      <p>${formatInline(clean)}</p>
    </aside>
  `;
}

async function renderHomeworkMaterial(
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<string> {
  const homework = await resolveHomework(material, ctx.schoolId);
  if (!homework) return '<p class="muted">The linked homework could not be loaded.</p>';

  const parts = [
    renderMetaPills([
      `Due ${formatDate(homework.dueDate)}`,
      `${String(homework.totalMarks ?? 0)} marks`,
      titleCase(String(homework.type ?? 'homework')),
    ]),
  ];

  if (homework.type === 'reading') {
    const resource = isRecord(homework.contentResourceId) ? homework.contentResourceId : null;
    if (resource) {
      parts.push('<h4 class="content-subtitle">Reading</h4>');
      parts.push(getArray(resource, 'blocks')
        .filter((block): block is IContentBlock => isRecord(block))
        .map((block) => renderContentBlock(ctx, block))
        .join(''));
    }
    parts.push(await renderQuestionMaterial(ctx, 'Comprehension Questions', getArray(homework, 'comprehensionQuestionIds')));
    return parts.join('');
  }

  if (homework.type === 'quiz' && isRecord(homework.quizId)) {
    parts.push(await renderQuiz(ctx, homework.quizId));
    return parts.join('');
  }

  parts.push(await renderQuestionMaterial(ctx, 'Homework Questions', getArray(homework, 'exerciseQuestionIds')));
  return parts.join('');
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

async function renderPaperMaterial(
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<string> {
  const paper = getRecord(material, 'paperId');
  if (!paper) return '<p class="muted">The linked paper could not be loaded.</p>';

  const sections = await normalisePaperSections(paper, ctx.schoolId);
  return [
    renderMetaPills([
      `${String(paper.totalMarks ?? 0)} marks`,
      `${String(paper.duration ?? 0)} minutes`,
      `Term ${String(paper.term ?? ctx.lesson.termNumber ?? '')}`,
    ]),
    getString(paper.instructions)
      ? `<section class="instruction-block"><h4>Instructions</h4>${renderMarkdownishHtml(getString(paper.instructions))}</section>`
      : '',
    sections.length === 0
      ? '<p class="muted">This paper has no printable questions yet.</p>'
      : await renderQuestionSectionsHtml(sections, ctx.mode),
  ].join('');
}

async function renderQuizMaterial(
  ctx: PackContext,
  material: ILessonMaterial,
): Promise<string> {
  const quiz = getRecord(material, 'quizId');
  if (!quiz) return '<p class="muted">The linked quiz could not be loaded.</p>';
  return renderQuiz(ctx, quiz);
}

async function renderQuiz(
  ctx: PackContext,
  quiz: Record<string, unknown>,
): Promise<string> {
  const questions = getArray(quiz, 'questions');
  if (questions.length === 0) return '<p class="muted">This quiz has no questions yet.</p>';
  const section: NormalisedSection = {
    title: readName(quiz, 'Quiz'),
    instructions: '',
    questions: questions
      .filter((q): q is Record<string, unknown> => isRecord(q))
      .map((q, index) => normaliseQuizQuestion(q, index)),
  };
  return renderQuestionSectionsHtml([section], ctx.mode);
}

async function renderQuestionMaterial(
  ctx: PackContext,
  title: string,
  questions: unknown[],
): Promise<string> {
  const normalised = questions
    .filter((q): q is Record<string, unknown> => isRecord(q))
    .map((q, index) => normaliseBankQuestion(q, index));

  if (normalised.length === 0) return '<p class="muted">No printable questions are available yet.</p>';
  return renderQuestionSectionsHtml([{ title, instructions: '', questions: normalised }], ctx.mode);
}

async function renderQuestionSectionsHtml(
  sections: NormalisedSection[],
  mode: PackMode,
): Promise<string> {
  const renderedSections = await Promise.all(sections.map(async (section) => `
    <section class="question-section">
      <h4>${escapeHtml(section.title)}</h4>
      ${section.instructions ? `<p class="question-instructions">${formatInline(section.instructions)}</p>` : ''}
      <div class="questions">
        ${(await Promise.all(section.questions.map((q) => renderQuestionHtml(q)))).join('')}
      </div>
    </section>
  `));

  return [
    renderedSections.join(''),
    mode === 'teacher' ? await renderMemoSectionsHtml(sections) : '',
  ].join('');
}

async function renderQuestionHtml(q: NormalisedQuestion): Promise<string> {
  const written = q.type !== 'mcq' && q.type !== 'true_false';
  return `
    <article class="${classes('question-card', written && 'written-question')}">
      <div class="question-stem-wrap">
        <div class="question-meta">
          <strong>Q${escapeHtml(q.number)}</strong>
          <span>${q.marks} mark${q.marks === 1 ? '' : 's'}</span>
        </div>
        <p class="question-stem">${formatInline(q.stem)}</p>
        ${q.diagram ? await renderQuestionDiagram(q.diagram) : ''}
        ${q.type === 'mcq' || q.type === 'true_false'
          ? `${renderOptionsList(q.options, false)}<p class="mcq-answer">Answer: <span></span></p>`
          : ''}
      </div>
      ${written ? renderAnswerLines(q) : ''}
    </article>
  `;
}

function renderOptionsList(
  options: NormalisedQuestionOption[],
  showCorrect: boolean,
): string {
  if (options.length === 0) return '';
  return `
    <ol class="option-list" type="A">
      ${options.map((option) => `
        <li class="${showCorrect && option.isCorrect ? 'is-correct' : ''}">
          ${formatInline(option.text)}
          ${showCorrect && option.isCorrect ? '<span>correct</span>' : ''}
        </li>
      `).join('')}
    </ol>
  `;
}

function renderAnswerLines(q: NormalisedQuestion): string {
  const lines = computeAnswerLines(q);
  return `
    <div class="answer-lines" aria-label="Answer space">
      ${Array.from({ length: lines }, () => '<span></span>').join('')}
    </div>
  `;
}

function computeAnswerLines(q: NormalisedQuestion): number {
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
  switch (q.type) {
    case 'short':
      return clamp(Math.ceil(q.marks * 2), 2, 6);
    case 'structured':
      return clamp(Math.ceil(q.marks * 1.5), 4, 14);
    case 'long':
      return clamp(Math.ceil(q.marks * 4), 12, 35);
    default:
      return clamp(Math.ceil(q.marks), 3, 10);
  }
}

async function renderMemoSectionsHtml(sections: NormalisedSection[]): Promise<string> {
  const mcqAnswers: Array<{ number: string; answer: string }> = [];
  const answers: string[] = [];

  for (const section of sections) {
    for (const q of section.questions) {
      if (q.type === 'mcq' || q.type === 'true_false') {
        const correct = q.options.find((o) => o.isCorrect);
        mcqAnswers.push({ number: q.number, answer: correct?.label ?? q.answer });
      } else {
        answers.push(`
          <article class="memo-answer keep-together">
            <div class="question-meta">
              <strong>Q${escapeHtml(q.number)}</strong>
              <span>${q.marks} mark${q.marks === 1 ? '' : 's'}</span>
            </div>
            ${q.diagram ? await renderQuestionDiagram(q.diagram) : ''}
            ${q.answer ? `<p><strong>Answer:</strong> ${formatInline(q.answer)}</p>` : ''}
            ${q.markingRubric ? `<p><strong>Marking guide:</strong> ${formatInline(q.markingRubric)}</p>` : ''}
          </article>
        `);
      }
    }
  }

  if (mcqAnswers.length > 0) {
    answers.unshift(`
      <div class="answer-grid keep-together">
        ${mcqAnswers.map((answer) => `
          <span><strong>Q${escapeHtml(answer.number)}</strong> ${escapeHtml(answer.answer)}</span>
        `).join('')}
      </div>
    `);
  }

  if (answers.length === 0) return '';
  return `
    <section class="memo-section teacher-only">
      <h4>Memo and marking guidance</h4>
      ${answers.join('')}
    </section>
  `;
}

async function renderQuestionDiagram(diagram: NormalisedDiagram): Promise<string> {
  if (diagram.renderStatus === 'rendered' && diagram.svgUrl) {
    const dataUri = await svgDataUri(diagram.svgUrl);
    if (dataUri) {
      return `
        <figure class="question-diagram keep-together">
          <img src="${escapeAttr(dataUri)}" alt="${escapeAttr(diagram.alt)}">
        </figure>
      `;
    }
  }
  return `
    <aside class="diagram-placeholder">
      <strong>${diagram.renderStatus === 'pending' ? 'Diagram pending' : 'Diagram unavailable'}</strong>
      <p>${formatInline(diagram.alt)}</p>
    </aside>
  `;
}

async function svgDataUri(svgUrl: string): Promise<string | null> {
  if (!svgUrl.startsWith(DIAGRAM_URL_PREFIX)) return null;
  const rel = svgUrl.slice(DIAGRAM_URL_PREFIX.length).replace(/^\/+/, '');
  if (rel.includes('..')) return null;
  const absPath = path.resolve(DIAGRAM_BASE_DIR, rel);
  try {
    const svg = await fs.readFile(absPath, 'utf8');
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  } catch {
    return null;
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

function renderMetaPills(items: string[]): string {
  return `
    <div class="meta-pills">
      ${items.filter(Boolean).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
    </div>
  `;
}

function renderTwoColumns(left: unknown[], right: unknown[]): string {
  const max = Math.max(left.length, right.length);
  const rows = Array.from({ length: max }, (_, index) => `
    <tr>
      <td>${index + 1}. ${formatInline(left[index] ?? '')}</td>
      <td>${optionLabel(index)}. ${formatInline(right[index] ?? '')}</td>
    </tr>
  `).join('');
  return `
    <table class="two-column-table">
      <thead><tr><th>Column A</th><th>Column B</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderMarkdownishHtml(value: unknown): string {
  const text = cleanMarkdownSource(value);
  if (!text) return '';

  const lines = text.split('\n');
  const parts: string[] = [];
  let paragraphBuffer: string[] = [];

  const flush = (): void => {
    if (paragraphBuffer.length === 0) return;
    parts.push(renderMarkdownParagraphs(paragraphBuffer.join('\n')));
    paragraphBuffer = [];
  };

  for (let index = 0; index < lines.length;) {
    const parsed = parseMarkdownTable(lines, index);
    if (parsed) {
      flush();
      parts.push(renderMarkdownTable(parsed.table));
      index = parsed.nextIndex;
      continue;
    }
    paragraphBuffer.push(lines[index] ?? '');
    index += 1;
  }

  flush();
  return parts.join('');
}

function renderMarkdownParagraphs(rawText: string): string {
  const blocks = rawText.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return '';

    if (lines.length === 1) return renderMarkdownLine(lines[0] ?? '');

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return `<ul>${lines.map((line) => `<li>${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    }

    if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      return `<ol>${lines.map((line) => `<li>${formatInline(line.replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
    }

    if (lines.some((line) => isMarkdownControlLine(line))) {
      return renderMarkdownLinesSequential(lines);
    }

    return `<p>${formatInline(lines.join(' '))}</p>`;
  }).join('');
}

function renderMarkdownLinesSequential(lines: string[]): string {
  const parts: string[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index] ?? '';

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^[-*]\s+/, ''));
        index += 1;
      }
      parts.push(`<ul>${items.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\d+[.)]\s+/, ''));
        index += 1;
      }
      parts.push(`<ol>${items.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ol>`);
      continue;
    }

    parts.push(renderMarkdownLine(line));
    index += 1;
  }
  return parts.join('');
}

function renderMarkdownLine(line: string): string {
  const clean = line.trim();
  if (!clean) return '';

  const heading = clean.match(/^(#{1,5})\s+(.+)$/);
  if (heading) {
    const level = Math.min(5, Math.max(4, (heading[1]?.length ?? 1) + 3));
    return `<h${level}>${formatInline(heading[2] ?? '')}</h${level}>`;
  }

  if (isDisplayFormula(clean)) return `<pre class="formula-line">${escapeHtml(stripMarkdown(clean))}</pre>`;
  if (/^>/.test(clean)) return `<blockquote>${formatInline(clean.replace(/^>\s*/, ''))}</blockquote>`;
  if (/^[-*]\s+/.test(clean)) return `<ul><li>${formatInline(clean.replace(/^[-*]\s+/, ''))}</li></ul>`;

  const numbered = clean.match(/^\d+[.)]\s+(.+)$/);
  if (numbered) return `<ol><li>${formatInline(numbered[1] ?? '')}</li></ol>`;

  const label = clean.match(/^(\*\*)?([A-Z][A-Za-z0-9 /()%+-]{2,72}:)(\*\*)?\s*(.+)?$/);
  if (label) {
    return `<p class="label-line"><strong>${escapeHtml(label[2] ?? '')}</strong> ${formatInline(label[4] ?? '')}</p>`;
  }

  return `<p>${formatInline(clean)}</p>`;
}

function isMarkdownControlLine(line: string): boolean {
  return isDisplayFormula(line)
    || /^#{1,5}\s+/.test(line)
    || /^>/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+[.)]\s+/.test(line)
    || /^(\*\*)?[A-Z][A-Za-z0-9 /()%+-]{2,72}:(\*\*)?/.test(line);
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

function renderMarkdownTable(table: MarkdownTable): string {
  return `
    <table class="doc-table">
      <thead><tr>${table.headers.map((cell) => `<th>${formatInline(cell)}</th>`).join('')}</tr></thead>
      <tbody>
        ${table.rows.map((row) => `
          <tr>${table.headers.map((_, index) => `<td>${formatInline(row[index] ?? '')}</td>`).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
  `;
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
    .map((cell) => cleanPrintableText(cell, { preserveLineBreaks: false }));
}

function formatInline(value: unknown): string {
  let text = cleanMarkdownSource(value).replace(/\s+/g, ' ').trim();
  text = escapeHtml(text);
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

function cleanMarkdownSource(value: unknown): string {
  let text = typeof value === 'string' ? value : String(value ?? '');
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = text.replace(/_{3,}/g, 'CAMPUSLY_PRINT_BLANK');
  text = replaceLatexMath(text);
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ');
  text = decodeHtmlEntities(text);
  text = normaliseSpecialCharacters(text);
  text = text.replace(/CAMPUSLY_PRINT_BLANK/g, '__________');
  text = text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function renderMermaidDiagram(block: IContentBlock): string {
  const graph = parseMermaidGraph(block.content);
  if (!graph) return '';

  const roots = graph.rootIds
    .map((id) => graph.nodes.get(id))
    .filter((node): node is MermaidNode => Boolean(node))
    .sort((a, b) => b.children.length - a.children.length);
  const root = roots[0] ?? Array.from(graph.nodes.values())[0];
  if (!root || root.children.length === 0) return '';

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

  if (cards.length === 0) return '';
  return `
    <figure class="mermaid-figure keep-together">
      <figcaption>${formatInline(caption)}</figcaption>
      <div class="mermaid-root">${formatInline(root.label)}</div>
      <div class="mermaid-cards">
        ${cards.map((card) => `
          <div class="mermaid-card">
            <h5>${formatInline(card.title)}</h5>
            ${card.items.length > 0
              ? `<ul>${card.items.slice(0, 8).map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`
              : ''}
          </div>
        `).join('')}
      </div>
    </figure>
  `;
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

function renderMediaPlaceholder(block: IContentBlock): string {
  const caption = getString(block.metadata?.caption)
    || getString(block.metadata?.title)
    || inferVisualDescription(block.content);
  return `
    <aside class="media-placeholder keep-together">
      <strong>${block.type === 'image' ? 'Visual resource' : 'Video resource'}</strong>
      <p>${formatInline(caption)}</p>
    </aside>
  `;
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
  let text = cleanMarkdownSource(value)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1');
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

function inferVisualDescription(content: unknown): string {
  const text = getString(content);
  if (/^\s*(graph|flowchart|sequenceDiagram|classDiagram|erDiagram)\b/i.test(text)) {
    return 'Diagram for this section. Open the digital lesson workspace to view the interactive version.';
  }
  return 'Visual resource for this section. Open the digital lesson workspace to view the original media.';
}

function documentCss(): string {
  return `
    @page { size: A4; }
    * { box-sizing: border-box; }
    html {
      font-family: "Aptos", "Segoe UI", Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { margin: 0; font-size: 10.4pt; line-height: 1.48; }
    p, ul, ol, blockquote, table, pre { margin: 0 0 9pt; }
    h1, h2, h3, h4, h5 { margin: 0; line-height: 1.15; color: #111827; }
    h4 { font-size: 13pt; margin: 14pt 0 7pt; }
    h5 { font-size: 10.2pt; margin: 0 0 5pt; }
    ul, ol { padding-left: 18pt; }
    li { margin-bottom: 3pt; }
    strong { font-weight: 700; }
    code, pre { font-family: "Cascadia Mono", Consolas, monospace; }
    .document-page { break-before: page; }
    .keep-together { break-inside: avoid; }
    .muted { color: #64748b; font-style: italic; }

    .cover-page {
      min-height: 245mm;
      position: relative;
      display: flex;
      flex-direction: column;
      padding-top: 2mm;
    }
    .cover-rule {
      position: absolute;
      left: 0;
      top: 0;
      width: 7pt;
      height: 100%;
      background: #1d4ed8;
    }
    .cover-topline {
      display: flex;
      justify-content: space-between;
      gap: 24pt;
      padding-left: 18pt;
      align-items: flex-start;
    }
    .eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1.5pt;
      color: #475569;
      font-size: 8pt;
      font-weight: 700;
    }
    .document-type {
      margin: 4pt 0 0;
      color: #1d4ed8;
      font-size: 15pt;
      font-weight: 800;
    }
    .document-mark {
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      padding: 5pt 10pt;
      color: #334155;
      font-size: 8.8pt;
      font-weight: 700;
    }
    .cover-title-block {
      margin-top: 28mm;
      padding-left: 18pt;
      max-width: 158mm;
    }
    .subject-kicker {
      color: #0f766e;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 1.2pt;
      font-weight: 800;
      margin: 0 0 8pt;
    }
    .cover-title-block h1 {
      font-size: 32pt;
      letter-spacing: 0;
      max-width: 155mm;
    }
    .cover-topic {
      margin-top: 12pt;
      color: #475569;
      font-size: 13pt;
      max-width: 140mm;
    }
    .cover-meta-grid {
      margin: 24mm 0 0 18pt;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8pt;
    }
    .cover-meta-item {
      border: 1px solid #d7dde7;
      border-radius: 8pt;
      padding: 8pt 9pt;
      background: #f8fafc;
      min-height: 44pt;
    }
    .cover-meta-item span {
      display: block;
      color: #64748b;
      font-size: 7.2pt;
      text-transform: uppercase;
      letter-spacing: .8pt;
      font-weight: 800;
      margin-bottom: 4pt;
    }
    .cover-meta-item strong {
      display: block;
      color: #0f172a;
      font-size: 10.2pt;
    }
    .learner-panel, .teacher-panel {
      margin: 18mm 0 0 18pt;
      border-top: 2px solid #0f172a;
      padding-top: 10pt;
      max-width: 150mm;
    }
    .learner-panel h2, .teacher-panel h2 {
      font-size: 14pt;
      margin-bottom: 8pt;
    }
    .write-line {
      display: grid;
      grid-template-columns: 28mm 1fr;
      align-items: end;
      gap: 8pt;
      margin: 9pt 0;
    }
    .write-line span { font-weight: 700; color: #334155; }
    .write-line b { display: block; border-bottom: 1.4px solid #94a3b8; min-height: 15pt; }
    .schedule-list { list-style: none; padding: 0; }
    .schedule-list li {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding: 6pt 0;
    }

    .page-heading, .phase-header {
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 9pt;
      margin-bottom: 14pt;
    }
    .page-heading p, .phase-header p {
      margin: 0 0 3pt;
      color: #1d4ed8;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1.1pt;
      font-weight: 800;
    }
    .page-heading h2, .phase-header h2 {
      font-size: 23pt;
      letter-spacing: 0;
    }
    .overview-grid {
      display: grid;
      grid-template-columns: 42mm 1fr;
      gap: 13pt;
      align-items: start;
    }
    .at-a-glance {
      border: 1px solid #d7dde7;
      border-radius: 8pt;
      padding: 10pt;
      background: #f8fafc;
      break-inside: avoid;
    }
    .at-a-glance h3 {
      font-size: 11pt;
      margin-bottom: 8pt;
    }
    .key-value {
      border-top: 1px solid #e2e8f0;
      padding: 7pt 0 0;
      margin-top: 7pt;
    }
    .key-value span {
      display: block;
      color: #64748b;
      font-size: 7.5pt;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: .7pt;
    }
    .key-value strong {
      display: block;
      font-size: 9.5pt;
      margin-top: 2pt;
    }
    .premium-card, .material-card {
      border: 1px solid #d7dde7;
      border-radius: 10pt;
      background: #ffffff;
      box-shadow: 0 1pt 0 rgba(15, 23, 42, .04);
    }
    .premium-card { padding: 12pt; margin-bottom: 12pt; }
    .section-label {
      color: #1d4ed8;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: .9pt;
      font-size: 7.6pt;
      margin-bottom: 7pt;
    }
    .objective-list { margin-bottom: 0; }
    .contents-table, .doc-table, .two-column-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.8pt;
      break-inside: auto;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      font-size: 7.6pt;
      text-transform: uppercase;
      letter-spacing: .5pt;
      font-weight: 800;
    }
    th, td {
      border: 1px solid #d7dde7;
      padding: 6pt 7pt;
      vertical-align: top;
    }
    tr { break-inside: avoid; }

    .phase-materials { display: block; }
    .material-card {
      margin-bottom: 15pt;
      overflow: hidden;
      break-inside: auto;
    }
    .material-header {
      display: flex;
      justify-content: space-between;
      gap: 12pt;
      padding: 10pt 12pt;
      background: #f8fafc;
      border-bottom: 1px solid #d7dde7;
      break-inside: avoid;
    }
    .material-header p {
      margin: 0 0 3pt;
      color: #64748b;
      font-size: 7.4pt;
      text-transform: uppercase;
      letter-spacing: .7pt;
      font-weight: 800;
    }
    .material-header h3 { font-size: 14pt; }
    .material-header > span {
      flex: none;
      align-self: start;
      border-radius: 999px;
      padding: 4pt 8pt;
      color: #0f766e;
      background: #ccfbf1;
      font-size: 7.4pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .5pt;
    }
    .material-body { padding: 12pt; }
    .teacher-note, .answer-reveal {
      margin: 10pt 12pt 0;
      padding: 8pt 10pt;
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
      border-radius: 6pt;
      break-inside: avoid;
    }
    .teacher-note strong, .answer-reveal strong {
      display: block;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: .7pt;
      font-size: 7.2pt;
      margin-bottom: 3pt;
    }
    .teacher-note p, .answer-reveal p { margin: 0; }
    .source-line {
      color: #475569;
      font-style: italic;
      border-left: 3px solid #cbd5e1;
      padding-left: 8pt;
      margin-bottom: 10pt;
    }
    .label-line strong { color: #0f172a; }
    blockquote {
      color: #475569;
      border-left: 3px solid #94a3b8;
      padding-left: 9pt;
      font-style: italic;
    }
    .formula-line {
      white-space: pre-wrap;
      background: #f8fafc;
      border: 1px solid #d7dde7;
      border-radius: 6pt;
      padding: 7pt 8pt;
      font-size: 8.5pt;
    }
    .content-subtitle { margin-top: 0; }
    .meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 5pt;
      margin-bottom: 10pt;
    }
    .meta-pills span {
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      padding: 3pt 7pt;
      color: #334155;
      background: #f8fafc;
      font-size: 8pt;
      font-weight: 700;
    }
    .checkpoint-card, .activity-block, .instruction-block, .step-block {
      margin: 10pt 0;
      padding: 10pt;
      border-radius: 8pt;
      border: 1px solid #d7dde7;
      background: #ffffff;
    }
    .checkpoint-card {
      background: #f8fafc;
      border-color: #bfdbfe;
    }
    .checkpoint-card h4, .activity-block h4, .instruction-block h4, .step-block h4 {
      margin-top: 0;
      color: #0f172a;
      font-size: 12.2pt;
    }
    .option-list { margin: 7pt 0 0 18pt; }
    .option-list li { padding-left: 2pt; }
    .option-list li span {
      margin-left: 6pt;
      color: #047857;
      font-size: 7pt;
      text-transform: uppercase;
      font-weight: 800;
    }
    .ordered-work { margin-bottom: 0; }
    .step-card {
      display: grid;
      grid-template-columns: 22pt 1fr;
      gap: 8pt;
      padding: 8pt 0;
      border-top: 1px solid #e2e8f0;
    }
    .step-card > span {
      display: grid;
      place-items: center;
      width: 22pt;
      height: 22pt;
      border-radius: 999px;
      color: #ffffff;
      background: #1d4ed8;
      font-size: 8pt;
      font-weight: 800;
    }
    .media-placeholder, .diagram-placeholder {
      border: 1px dashed #94a3b8;
      border-radius: 8pt;
      padding: 10pt;
      background: #f8fafc;
      color: #475569;
    }
    .media-placeholder strong, .diagram-placeholder strong {
      display: block;
      color: #334155;
      margin-bottom: 3pt;
    }
    .mermaid-figure {
      border: 1px solid #cbd5e1;
      border-radius: 10pt;
      padding: 10pt;
      background: #f8fafc;
      margin: 10pt 0;
    }
    .mermaid-figure figcaption {
      color: #475569;
      font-style: italic;
      margin-bottom: 8pt;
    }
    .mermaid-root {
      margin: 0 auto 10pt;
      width: 65%;
      text-align: center;
      padding: 8pt;
      border: 1.5px solid #60a5fa;
      border-radius: 8pt;
      background: #dbeafe;
      font-weight: 800;
    }
    .mermaid-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8pt;
    }
    .mermaid-card {
      border: 1px solid #d7dde7;
      border-radius: 8pt;
      padding: 8pt;
      background: #ffffff;
    }
    .mermaid-card h5 { color: #1d4ed8; }
    .mermaid-card ul { margin-bottom: 0; }

    .question-section { margin-top: 7pt; }
    .question-section > h4 {
      margin: 0 0 9pt;
      text-transform: uppercase;
      letter-spacing: .3pt;
    }
    .question-instructions {
      color: #475569;
      font-style: italic;
      margin-bottom: 9pt;
    }
    .question-card {
      padding: 8pt 0 10pt;
      border-top: 1px solid #e2e8f0;
      break-inside: avoid;
    }
    .written-question {
      break-inside: auto;
    }
    .question-stem-wrap {
      break-inside: avoid;
    }
    .question-meta {
      display: flex;
      gap: 7pt;
      align-items: baseline;
      margin-bottom: 4pt;
    }
    .question-meta strong { font-size: 10pt; }
    .question-meta span {
      color: #475569;
      font-size: 8.8pt;
      font-weight: 700;
    }
    .question-stem {
      margin-left: 18pt;
      margin-bottom: 6pt;
    }
    .mcq-answer {
      margin: 6pt 0 0 18pt;
      font-style: italic;
    }
    .mcq-answer span {
      display: inline-block;
      width: 22pt;
      border-bottom: 1px solid #475569;
    }
    .answer-lines {
      margin: 7pt 0 0 18pt;
    }
    .answer-lines span {
      display: block;
      height: 17pt;
      border-bottom: 1px solid #94a3b8;
    }
    .question-diagram {
      margin: 8pt 0 8pt 18pt;
      text-align: center;
    }
    .question-diagram img {
      max-width: 100%;
      max-height: 70mm;
    }
    .memo-section {
      margin-top: 13pt;
      padding-top: 10pt;
      border-top: 2px solid #0f172a;
    }
    .memo-section h4 { margin-top: 0; }
    .memo-answer {
      border: 1px solid #d7dde7;
      border-radius: 8pt;
      padding: 8pt;
      margin: 7pt 0;
      background: #f8fafc;
    }
    .answer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5pt;
      margin-bottom: 9pt;
    }
    .answer-grid span {
      border: 1px solid #d7dde7;
      background: #f8fafc;
      border-radius: 6pt;
      padding: 5pt 6pt;
    }
  `;
}
