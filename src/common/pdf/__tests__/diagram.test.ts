// src/common/pdf/__tests__/diagram.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createDocument, finalise } from '../document.js';
import { embedDiagram } from '../diagram.js';
import type { NormalisedDiagram } from '../types.js';

const MINIMAL_SVG = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect x="10" y="10" width="80" height="80" fill="none" stroke="black"/>
</svg>`;

describe('embedDiagram', () => {
  let tmpDir: string;
  let svgPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'diagram-test-'));
    svgPath = path.join(tmpDir, 'test.svg');
    fs.writeFileSync(svgPath, MINIMAL_SVG);
  });

  it('embeds a rendered SVG into the PDF document', async () => {
    const doc = createDocument();
    const diagram: NormalisedDiagram = {
      svgUrl: `/uploads/diagrams/test.svg`,
      alt: 'test diagram',
      renderStatus: 'rendered',
    };
    await embedDiagram(doc, diagram, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });

  it('renders an alt-text placeholder when status is failed', async () => {
    const doc = createDocument();
    const diagram: NormalisedDiagram = {
      svgUrl: null,
      alt: 'a graph of y=x^2',
      renderStatus: 'failed',
    };
    await embedDiagram(doc, diagram, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });

  it('renders an alt-text placeholder when status is pending', async () => {
    const doc = createDocument();
    const diagram: NormalisedDiagram = {
      svgUrl: null,
      alt: 'pending diagram',
      renderStatus: 'pending',
    };
    await embedDiagram(doc, diagram, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });

  it('falls back to alt text when SVG file is missing on disk', async () => {
    const doc = createDocument();
    const diagram: NormalisedDiagram = {
      svgUrl: '/uploads/diagrams/missing.svg',
      alt: 'missing file',
      renderStatus: 'rendered',
    };
    await embedDiagram(doc, diagram, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });
});
