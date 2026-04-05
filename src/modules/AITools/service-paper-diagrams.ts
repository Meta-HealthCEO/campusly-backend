import type { IPaperSection } from './model.js';
import { renderDiagram } from '../QuestionBank/service-diagram.js';
import type { DiagramInput } from '../QuestionBank/service-diagram.js';
import { logger } from '../../common/logger.js';

// ─── Diagram rendering helpers for AI-generated papers ───────────────────────

interface ParsedDiagram {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
}

interface DiagramField {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
  svgUrl: string | null;
  hash: string;
  renderStatus: 'pending' | 'rendered' | 'failed';
  renderError: string | null;
}

function parseDiagramField(raw: unknown): ParsedDiagram | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  const tikz = typeof d.tikz === 'string' ? d.tikz.trim() : '';
  if (!tikz) return null;
  const data =
    d.data && typeof d.data === 'object' && !Array.isArray(d.data)
      ? (d.data as Record<string, unknown>)
      : {};
  const alt = typeof d.alt === 'string' ? d.alt : 'Diagram';
  return { tikz, data, alt };
}

function buildFailure(d: ParsedDiagram, msg: string): DiagramField {
  return {
    tikz: d.tikz, data: d.data, alt: d.alt,
    svgUrl: null, hash: '', renderStatus: 'failed', renderError: msg,
  };
}

export async function renderQuestionDiagram(
  raw: unknown,
): Promise<DiagramField | null> {
  const parsed = parseDiagramField(raw);
  if (!parsed) return null;

  try {
    const input: DiagramInput = { tikz: parsed.tikz, data: parsed.data, alt: parsed.alt };
    const r = await renderDiagram(input);
    return {
      tikz: parsed.tikz, data: parsed.data, alt: parsed.alt,
      svgUrl: r.svgUrl ?? null, hash: r.hash,
      renderStatus: r.renderStatus, renderError: r.renderError ?? null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown render error';
    logger.error(`[AITools] Diagram render failed: ${msg}`);
    return buildFailure(parsed, msg);
  }
}

export async function renderSectionDiagrams(sections: IPaperSection[]): Promise<void> {
  const jobs: Array<{ sIdx: number; qIdx: number; d: ParsedDiagram }> = [];

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
      const q = section.questions[qIdx];
      const parsed = parseDiagramField(q.diagram);
      if (parsed) jobs.push({ sIdx, qIdx, d: parsed });
    }
  }

  if (jobs.length === 0) return;

  await Promise.allSettled(
    jobs.map(async ({ sIdx, qIdx, d }) => {
      try {
        const input: DiagramInput = { tikz: d.tikz, data: d.data, alt: d.alt };
        const r = await renderDiagram(input);
        sections[sIdx].questions[qIdx].diagram = {
          tikz: d.tikz, data: d.data, alt: d.alt,
          svgUrl: r.svgUrl ?? null, hash: r.hash,
          renderStatus: r.renderStatus, renderError: r.renderError ?? null,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown render error';
        logger.error(`[AITools] Diagram render failed for S${sIdx}Q${qIdx}: ${msg}`);
        sections[sIdx].questions[qIdx].diagram = buildFailure(d, msg);
      }
    }),
  );
}
