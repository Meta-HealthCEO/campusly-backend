// src/modules/AITools/__tests__/service-pdf.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GeneratedPaper } from '../model.js';
import { School } from '../../School/model.js';
import { AIPdfService } from '../service-pdf.js';

const originalUploadDir = process.env.UPLOAD_DIR;
let tmpDir: string;

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-pdf-test-'));
  fs.mkdirSync(path.join(tmpDir, 'diagrams'), { recursive: true });
  process.env.UPLOAD_DIR = tmpDir;
  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test';
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  process.env.UPLOAD_DIR = originalUploadDir;
  await mongoose.connection.dropDatabase();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('AIPdfService', () => {
  it('generates a PDF buffer containing diagram when rendered', async () => {
    const svgHash = 'abc123def456';
    const svgFile = path.join(tmpDir, 'diagrams', `${svgHash}.svg`);
    fs.writeFileSync(svgFile, '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50"/></svg>');

    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    await School.create({
      _id: schoolId,
      name: 'Test High',
      joinCode: 'TESTHX',
      address: {
        street: '1 Test St',
        city: 'Testville',
        province: 'Gauteng',
        postalCode: '0001',
        country: 'South Africa',
      },
      contactInfo: {
        email: 'test@testhigh.edu.za',
        phone: '0110000000',
      },
      subscription: {
        tier: 'basic',
        expiresAt: new Date('2030-01-01'),
      },
      settings: {
        academicYear: 2026,
        terms: 4,
        gradingSystem: 'percentage',
      },
      isDeleted: false,
    });

    const paper = await GeneratedPaper.create({
      schoolId, teacherId,
      subject: 'Mathematics', grade: 10, term: 2, topic: 'Algebra',
      difficulty: 'medium', duration: 60, totalMarks: 50, status: 'ready',
      sections: [{
        sectionLabel: 'Section A',
        questionType: 'Short Answer',
        questions: [{
          questionNumber: 1, marks: 5, questionText: 'Solve for x.',
          modelAnswer: 'x = 5', markingGuideline: '5 for correct setup',
          diagram: {
            tikz: '\\begin{tikzpicture}\\draw (0,0) -- (1,0);\\end{tikzpicture}', data: {}, alt: 'number line',
            svgUrl: `/uploads/diagrams/${svgHash}.svg`,
            hash: svgHash, renderStatus: 'rendered', renderError: null,
          },
        }],
      }],
      memorandum: 'See answers.',
      isDeleted: false,
    });

    const buf = await AIPdfService.generatePaperPdf(paper._id.toString(), schoolId.toString());
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  });

  it('throws NotFoundError when paper does not belong to school', async () => {
    const otherSchool = new mongoose.Types.ObjectId();
    const bogusPaperId = new mongoose.Types.ObjectId();
    await expect(
      AIPdfService.generatePaperPdf(bogusPaperId.toString(), otherSchool.toString()),
    ).rejects.toThrow(/not found/i);
  });
});
