import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { SessionService } from './service-sessions.js';
import { VideoService } from './service-videos.js';
import { AnalyticsService } from './service-analytics.js';

export class ClassroomController {
  // ─── Sessions ─────────────────────────────────────────────────────────────

  static async createSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await SessionService.createSession(user.schoolId!, user.id, req.body);
    res.status(201).json(apiResponse(true, session, 'Session created successfully'));
  }

  static async listUpcoming(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await SessionService.listUpcoming(user.schoolId!, user.id, user.role, {
      status: req.query.status as string | undefined,
      classId: req.query.classId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await SessionService.getSession(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, session));
  }

  static async updateSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await SessionService.updateSession(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, session, 'Session updated successfully'));
  }

  static async deleteSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await SessionService.cancelSession(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Session cancelled successfully'));
  }

  static async startSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await SessionService.startSession(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, session, 'Session started'));
  }

  static async endSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const session = await SessionService.endSession(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, session, 'Session ended'));
  }

  static async joinSession(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await SessionService.generateJoinToken(
      req.params.id as string,
      user.schoolId!,
      user.id,
    );
    // Record join if student role
    if (user.role === 'student') {
      await SessionService.recordJoin(req.params.id as string, user.schoolId!, user.id);
    }
    res.json(apiResponse(true, result));
  }

  static async getAttendance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const records = await SessionService.getAttendance(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, records));
  }

  static async createPoll(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const poll = await SessionService.createPoll(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(201).json(apiResponse(true, poll, 'Poll created'));
  }

  static async respondToPoll(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await SessionService.respondToPoll(
      req.params.id as string,
      req.params.pollId as string,
      user.schoolId!,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, result, 'Response recorded'));
  }

  // ─── Videos ───────────────────────────────────────────────────────────────

  static async listVideos(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await VideoService.listVideos(user.schoolId!, {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      classId: req.query.classId as string | undefined,
      published: req.query.published !== undefined ? req.query.published === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async createVideo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const video = await VideoService.createVideo(user.schoolId!, user.id, req.body);
    res.status(201).json(apiResponse(true, video, 'Video created successfully'));
  }

  static async getVideo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const video = await VideoService.getVideo(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, video));
  }

  static async updateVideo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const video = await VideoService.updateVideo(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, video, 'Video updated successfully'));
  }

  static async deleteVideo(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await VideoService.deleteVideo(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, undefined, 'Video deleted successfully'));
  }

  static async updateProgress(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const progress = await VideoService.updateProgress(
      req.params.id as string,
      user.id,
      user.schoolId!,
      req.body,
    );
    res.json(apiResponse(true, progress, 'Progress updated'));
  }

  static async getWatchHistory(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const history = await VideoService.getWatchHistory(
      req.params.studentId as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, history));
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  static async getTeacherStats(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const stats = await AnalyticsService.getTeacherStats(
      req.params.teacherId as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, stats));
  }

  static async getClassStats(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const stats = await AnalyticsService.getClassStats(
      req.params.classId as string,
      user.schoolId!,
    );
    res.json(apiResponse(true, stats));
  }
}
