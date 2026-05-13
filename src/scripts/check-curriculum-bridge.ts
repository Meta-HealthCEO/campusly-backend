// Diagnostic: verify standalone-teacher academic backfill and FK sweep
// migrations actually ran and did their work.
//
// Run with: npx tsx src/scripts/check-curriculum-bridge.ts

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

async function main(): Promise<void> {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No db handle');

  // ── 1. Migration sentinels ───────────────────────────────────────────
  const sentinelNames = [
    'backfill-standalone-teacher-academic-rows',
    'sweep-curriculum-node-foreign-keys',
  ];
  const sentinels = await db
    .collection('migrations')
    .find({ name: { $in: sentinelNames } })
    .toArray();

  console.log('\n=== MIGRATION SENTINELS ===');
  for (const name of sentinelNames) {
    const doc = sentinels.find((s) => s.name === name);
    if (!doc) {
      console.log(`  ❌ ${name}: NOT RUN`);
    } else if (doc.completedAt && doc.completedAt.getTime() > 0) {
      console.log(`  ✅ ${name}: completed ${doc.completedAt.toISOString()}`);
    } else {
      console.log(`  ⚠️  ${name}: lock-only (epoch placeholder, never completed)`);
    }
  }

  // ── 2. Bridge population ─────────────────────────────────────────────
  const bridgedSubjects = await db
    .collection('subjects')
    .countDocuments({ curriculumNodeId: { $ne: null } });
  const totalSubjects = await db
    .collection('subjects')
    .countDocuments({ isDeleted: false });
  const bridgedGrades = await db
    .collection('grades')
    .countDocuments({ curriculumNodeId: { $ne: null } });
  const totalGrades = await db
    .collection('grades')
    .countDocuments({ isDeleted: false });

  console.log('\n=== BRIDGE POPULATION ===');
  console.log(`  Subjects: ${bridgedSubjects} bridged / ${totalSubjects} total`);
  console.log(`  Grades:   ${bridgedGrades} bridged / ${totalGrades} total`);

  // ── 3. Standalone teacher scope ──────────────────────────────────────
  const standaloneTeachers = await db
    .collection('users')
    .find({ isStandaloneTeacher: true, isDeleted: false })
    .project({ _id: 1, email: 1, schoolId: 1, teachingScope: 1 })
    .toArray();

  console.log('\n=== STANDALONE TEACHERS ===');
  for (const t of standaloneTeachers) {
    const scope = t.teachingScope ?? { grades: [], subjectsByGrade: [] };
    const gradeCount = scope.grades?.length ?? 0;
    const subjectCount = (scope.subjectsByGrade ?? []).reduce(
      (sum: number, e: { subjectIds: unknown[] }) => sum + (e.subjectIds?.length ?? 0),
      0,
    );
    console.log(`  ${t.email ?? t._id}: ${gradeCount} grades, ${subjectCount} subjects in scope, schoolId=${t.schoolId}`);
  }

  // ── 4. Stale FK detection: subject/grade fields holding CurriculumNode IDs
  // We treat a value as "stale" if it resolves in curriculumnodes but NOT in
  // subjects/grades.
  console.log('\n=== STALE FK SCAN ===');
  const collectionsToScan: Array<{ coll: string; field: string; kind: 'subject' | 'grade' }> = [
    { coll: 'homeworks',            field: 'subjectId',  kind: 'subject' },
    { coll: 'questions',            field: 'subjectId',  kind: 'subject' },
    { coll: 'questions',            field: 'gradeId',    kind: 'grade' },
    { coll: 'classes',              field: 'gradeId',    kind: 'grade' },
    { coll: 'textbooks',            field: 'subjectId',  kind: 'subject' },
    { coll: 'textbooks',            field: 'gradeId',    kind: 'grade' },
    { coll: 'contentresources',     field: 'subjectId',  kind: 'subject' },
    { coll: 'contentresources',     field: 'gradeId',    kind: 'grade' },
    { coll: 'timetables',           field: 'subjectId',  kind: 'subject' },
    { coll: 'assessments',          field: 'subjectId',  kind: 'subject' },
    { coll: 'assessmentpapers',     field: 'subjectId',  kind: 'subject' },
    { coll: 'assessmentpapers',     field: 'gradeId',    kind: 'grade' },
    { coll: 'assessmentstructures', field: 'subjectId',  kind: 'subject' },
    { coll: 'assessmentstructures', field: 'gradeId',    kind: 'grade' },
    { coll: 'subjectrequirements',  field: 'subjectId',  kind: 'subject' },
    { coll: 'subjectrequirements',  field: 'gradeId',    kind: 'grade' },
    { coll: 'subjectlines',         field: 'gradeId',    kind: 'grade' },
    { coll: 'examtimetables',       field: 'subjectId',  kind: 'subject' },
    { coll: 'examtimetables',       field: 'gradeId',    kind: 'grade' },
    { coll: 'pastpapers',           field: 'subjectId',  kind: 'subject' },
    { coll: 'pastpapers',           field: 'gradeId',    kind: 'grade' },
    { coll: 'subjectweightings',    field: 'subjectId',  kind: 'subject' },
    { coll: 'subjectweightings',    field: 'gradeId',    kind: 'grade' },
    { coll: 'remedialtrackings',    field: 'subjectId',  kind: 'subject' },
  ];

  let totalStale = 0;
  for (const spec of collectionsToScan) {
    const exists = await db.listCollections({ name: spec.coll }).hasNext();
    if (!exists) continue;
    const docs = await db
      .collection(spec.coll)
      .find({ [spec.field]: { $type: 'objectId' } })
      .project({ _id: 1, [spec.field]: 1 })
      .toArray();
    if (docs.length === 0) continue;

    const fkIds = docs.map((d) => d[spec.field]);
    const academicColl = spec.kind === 'subject' ? 'subjects' : 'grades';
    const validAcademic = await db
      .collection(academicColl)
      .find({ _id: { $in: fkIds } })
      .project({ _id: 1 })
      .toArray();
    const validAcademicSet = new Set(validAcademic.map((r) => String(r._id)));

    const stale = fkIds.filter((id) => !validAcademicSet.has(String(id)));
    if (stale.length > 0) {
      const matchedAsCurriculum = await db
        .collection('curriculumnodes')
        .find({ _id: { $in: stale } })
        .project({ _id: 1 })
        .toArray();
      console.log(
        `  ⚠️  ${spec.coll}.${spec.field}: ${stale.length} stale FK(s)` +
        ` (${matchedAsCurriculum.length} resolve as CurriculumNode IDs)`,
      );
      totalStale += stale.length;
    }
  }

  if (totalStale === 0) {
    console.log('  ✅ No stale FKs detected — sweep cleaned everything up.');
  } else {
    console.log(`\n  Total stale FKs remaining: ${totalStale}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
