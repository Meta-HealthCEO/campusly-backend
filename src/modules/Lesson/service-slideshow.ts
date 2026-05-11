// pptxgenjs ships its `.d.ts` with both `export default PptxGenJS` AND
// `export as namespace PptxGenJS`. Under TS module: Node16, the latter wins
// for `import X from 'pptxgenjs'`, so X resolves to the namespace and is
// neither callable nor usable as a type. Workaround: load via
// `createRequire` (ESM-safe) and keep a small structural type locally.
import { createRequire } from 'node:module';
import { LessonService } from './service.js';
import type { ILesson, ILessonMaterial } from './types.js';
import { LESSON_PHASES } from './types.js';
import {
  renderMaterialBody,
  type SlideTextRun,
} from './service-slideshow-bodies.js';

const requireCJS = createRequire(import.meta.url);

interface SlideHandle {
  background: { color: string };
  addText(text: string | SlideTextRun[], options: Record<string, unknown>): void;
}
interface Pptx {
  layout: string;
  title: string;
  addSlide(): SlideHandle;
  write(options: { outputType: 'nodebuffer' }): Promise<unknown>;
}
const PptxGen = requireCJS('pptxgenjs') as { new (): Pptx };

// ── Public API ────────────────────────────────────────────────────────────
export async function generateSlideshow(
  lessonId: string,
  schoolId: string,
): Promise<Buffer> {
  const lesson = await LessonService.getById(lessonId, schoolId);
  const pptx = buildPresentation(lesson);

  // pptxgenjs `write` returns a Buffer when outputType: 'nodebuffer' but the
  // declared return type is the union string|ArrayBuffer|Buffer|Blob, so we
  // cast on the way out. Lesson size is bounded by MAX_MATERIALS in the PDF
  // exporter (~30 materials) so a single buffer is fine.
  const out = await pptx.write({ outputType: 'nodebuffer' });
  return out as Buffer;
}

// ── Constants ─────────────────────────────────────────────────────────────
const PHASE_LABELS: Record<string, string> = {
  introduction: 'Introduction',
  direct_instruction: 'Direct Instruction',
  practice: 'Practice',
  assessment: 'Assessment',
  homework: 'Homework',
};

const ACCENT = '0066CC';
const TEXT_DARK = '1F2937';
const TEXT_MUTED = '6B7280';
const FONT = 'Calibri';
const TITLE_BG = '0B1F3A';
const TITLE_FG = 'FFFFFF';
const SUBTLE = 'D1D5DB';
const FOOTER_GREY = '9CA3AF';

// ── Builders ──────────────────────────────────────────────────────────────
function buildPresentation(lesson: ILesson): Pptx {
  const pptx: Pptx = new PptxGen();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in (16:9)
  pptx.title = lesson.title;

  addTitleSlide(pptx, lesson);
  if (lesson.objectives.length > 0) addObjectivesSlide(pptx, lesson);

  for (const phase of LESSON_PHASES) {
    const entry = lesson.phases.find((p) => p.phase === phase);
    if (!entry || entry.materialIds.length === 0) continue;
    const materials = entry.materialIds
      .map((id) =>
        lesson.materials.find((m) => m._id.toString() === id.toString()),
      )
      .filter((m): m is ILessonMaterial => !!m);
    if (materials.length === 0) continue;

    addPhaseDividerSlide(pptx, PHASE_LABELS[phase] ?? phase, materials.length);
    for (const material of materials) addMaterialSlide(pptx, material);
  }

  addClosingSlide(pptx);
  return pptx;
}

function addTitleSlide(pptx: Pptx, lesson: ILesson): void {
  const slide = pptx.addSlide();
  slide.background = { color: TITLE_BG };
  slide.addText(lesson.title, {
    x: 0.5, y: 2.2, w: 12.3, h: 1.5,
    fontFace: FONT, fontSize: 44, bold: true, color: TITLE_FG, align: 'center',
  });

  const grade = readPopulatedName(
    (lesson.gradeId as { name?: string; title?: string } | null | undefined) ?? null,
  );
  const subject = readPopulatedName(
    (lesson.subjectId as { name?: string; title?: string } | null | undefined) ?? null,
  );
  const term =
    typeof lesson.termNumber === 'number' ? `Term ${lesson.termNumber}` : '';
  const meta = [grade, subject, term].filter(Boolean).join('  ·  ');

  if (meta) {
    slide.addText(meta, {
      x: 0.5, y: 3.9, w: 12.3, h: 0.5,
      fontFace: FONT, fontSize: 20, color: SUBTLE, align: 'center',
    });
  }

  const teacher = readTeacherName(lesson.teacherId);
  const date = new Date().toLocaleDateString();
  if (teacher) {
    slide.addText(teacher, {
      x: 0.5, y: 5.5, w: 12.3, h: 0.4,
      fontFace: FONT, fontSize: 14, color: SUBTLE, align: 'center',
    });
  }
  slide.addText(date, {
    x: 0.5, y: 5.9, w: 12.3, h: 0.4,
    fontFace: FONT, fontSize: 12, color: FOOTER_GREY, align: 'center',
  });
}

function addObjectivesSlide(pptx: Pptx, lesson: ILesson): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  slide.addText('Learning Objectives', {
    x: 0.5, y: 0.4, w: 12.3, h: 0.8,
    fontFace: FONT, fontSize: 32, bold: true, color: ACCENT,
  });
  slide.addText(
    lesson.objectives.map((o, i) => ({
      text: `${i + 1}. ${o}`,
      options: { breakLine: true },
    })),
    {
      x: 0.7, y: 1.5, w: 11.9, h: 5.5,
      fontFace: FONT, fontSize: 18, color: TEXT_DARK,
      paraSpaceAfter: 8, valign: 'top',
    },
  );
}

function addPhaseDividerSlide(
  pptx: Pptx,
  label: string,
  materialCount: number,
): void {
  const slide = pptx.addSlide();
  slide.background = { color: TITLE_BG };
  slide.addText(label, {
    x: 0.5, y: 2.8, w: 12.3, h: 1.2,
    fontFace: FONT, fontSize: 48, bold: true, color: TITLE_FG, align: 'center',
  });
  slide.addText(
    `${materialCount} ${materialCount === 1 ? 'material' : 'materials'}`,
    {
      x: 0.5, y: 4.2, w: 12.3, h: 0.5,
      fontFace: FONT, fontSize: 18, color: SUBTLE, align: 'center',
    },
  );
}

function addMaterialSlide(pptx: Pptx, material: ILessonMaterial): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  // Title
  slide.addText(material.title, {
    x: 0.5, y: 0.4, w: 9.5, h: 0.8,
    fontFace: FONT, fontSize: 26, bold: true, color: TEXT_DARK,
  });
  // Kind badge top-right
  slide.addText(humanizeKind(material.kind), {
    x: 10.3, y: 0.5, w: 2.5, h: 0.5,
    fontFace: FONT, fontSize: 12, bold: true, color: TITLE_FG,
    fill: { color: ACCENT }, align: 'center', valign: 'middle',
  });

  let yCursor = 1.4;
  if (material.teacherNotes && material.teacherNotes.trim().length > 0) {
    slide.addText(material.teacherNotes.trim(), {
      x: 0.5, y: yCursor, w: 12.3, h: 0.8,
      fontFace: FONT, fontSize: 13, italic: true, color: TEXT_MUTED,
      valign: 'top',
    });
    yCursor += 0.9;
  }

  const body = renderMaterialBody(material);
  if (body.length > 0) {
    slide.addText(body, {
      x: 0.5, y: yCursor, w: 12.3, h: 7.5 - yCursor - 0.4,
      fontFace: FONT, fontSize: 14, color: TEXT_DARK,
      paraSpaceAfter: 6, valign: 'top',
    });
  }
}

function addClosingSlide(pptx: Pptx): void {
  const slide = pptx.addSlide();
  slide.background = { color: TITLE_BG };
  slide.addText('Discussion · Next steps', {
    x: 0.5, y: 3.0, w: 12.3, h: 1.2,
    fontFace: FONT, fontSize: 40, bold: true, color: TITLE_FG, align: 'center',
  });
  slide.addText(
    'What did we learn? · What is unclear? · Where to next?',
    {
      x: 0.5, y: 4.4, w: 12.3, h: 0.6,
      fontFace: FONT, fontSize: 18, color: SUBTLE, align: 'center',
    },
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function readPopulatedName(
  v: { name?: string; title?: string } | null | undefined,
): string {
  if (!v || typeof v !== 'object') return '';
  return v.title ?? v.name ?? '';
}

function readTeacherName(t: unknown): string {
  if (!t || typeof t !== 'object') return '';
  const o = t as { firstName?: string; lastName?: string };
  return [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
}

function humanizeKind(kind: string): string {
  return kind
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
