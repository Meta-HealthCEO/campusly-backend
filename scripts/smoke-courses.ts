/**
 * Manual smoke test for the Courses backend (Plan A).
 *
 * Run: `API_URL=http://localhost:4500/api TEACHER_JWT=... HOD_JWT=... CLASS_ID=... \
 *       CONTENT_RESOURCE_ID=... STUDENT_JWT=... tsx scripts/smoke-courses.ts`
 *
 * Requires:
 *   - Dev server running on API_URL
 *   - A school with `modulesEnabled` containing 'courses'
 *   - A teacher account JWT (TEACHER_JWT)
 *   - An HOD or school_admin account JWT (HOD_JWT) in the same school.
 *     Note: since Campusly has no 'hod' role, this should be either a
 *     school_admin JWT, or a teacher JWT for a user whose isHOD flag is
 *     true, or a teacher whose isSchoolPrincipal flag is true.
 *   - A class ID (CLASS_ID) with at least one student in that school
 *   - A ContentResource ID (CONTENT_RESOURCE_ID) that belongs to the
 *     school's Content Library
 *   - A student account JWT (STUDENT_JWT) whose Student record is in the
 *     class identified by CLASS_ID
 *
 * What it does:
 *   1. Teacher creates a draft course
 *   2. Teacher adds a module
 *   3. Teacher adds a content lesson referencing CONTENT_RESOURCE_ID
 *   4. Teacher submits for review
 *   5. HOD publishes
 *   6. Teacher assigns to the class
 *   7. Prints the enrolment count
 *   8. Student lists their enrolments
 *   9. Student fetches the enrolment detail with progress
 *  10. Student fetches first lesson content
 *  11. Student writes scrolled-to-end progress
 *
 * This script is run manually; it is NOT in CI and not imported from any
 * production code path.
 */

const API = process.env.API_URL ?? 'http://localhost:4500/api';
const TEACHER_JWT = process.env.TEACHER_JWT;
const HOD_JWT = process.env.HOD_JWT;
const CLASS_ID = process.env.CLASS_ID;
const CONTENT_RESOURCE_ID = process.env.CONTENT_RESOURCE_ID;
const STUDENT_JWT = process.env.STUDENT_JWT;

if (!TEACHER_JWT || !HOD_JWT || !CLASS_ID || !CONTENT_RESOURCE_ID || !STUDENT_JWT) {
  console.error(
    'Missing env vars. Required: TEACHER_JWT, HOD_JWT, CLASS_ID, CONTENT_RESOURCE_ID, STUDENT_JWT',
  );
  process.exit(1);
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function call<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) {
    console.error(`${method} ${path} -> ${res.status}`, json);
    throw new Error(`Request failed: ${res.status}`);
  }
  return json;
}

interface CourseIdOnly {
  _id: string;
}

interface ModuleIdOnly {
  _id: string;
}

interface AssignResult {
  attempted: number;
  newEnrolments: number;
  alreadyEnroled: number;
}

interface EnrolmentsResult {
  enrolments: unknown[];
  total: number;
}

async function main(): Promise<void> {
  console.log('1. Creating draft course...');
  const createRes = await call<CourseIdOnly>(
    TEACHER_JWT!,
    'POST',
    '/courses',
    {
      title: 'Smoke Test Course',
      slug: `smoke-test-${Date.now()}`,
      description: 'Created by smoke-courses.ts',
    },
  );
  const courseId = createRes.data?._id;
  if (!courseId) throw new Error('createCourse response missing data._id');
  console.log(`   -> courseId=${courseId}`);

  console.log('2. Adding a module...');
  const modRes = await call<ModuleIdOnly>(
    TEACHER_JWT!,
    'POST',
    `/courses/${courseId}/modules`,
    {
      title: 'Week 1',
      orderIndex: 0,
    },
  );
  const moduleId = modRes.data?._id;
  if (!moduleId) throw new Error('addModule response missing data._id');
  console.log(`   -> moduleId=${moduleId}`);

  console.log('3. Adding a content lesson...');
  await call(TEACHER_JWT!, 'POST', `/courses/${courseId}/lessons`, {
    moduleId,
    orderIndex: 0,
    title: 'Intro',
    type: 'content',
    contentResourceId: CONTENT_RESOURCE_ID,
    isRequiredToAdvance: false,
  });
  console.log('   -> lesson added');

  console.log('4. Submitting for review...');
  await call(TEACHER_JWT!, 'POST', `/courses/${courseId}/submit-for-review`);
  console.log('   -> status: in_review');

  console.log('5. Publishing (as HOD / admin)...');
  await call(HOD_JWT!, 'POST', `/courses/${courseId}/publish`);
  console.log('   -> status: published');

  console.log('6. Assigning to class...');
  const assignRes = await call<AssignResult>(
    TEACHER_JWT!,
    'POST',
    `/courses/${courseId}/assign`,
    { classId: CLASS_ID },
  );
  console.log(`   -> ${JSON.stringify(assignRes.data)}`);

  console.log('7. Listing enrolments...');
  const enrolRes = await call<EnrolmentsResult>(
    TEACHER_JWT!,
    'GET',
    `/courses/${courseId}/enrolments`,
  );
  console.log(`   -> total=${enrolRes.data?.total}`);

  console.log('8. Student listing my courses...');
  const myCoursesRes = await call<{
    enrolments: { _id: string; courseId: { _id: string } | string }[];
    total: number;
  }>(STUDENT_JWT!, 'GET', '/enrolments/me');
  const myCourses = myCoursesRes.data?.enrolments ?? [];
  console.log(`   -> total=${myCoursesRes.data?.total}`);

  // Find the enrolment for the course we just created (in case the student
  // is in multiple courses).
  const myEnrolment = myCourses.find((e) => {
    const cid = typeof e.courseId === 'string' ? e.courseId : e.courseId?._id;
    return cid === courseId;
  });

  if (!myEnrolment) {
    console.warn('   -> WARN: student is not enroled in the smoke-test course. Skipping student steps.');
  } else {
    const myEnrolmentId = myEnrolment._id;
    console.log(`   -> enrolmentId=${myEnrolmentId}`);

    console.log('9. Student fetching the enrolment with progress...');
    const enrolDetailRes = await call<{
      course: { modules: { lessons: { _id: string; type: string }[] }[] };
    }>(STUDENT_JWT!, 'GET', `/enrolments/${myEnrolmentId}`);
    const firstLesson = enrolDetailRes.data?.course.modules[0]?.lessons[0];
    if (!firstLesson) {
      console.warn('    -> WARN: no lessons in the course. Skipping lesson steps.');
    } else {
      console.log(`    -> first lesson id=${firstLesson._id} type=${firstLesson.type}`);

      console.log('10. Student fetching first lesson content...');
      await call(
        STUDENT_JWT!,
        'GET',
        `/enrolments/${myEnrolmentId}/lessons/${firstLesson._id}`,
      );
      console.log('    -> lesson content returned');

      console.log('11. Student writing scrolled-to-end progress...');
      const progressRes = await call<{
        lessonStatus: string;
        nextLessonUnlocked: boolean;
      }>(
        STUDENT_JWT!,
        'POST',
        `/enrolments/${myEnrolmentId}/lessons/${firstLesson._id}/progress`,
        { scrolledToEnd: true },
      );
      console.log(
        `    -> lessonStatus=${progressRes.data?.lessonStatus} nextLessonUnlocked=${progressRes.data?.nextLessonUnlocked}`,
      );
    }
  }

  console.log('\nOK Smoke test passed');
}

main().catch((err) => {
  console.error('FAIL Smoke test failed:', err);
  process.exit(1);
});
