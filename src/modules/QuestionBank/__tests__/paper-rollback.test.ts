import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AssessmentPaper } from '../model-papers.js';
import { rollbackGeneratedPaper } from '../service-paper-generation.js';

const schoolId = new mongoose.Types.ObjectId();

describe('rollbackGeneratedPaper', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
  });

  afterAll(async () => {
    await AssessmentPaper.collection.deleteMany({ schoolId });
    await mongoose.connection.close();
  });

  it('removes a half-created paper and stops it counting as an AI paper', async () => {
    const { insertedId } = await AssessmentPaper.collection.insertOne({ schoolId, aiGenerated: true, isDeleted: false });

    await rollbackGeneratedPaper(insertedId);

    const paper = await AssessmentPaper.collection.findOne({ _id: insertedId });
    expect(paper?.isDeleted).toBe(true);
    expect(paper?.aiGenerated).toBe(false);
  });
});
