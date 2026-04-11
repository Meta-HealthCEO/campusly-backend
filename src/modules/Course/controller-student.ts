import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { CourseStudentService } from './service-student.js';
import { CourseProgressService } from './service-progress.js';
import { CourseCertificateService } from './service-certificates.js';
import { CourseCertificatePdfService } from './service-pdf.js';

export class CourseStudentController {
  // ─── Catalog ─────────────────────────────────────────────────────────────

  static async listCatalog(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const filters = {
      subjectId: req.query.subjectId as string | undefined,
      gradeLevel: req.query.gradeLevel
        ? Number(req.query.gradeLevel)
        : undefined,
      search: req.query.search as string | undefined,
    };
    const result = await CourseStudentService.listCatalog(user.schoolId!, filters);
    res.json(apiResponse(true, result));
  }

  static async getCatalogPreview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const course = await CourseStudentService.getCatalogPreview(
      req.params.slug as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, course));
  }

  // ─── My enrolments ───────────────────────────────────────────────────────

  static async listMyEnrolments(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await CourseStudentService.listMyEnrolments(
      user.id,
      user.schoolId!,
    );
    res.json(apiResponse(true, result));
  }

  static async getEnrolment(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await CourseStudentService.getEnrolment(
      req.params.id as string,
      user.id,
      user.schoolId!,
    );
    res.json(apiResponse(true, result));
  }

  // ─── Lesson player + progress ────────────────────────────────────────────

  static async getLesson(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await CourseStudentService.getLessonForStudent(
      req.params.id as string,
      req.params.lessonId as string,
      user.id,
      user.schoolId!,
    );
    res.json(apiResponse(true, result));
  }

  static async writeProgress(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await CourseProgressService.writeLessonProgress(
      req.params.id as string,
      req.params.lessonId as string,
      user.id,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, result));
  }

  static async submitQuizAttempt(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await CourseProgressService.submitQuizAttempt(
      req.params.id as string,
      req.params.lessonId as string,
      user.id,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, result));
  }

  // ─── Drop ────────────────────────────────────────────────────────────────

  static async dropEnrolment(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await CourseProgressService.dropEnrolment(
      req.params.id as string,
      user.id,
      user.schoolId!,
    );
    res.json(apiResponse(true, result, 'Enrolment dropped'));
  }

  // ─── Certificate download ────────────────────────────────────────────────

  static async getCertificate(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const cert = await CourseCertificateService.getCertificateForEnrolment(
      req.params.id as string,
      user.id,
      user.schoolId!,
    );
    const buffer = await CourseCertificatePdfService.render(cert);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${cert.verificationCode}.pdf"`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }
}
