import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { expandTermSelections } from '../topic-selection.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

const frameworkId = new mongoose.Types.ObjectId();
const schoolId = new mongoose.Types.ObjectId();
const otherSchoolId = new mongoose.Types.ObjectId();

async function node(
  type: string,
  title: string,
  parentId: mongoose.Types.ObjectId | null,
  extra: Record<string, unknown> = {},
) {
  const doc = await CurriculumNode.create({
    frameworkId,
    type,
    title,
    code: `${type}-${title}-${new mongoose.Types.ObjectId().toString()}`,
    parentId,
    order: 0,
    schoolId: null,
    ...extra,
  });
  return doc._id as mongoose.Types.ObjectId;
}

describe('expandTermSelections', () => {
  let term1: mongoose.Types.ObjectId;
  let algebra: mongoose.Types.ObjectId;
  let exponents: mongoose.Types.ObjectId;
  let trig: mongoose.Types.ObjectId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
  });

  beforeEach(async () => {
    await CurriculumNode.deleteMany({ frameworkId });
    const subject = await node('subject', 'Mathematics', null);
    term1 = await node('term', 'Term 1', subject);
    algebra = await node('topic', 'Algebraic Expressions', term1, { order: 1 });
    exponents = await node('topic', 'Exponents', term1, { order: 2 });
    trig = await node('topic', 'Trigonometry', term1, { order: 3 });
  });

  afterAll(async () => {
    await CurriculumNode.deleteMany({ frameworkId });
    await mongoose.connection.close();
  });

  it('replaces a selected term with its topics, in curriculum order', async () => {
    const result = await expandTermSelections([term1.toString()], schoolId.toString());

    expect(result).toEqual([algebra, exponents, trig].map(String));
  });

  it('leaves topic selections untouched', async () => {
    const result = await expandTermSelections([exponents.toString()], schoolId.toString());

    expect(result).toEqual([exponents.toString()]);
  });

  it('does not duplicate a topic picked alongside its own term', async () => {
    const result = await expandTermSelections(
      [algebra.toString(), term1.toString()],
      schoolId.toString(),
    );

    expect(result).toEqual([algebra, exponents, trig].map(String));
  });

  it('skips deleted topics and topics private to another school', async () => {
    await CurriculumNode.updateOne({ _id: exponents }, { $set: { isDeleted: true } });
    await CurriculumNode.updateOne({ _id: trig }, { $set: { schoolId: otherSchoolId } });

    const result = await expandTermSelections([term1.toString()], schoolId.toString());

    expect(result).toEqual([algebra.toString()]);
  });
});
