import PDFDocument from 'pdfkit';
import { LessonService } from './service.js';
import type { ILesson, ILessonMaterial } from './types.js';
import { LESSON_PHASES } from './types.js';

const PHASE_LABELS: Record<string, string> = {
  introduction: 'Introduction',
  direct_instruction: 'Direct Instruction',
  practice: 'Practice',
  assessment: 'Assessment',
  homework: 'Homework',
};

interface RenderOptions {
  studentMode: boolean;
}
const MAX_MATERIALS = 30;

async function renderLessonPdf(
  lessonId: string,
  schoolId: string,
  opts: RenderOptions,
): Promise<Buffer> {
  const lesson = await LessonService.getById(lessonId, schoolId);
  if (lesson.materials.length > MAX_MATERIALS) {
    throw new Error('Lesson too large to export — split into 2 lessons');
  }
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<void>((resolve) => {
    doc.on('end', () => resolve());
  });

  renderCoverPage(doc, lesson, opts);
  renderObjectives(doc, lesson);
  for (const phase of LESSON_PHASES) {
    const entry = lesson.phases.find((p) => p.phase === phase);
    if (!entry || entry.materialIds.length === 0) continue;
    const phaseMaterials = entry.materialIds
      .map((id) => lesson.materials.find((m) => m._id.toString() === id.toString()))
      .filter((m): m is ILessonMaterial => !!m);
    if (phaseMaterials.length === 0) continue;
    renderPhaseHeader(doc, PHASE_LABELS[phase]);
    for (const material of phaseMaterials) renderMaterialCard(doc, material, opts);
  }
  renderPageNumbers(doc, lesson.title);

  doc.end();
  await finished;
  return Buffer.concat(chunks);
}

function renderCoverPage(
  doc: PDFKit.PDFDocument,
  lesson: ILesson,
  opts: RenderOptions,
): void {
  doc.fontSize(28).text(lesson.title, { align: 'center' });
  doc.moveDown(0.5);
  doc
    .fontSize(14)
    .fillColor('gray')
    .text(opts.studentMode ? 'Student Pack' : 'Teacher Pack', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(11).fillColor('black');
  doc.text(`Date: ${new Date(lesson.date).toLocaleDateString()}`);
  doc.text(`Duration: ${lesson.durationMinutes} minutes`);
  doc.text(`Status: ${lesson.status}`);
  doc.addPage();
}

function renderObjectives(doc: PDFKit.PDFDocument, lesson: ILesson): void {
  if (lesson.objectives.length === 0) return;
  doc.fontSize(16).text('Learning Objectives');
  doc.moveDown(0.5).fontSize(11);
  lesson.objectives.forEach((obj, i) => doc.text(`${i + 1}. ${obj}`));
  doc.moveDown(1);
}

function renderPhaseHeader(doc: PDFKit.PDFDocument, label: string): void {
  doc.moveDown(1).fontSize(16).fillColor('#0066cc').text(label).fillColor('black');
  doc.moveDown(0.5);
}

function renderMaterialCard(
  doc: PDFKit.PDFDocument,
  material: ILessonMaterial,
  opts: RenderOptions,
): void {
  doc.fontSize(13).text(`${material.title} (${material.kind})`);
  if (material.teacherNotes && !opts.studentMode) {
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(`Teacher notes: ${material.teacherNotes}`)
      .fillColor('black');
  }
  doc.fontSize(10);
  if (material.kind === 'reading') {
    renderReadingDetails(doc, material);
  } else if (
    material.kind === 'notes' &&
    (material as { contentResourceId?: unknown }).contentResourceId === undefined
  ) {
    doc.text((material as { teacherNotes?: string }).teacherNotes ?? '');
  } else if ((material as { contentResourceId?: unknown }).contentResourceId) {
    doc.text('[Content resource attached — see materials inventory]');
  }
  doc.moveDown(0.5);
}

function renderReadingDetails(doc: PDFKit.PDFDocument, material: ILessonMaterial): void {
  if (material.kind !== 'reading') return;
  const ref = material.textbookRef;
  if (ref.source === 'internal') {
    doc.text(
      `Textbook reference (internal): pages ${ref.pageStart ?? '?'}-${ref.pageEnd ?? '?'}`,
    );
  } else {
    doc.text(`Textbook: ${ref.title}${ref.publisher ? ` (${ref.publisher})` : ''}`);
    if (ref.isbn) doc.text(`ISBN: ${ref.isbn}`);
    if (ref.pageStart && ref.pageEnd) doc.text(`Pages ${ref.pageStart}-${ref.pageEnd}`);
    if (ref.excerpt) doc.moveDown(0.3).fontSize(10).text(ref.excerpt);
  }
}

function renderPageNumbers(doc: PDFKit.PDFDocument, title: string): void {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc
      .fontSize(8)
      .fillColor('gray')
      .text(
        `${title}  •  Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 30,
        { align: 'center' },
      );
  }
}

export async function exportTeacherPack(
  lessonId: string,
  schoolId: string,
): Promise<Buffer> {
  return renderLessonPdf(lessonId, schoolId, { studentMode: false });
}

export async function exportStudentPack(
  lessonId: string,
  schoolId: string,
): Promise<Buffer> {
  return renderLessonPdf(lessonId, schoolId, { studentMode: true });
}
