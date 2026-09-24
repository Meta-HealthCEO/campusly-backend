import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { migrationLine, pickTopic, questionsFromQuiz } from '../quiz-migration.js';

const id = () => new mongoose.Types.ObjectId();
const ctx = { schoolId: id(), subjectId: id(), gradeId: id(), curriculumNodeId: id(), createdBy: id() };

describe('questionsFromQuiz', () => {
  it('turns multiple-choice and true/false questions into question-bank questions with the right answer marked', () => {
    const { docs, skipped } = questionsFromQuiz({
      questions: [
        { questionText: 'Half of 10?', questionType: 'mcq', options: [{ text: '2', isCorrect: false }, { text: '5', isCorrect: true }], correctAnswer: '5', points: 2 },
        { questionText: 'A square has 4 sides.', questionType: 'true_false', options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], correctAnswer: 'True', points: 1 },
      ],
    }, ctx);
    expect(skipped).toEqual([]);
    expect(docs[0]).toMatchObject({
      type: 'mcq', stem: 'Half of 10?', marks: 2, answer: '5', status: 'approved', source: 'teacher', tags: ['from_learning_quiz'],
      options: [{ label: 'A', text: '2', isCorrect: false }, { label: 'B', text: '5', isCorrect: true }],
      schoolId: ctx.schoolId, subjectId: ctx.subjectId, gradeId: ctx.gradeId, curriculumNodeId: ctx.curriculumNodeId, createdBy: ctx.createdBy,
      cognitiveLevel: { caps: 'knowledge', blooms: 'remember' }, isDeleted: false,
    });
    expect(docs[1]).toMatchObject({ type: 'true_false', answer: 'true' });
  });

  it('keeps short answers, and reports what cannot move', () => {
    const { docs, skipped } = questionsFromQuiz({
      questions: [
        { questionText: 'Name a prime below 5.', questionType: 'short_answer', options: [], correctAnswer: '2 or 3', points: 1 },
        { questionText: 'Match the pairs', questionType: 'matching', options: [], correctAnswer: 'a-1', points: 3 },
        { questionText: 'Pick one', questionType: 'mcq', options: [{ text: 'x', isCorrect: false }], correctAnswer: '', points: 1 },
      ],
    }, ctx);
    expect(docs.map((d) => [d.type, d.answer])).toEqual([['short_answer', '2 or 3']]);
    expect(skipped).toEqual([
      { index: 1, reason: "Matching questions can't move to the question bank yet." },
      { index: 2, reason: 'This question has no right answer marked.' },
    ]);
  });
});

describe('migrationLine', () => {
  it('says what will move, in one line for the report', () => {
    expect(migrationLine({ title: 'Fractions' }, { questions: 8, skipped: 1, homeworks: 2, templates: 0, lessons: 1 }, 'Common fractions'))
      .toBe('Fractions → CAPS topic "Common fractions": 8 questions (1 left out), 2 homeworks; 1 lesson still uses the old quiz');
    expect(migrationLine({ title: 'Shapes' }, { questions: 1, skipped: 0, homeworks: 0, templates: 1, lessons: 0 }, 'Shapes'))
      .toBe('Shapes → CAPS topic "Shapes": 1 question, 1 homework template');
  });
});

describe('pickTopic', () => {
  const topics = [
    { id: 'w', title: 'Whole numbers', termNumber: 1, order: 0 },
    { id: 'f', title: 'Common fractions', termNumber: 2, order: 1 },
    { id: 'd', title: 'Decimal fractions', termNumber: 3, order: 2 },
  ];

  it("files the questions under the topic the quiz is about", () => {
    expect(pickTopic('Fractions test', topics)).toBe('f');
    expect(pickTopic('Decimal fractions quiz', topics)).toBe('d');
  });

  it('falls back to the earliest topic, and to nothing when there are none', () => {
    expect(pickTopic('Term 1 revision', topics)).toBe('w');
    expect(pickTopic('Fractions', [])).toBeNull();
  });
});

describe('true/false questions', () => {
  const tf = (right: string, wrong: string) => ({
    questionText: 'The sky is blue.', questionType: 'true_false', points: 1,
    options: [{ text: right, isCorrect: true }, { text: wrong, isCorrect: false }], correctAnswer: right,
  });

  it('keep an answer the exercise marker understands (true or false), in English or Afrikaans', () => {
    expect(questionsFromQuiz({ questions: [tf('True', 'False')] }, ctx).docs[0]).toMatchObject({ type: 'true_false', answer: 'true' });
    expect(questionsFromQuiz({ questions: [tf('Onwaar', 'Waar')] }, ctx).docs[0]).toMatchObject({ type: 'true_false', answer: 'false' });
    expect(questionsFromQuiz({ questions: [tf('Yes', 'No')] }, ctx).docs[0]).toMatchObject({ type: 'true_false', answer: 'true' });
  });

  it('become multiple choice when their options are not true and false', () => {
    const doc = questionsFromQuiz({ questions: [tf('Correct', 'Incorrect')] }, ctx).docs[0];
    expect(doc).toMatchObject({ type: 'mcq', answer: 'Correct' });
    expect(doc.options.map((o) => o.text)).toEqual(['Correct', 'Incorrect']);
  });
});
