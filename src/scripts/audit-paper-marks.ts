/**
 * Read-only audit. Before phase 2A, issuing an AI mark reused a paper's first
 * gradebook assessment for every class, so a second class's marks could be
 * filed under the first class's column. This counts such marks; it changes
 * nothing. Run: npm run audit:paper-marks
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { Assessment, Mark } from '../modules/Academic/model.js';
import { Student } from '../modules/Student/model.js';
import { misfiledMarks, type MisfiledMark } from './audit-paper-marks-core.js';

async function main(): Promise<void> {
  await mongoose.connect(config.mongodb.uri);
  try {
    const assessments = await Assessment.find({ paperId: { $ne: null }, classId: { $ne: null }, isDeleted: false })
      .select('_id paperId classId schoolId').lean();
    const found: MisfiledMark[] = [];
    for (const a of assessments) {
      const marks = await Mark.find({ assessmentId: a._id, schoolId: a.schoolId, isDeleted: false }).select('_id studentId').lean();
      if (marks.length === 0) continue;
      const students = await Student.find({ _id: { $in: marks.map((m) => m.studentId) }, schoolId: a.schoolId })
        .select('_id classId').lean();
      const classOf = new Map(students.map((s) => [String(s._id), s.classId ? String(s.classId) : null]));
      found.push(...misfiledMarks(
        { assessmentId: String(a._id), paperId: String(a.paperId), classId: String(a.classId) },
        marks.map((m) => ({ markId: String(m._id), studentId: String(m.studentId), studentClassId: classOf.get(String(m.studentId)) ?? null })),
      ));
    }
    logger.info({ checkedAssessments: assessments.length, misfiled: found.length, sample: found.slice(0, 20) },
      found.length === 0 ? 'No paper marks filed under another class.' : `${found.length} paper marks are filed under another class.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Paper marks audit failed');
  process.exit(1);
});
