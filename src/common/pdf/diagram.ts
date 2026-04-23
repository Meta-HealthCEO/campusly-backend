// src/common/pdf/diagram.ts
import fs from 'fs';
import path from 'path';
import SVGtoPDF from 'svg-to-pdfkit';
import {
  MARGIN, CONTENT_WIDTH, FONT_ITALIC,
  DIAGRAM_MAX_WIDTH, DIAGRAM_MAX_HEIGHT,
} from './constants.js';
import type { NormalisedDiagram } from './types.js';

export interface EmbedOptions {
  /** Filesystem base directory the svgUrl is served from (e.g. UPLOAD_DIR). */
  baseDir: string;
  /** URL path prefix that maps into baseDir (e.g. '/uploads/diagrams'). */
  urlPrefix: string;
}

/**
 * Resolve an svgUrl like '/uploads/diagrams/abc.svg' to an absolute filesystem path.
 * Guards against directory traversal.
 */
export function resolveSvgPath(svgUrl: string, opts: EmbedOptions): string | null {
  if (!svgUrl.startsWith(opts.urlPrefix)) return null;
  const rel = svgUrl.slice(opts.urlPrefix.length).replace(/^\/+/, '');
  if (rel.includes('..')) return null;
  return path.resolve(opts.baseDir, rel);
}

export async function embedDiagram(
  doc: PDFKit.PDFDocument,
  diagram: NormalisedDiagram,
  opts: EmbedOptions,
): Promise<void> {
  const canEmbed = diagram.renderStatus === 'rendered' && diagram.svgUrl;
  if (canEmbed) {
    const absPath = resolveSvgPath(diagram.svgUrl!, opts);
    if (absPath && fs.existsSync(absPath)) {
      try {
        const svg = fs.readFileSync(absPath, 'utf8');
        const x = MARGIN + 20;
        const y = doc.y + 4;
        SVGtoPDF(doc, svg, x, y, {
          width: DIAGRAM_MAX_WIDTH,
          height: DIAGRAM_MAX_HEIGHT,
          preserveAspectRatio: 'xMidYMid meet',
        });
        doc.y = y + DIAGRAM_MAX_HEIGHT + 8;
        return;
      } catch {
        // Fall through to alt-text rendering
      }
    }
  }
  renderAltPlaceholder(doc, diagram);
}

function renderAltPlaceholder(doc: PDFKit.PDFDocument, diagram: NormalisedDiagram): void {
  const label =
    diagram.renderStatus === 'pending' ? '[Diagram pending]'
      : diagram.renderStatus === 'failed' ? '[Diagram unavailable]'
        : '[Diagram unavailable]';

  doc.font(FONT_ITALIC).fontSize(9);
  doc.text(`${label} ${diagram.alt}`, {
    width: CONTENT_WIDTH - 20,
    indent: 20,
  });
  doc.moveDown(0.4);
}
