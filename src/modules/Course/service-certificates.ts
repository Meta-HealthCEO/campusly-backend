import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import {
  Course,
  Enrolment,
  CourseLesson,
  QuizAttempt,
  Certificate,
  type IEnrolment,
} from './model.js';
import { Student } from '../Student/model.js';
import { School } from '../School/model.js';
import {
  NotFoundError,
  BadRequestError,
} from '../../common/errors.js';

// ─── Verification code generation ────────────────────────────────────────

const VERIFY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const VERIFY_CODE_LENGTH = 12;

/**
 * Generate a 12-character verification code using a confusable-free
 * alphabet (no 0/O/1/I). This is the string that appears on the PDF and
 * in the public verify URL. ~32^12 ≈ 10^18 combinations — effectively
 * unguessable at MVP scale.
 */
function generateVerificationCode(): string {
  const bytes = randomBytes(VERIFY_CODE_LENGTH);
  let out = '';
  for (let i = 0; i < VERIFY_CODE_LENGTH; i++) {
    out += VERIFY_ALPHABET[bytes[i]! % VERIFY_ALPHABET.length];
  }
  return out;
}

export class CourseCertificateService {
  /**
   * Issue a certificate for an enrolment if the student is eligible and a
   * certificate does not already exist. Idempotent — safe to call on
   * every transition to `completed`.
   *
   * Eligibility:
   *   1. course.certificateEnabled === true
   *   2. Student meets the course pass mark. Pass mark is computed as
   *      the average of best-per-lesson quiz percentages across all
   *      graded quiz lessons, with missing attempts contributing 0.
   *      Courses with zero graded quiz lessons auto-pass this check.
   *   3. No Certificate row exists for this enrolment.
   *
   * Returns the cert (new or existing) or null if not eligible.
   */
  static async issueIfEligible(
    enrolment: IEnrolment,
    schoolId: mongoose.Types.ObjectId,
  ): Promise<unknown | null> {
    // Idempotency
    const existing = await Certificate.findOne({
      enrolmentId: enrolment._id,
      schoolId,
      isDeleted: false,
    });
    if (existing) return existing;

    const course = await Course.findOne({
      _id: enrolment.courseId,
      schoolId,
      isDeleted: false,
    })
      .select('title passMarkPercent certificateEnabled publishedBy')
      .lean();
    if (!course) return null;
    if (!course.certificateEnabled) return null;

    // Compute pass mark across graded quiz lessons.
    const gradedQuizLessons = await CourseLesson.find({
      courseId: enrolment.courseId,
      schoolId,
      isDeleted: false,
      type: 'quiz',
      isGraded: true,
    })
      .select('_id')
      .lean();

    if (gradedQuizLessons.length > 0) {
      const lessonIds = gradedQuizLessons.map((l) => l._id);
      const bestScores = await QuizAttempt.aggregate<{
        lessonId: mongoose.Types.ObjectId;
        bestPercent: number;
      }>([
        {
          $match: {
            enrolmentId: enrolment._id,
            schoolId,
            isDeleted: false,
            lessonId: { $in: lessonIds },
          },
        },
        {
          $group: {
            _id: '$lessonId',
            bestPercent: { $max: '$percent' },
          },
        },
        {
          $project: {
            _id: 0,
            lessonId: '$_id',
            bestPercent: 1,
          },
        },
      ]);

      // Always divide by gradedQuizLessons.length (not bestScores.length)
      // so that a student who skipped a quiz gets a 0 contribution from
      // the missing lesson rather than having their average computed
      // only on the quizzes they DID attempt. This is the stricter
      // interpretation and matches Plan B's gating: you can't get a cert
      // by completing lessons 1-3 and skipping the quiz at lesson 4.
      const totalScore = bestScores.reduce((sum, s) => sum + s.bestPercent, 0);
      const avgScore = totalScore / gradedQuizLessons.length;
      if (avgScore < course.passMarkPercent) return null;
    }
    // else: no graded quizzes → eligibility depends only on completion,
    // which the caller already verified.

    // Snapshot identity fields.
    const student = await Student.findOne({
      _id: enrolment.studentId,
      schoolId,
      isDeleted: false,
    })
      .populate({ path: 'userId', select: 'firstName lastName' })
      .lean();
    if (!student) return null;

    const userObj = student.userId as unknown as {
      firstName?: string;
      lastName?: string;
    };
    const studentName = `${userObj?.firstName ?? ''} ${userObj?.lastName ?? ''}`.trim()
      || 'Student';

    const school = await School.findOne({
      _id: schoolId,
      isDeleted: false,
    })
      .select('name')
      .lean();
    const schoolName = school?.name ?? 'School';

    // issuedBy: prefer the course's publisher (who approved the course).
    // Fall back to the enroler if publishedBy is somehow null.
    const issuedBy = (course.publishedBy as mongoose.Types.ObjectId | null)
      ?? enrolment.enrolledBy;

    // Unique verification code with collision retry.
    let verificationCode = generateVerificationCode();
    for (let attempt = 0; attempt < 3; attempt++) {
      const collision = await Certificate.findOne({ verificationCode })
        .select('_id')
        .lean();
      if (!collision) break;
      verificationCode = generateVerificationCode();
    }

    const certificate = await Certificate.create({
      schoolId,
      isDeleted: false,
      enrolmentId: enrolment._id,
      studentId: enrolment.studentId,
      courseId: enrolment.courseId,
      studentName,
      courseName: course.title,
      schoolName,
      issuedAt: new Date(),
      issuedBy,
      pdfUrl: '',
      verificationCode,
    });

    // Link back to the enrolment.
    enrolment.certificateId = certificate._id;
    await enrolment.save();

    return certificate;
  }

  /**
   * Fetch the certificate for a student's enrolment. The calling user
   * must be the enrolled student. Returns the Certificate row; the
   * caller is responsible for generating the PDF Buffer.
   */
  static async getCertificateForEnrolment(
    enrolmentId: string,
    userId: string,
    schoolId: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(enrolmentId)) {
      throw new NotFoundError('Certificate not found');
    }
    const soid = new mongoose.Types.ObjectId(schoolId);
    const enrolment = await Enrolment.findOne({
      _id: new mongoose.Types.ObjectId(enrolmentId),
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!enrolment) throw new NotFoundError('Enrolment not found');

    // Ownership
    const student = await Student.findOne({
      _id: enrolment.studentId,
      schoolId: soid,
      isDeleted: false,
    })
      .select('userId')
      .lean();
    if (!student || student.userId.toString() !== userId) {
      throw new NotFoundError('Certificate not found');
    }

    const cert = await Certificate.findOne({
      enrolmentId: enrolment._id,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!cert) {
      throw new BadRequestError(
        'No certificate available. The course is either incomplete, has certificates disabled, or you did not meet the pass mark.',
      );
    }
    return cert;
  }

  /**
   * PUBLIC — verify a certificate by its verification code. Returns the
   * four snapshotted identity fields on success or { valid: false } on
   * unknown/invalid code. This is the ONLY un-authenticated endpoint in
   * the Course module.
   *
   * Deliberately leaks studentName, courseName, schoolName, issuedAt.
   * That's what a certificate IS — anyone holding the code can confirm
   * these four things are real.
   */
  static async verifyCertificate(code: string): Promise<
    | { valid: true; studentName: string; courseName: string; schoolName: string; issuedAt: Date }
    | { valid: false }
  > {
    // Cheap input guard — don't let obviously bogus codes hit the DB.
    if (!code || code.length !== VERIFY_CODE_LENGTH) {
      return { valid: false };
    }
    const cert = await Certificate.findOne({
      verificationCode: code,
      isDeleted: false,
    })
      .select('studentName courseName schoolName issuedAt')
      .lean();
    if (!cert) return { valid: false };
    return {
      valid: true,
      studentName: cert.studentName,
      courseName: cert.courseName,
      schoolName: cert.schoolName,
      issuedAt: cert.issuedAt,
    };
  }
}
