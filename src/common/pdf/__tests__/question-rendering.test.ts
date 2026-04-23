// src/common/pdf/__tests__/question-rendering.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createDocument, finalise } from '../document.js';
import { renderQuestionSections, renderMemoSections } from '../question-rendering.js';
import type { NormalisedSection } from '../types.js';

describe('renderQuestionSections', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qr-test-'));
  });

  it('renders a section with a short-answer question (no diagram)', async () => {
    const doc = createDocument();
    const sections: NormalisedSection[] = [{
      title: 'Section A',
      instructions: 'Answer all questions',
      questions: [{
        number: '1', marks: 5, stem: 'What is 2+2?', type: 'short',
        options: [], answer: '4', markingRubric: '1 mark for correct answer',
        diagram: null,
      }],
    }];
    renderQuestionSections(doc, sections, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });

  it('renders MCQ options', async () => {
    const doc = createDocument();
    const sections: NormalisedSection[] = [{
      title: 'Section A', instructions: '',
      questions: [{
        number: '1', marks: 2, stem: 'Pick one.', type: 'mcq',
        options: [
          { label: 'A', text: 'Alpha' },
          { label: 'B', text: 'Bravo', isCorrect: true },
        ],
        answer: 'B', markingRubric: '', diagram: null,
      }],
    }];
    renderQuestionSections(doc, sections, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });

  it('embeds diagram when renderStatus is rendered and file exists', async () => {
    const svgPath = path.join(tmpDir, 'abc.svg');
    fs.writeFileSync(svgPath, '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50"/></svg>');
    const doc = createDocument();
    const sections: NormalisedSection[] = [{
      title: 'Section A', instructions: '',
      questions: [{
        number: '1', marks: 5, stem: 'See the diagram.', type: 'short',
        options: [], answer: '', markingRubric: '',
        diagram: { svgUrl: '/uploads/diagrams/abc.svg', alt: 'a square', renderStatus: 'rendered' },
      }],
    }];
    renderQuestionSections(doc, sections, { baseDir: tmpDir, urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });
});

describe('renderMemoSections', () => {
  it('renders answer + marking rubric for structured questions', async () => {
    const doc = createDocument();
    const sections: NormalisedSection[] = [{
      title: 'Section A', instructions: '',
      questions: [{
        number: '1', marks: 5, stem: 'Solve.', type: 'long',
        options: [], answer: 'x = 5', markingRubric: 'Award 2 marks for setup, 3 for correct answer',
        diagram: null,
      }],
    }];
    renderMemoSections(doc, sections, { baseDir: '/tmp', urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });

  it('collects MCQ answers into the answer grid', async () => {
    const doc = createDocument();
    const sections: NormalisedSection[] = [{
      title: 'Section A', instructions: '',
      questions: [
        {
          number: '1', marks: 1, stem: 'Q1', type: 'mcq',
          options: [{ label: 'A', text: 'a' }, { label: 'B', text: 'b', isCorrect: true }],
          answer: 'B', markingRubric: '', diagram: null,
        },
        {
          number: '2', marks: 1, stem: 'Q2', type: 'mcq',
          options: [{ label: 'A', text: 'a', isCorrect: true }, { label: 'B', text: 'b' }],
          answer: 'A', markingRubric: '', diagram: null,
        },
      ],
    }];
    renderMemoSections(doc, sections, { baseDir: '/tmp', urlPrefix: '/uploads/diagrams' });
    const buf = await finalise(doc);
    expect(buf.length).toBeGreaterThan(100);
  });
});
