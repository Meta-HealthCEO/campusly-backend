/**
 * Seed script for assessments and marks.
 *
 * Connects to MongoDB, finds existing classes/students/subjects from the
 * main seed, then creates assessments and random marks for each class.
 *
 * Usage:
 *   npx tsx scripts/seed-grades.ts
 */

import mongoose from 'mongoose';
import { config } from '../src/config/env.js';
import { Class } from '../src/modules/Academic/model.js';
import { Subject } from '../src/modules/Academic/model.js';
import { Assessment } from '../src/modules/Academic/model.js';
import { Mark } from '../src/modules/Academic/model.js';
import { Student } from '../src/modules/Student/model.js';
import { School } from '../src/modules/School/model.js';
import { logger } from '../src/common/logger.js';

interface AssessmentTemplate {
  name: string;
  type: 'test' | 'exam' | 'assignment' | 'practical' | 'project';
  totalMarks: number;
  weight: number;
  term: number;
}

const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  { name: 'Term 1 Test', type: 'test', totalMarks: 50, weight: 25, term: 1 },
  { name: 'Term 1 Assignment', type: 'assignment', totalMarks: 30, weight: 15, term: 1 },
  { name: 'Practical Assessment', type: 'practical', totalMarks: 40, weight: 20, term: 1 },
];

function randomMark(min: number, max: number, total: number): number {
  const minMark = Math.round((min / 100) * total);
  const maxMark = Math.round((max / 100) * total);
  return Math.round(minMark + Math.random() * (maxMark - minMark));
}

async function seedGrades(): Promise<void> {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Find the school
    const school = await School.findOne({});
    if (!school) {
      logger.error('No school found. Run the main seed first.');
      process.exit(1);
    }
    const schoolId = school._id;
    logger.info(`Using school: ${school.name} (${String(schoolId)})`);

    // Clear existing assessments and marks for this school
    const deletedAssessments = await Assessment.deleteMany({ schoolId });
    const deletedMarks = await Mark.deleteMany({ schoolId });
    logger.info(`Cleared ${deletedAssessments.deletedCount} assessments, ${deletedMarks.deletedCount} marks`);

    // Load classes and subjects
    const classes = await Class.find({ schoolId, isDeleted: false });
    const subjects = await Subject.find({ schoolId, isDeleted: false });

    if (classes.length === 0) {
      logger.error('No classes found. Run the main seed first.');
      process.exit(1);
    }
    if (subjects.length === 0) {
      logger.error('No subjects found. Run the main seed first.');
      process.exit(1);
    }

    logger.info(`Found ${classes.length} classes, ${subjects.length} subjects`);

    let totalAssessments = 0;
    let totalMarks = 0;

    for (const cls of classes) {
      // Find students in this class
      const students = await Student.find({
        schoolId,
        classId: cls._id,
        enrollmentStatus: 'active',
      });

      if (students.length === 0) {
        logger.info(`  Skipping ${cls.name} (no students)`);
        continue;
      }

      logger.info(`  ${cls.name}: ${students.length} students`);

      // Pick first 2 subjects for this class (simulate subject assignment)
      const classSubjects = subjects.slice(0, Math.min(2, subjects.length));

      for (const subject of classSubjects) {
        for (const template of ASSESSMENT_TEMPLATES) {
          // Create assessment
          const assessment = await Assessment.create({
            name: `${subject.name} - ${template.name}`,
            subjectId: subject._id,
            classId: cls._id,
            schoolId,
            type: template.type,
            totalMarks: template.totalMarks,
            weight: template.weight,
            term: template.term,
            academicYear: 2026,
            date: new Date('2026-03-15'),
          });
          totalAssessments++;

          // Create marks for each student (40-95% range)
          const markDocs = students.map((student) => {
            const mark = randomMark(40, 95, template.totalMarks);
            return {
              assessmentId: assessment._id,
              studentId: student._id,
              schoolId,
              mark,
              total: template.totalMarks,
              percentage: Math.round((mark / template.totalMarks) * 100),
            };
          });

          await Mark.insertMany(markDocs);
          totalMarks += markDocs.length;
        }
      }
    }

    logger.info('\n========================================');
    logger.info('  Grade seed completed successfully!');
    logger.info('========================================');
    logger.info(`  Assessments: ${totalAssessments}`);
    logger.info(`  Marks:       ${totalMarks}`);
    logger.info('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: unknown) {
    logger.error({ err: error }, 'Grade seed failed');
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedGrades();
