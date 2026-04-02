import { Request, Response } from 'express';
import { MeetingService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';

export class MeetingController {
  // ─── Admin: Meeting Days ────────────────────────────────────────────────────

  static async createMeetingDay(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const day = await MeetingService.createMeetingDay(schoolId, req.body);
    res.status(201).json(apiResponse(true, day, 'Meeting day created successfully'));
  }

  static async listMeetingDays(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const days = await MeetingService.listMeetingDays(schoolId);
    res.json(apiResponse(true, days, 'Meeting days retrieved successfully'));
  }

  // ─── Admin: Slot Generation ─────────────────────────────────────────────────

  static async generateSlots(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { meetingDayId, teacherId, teacherName } = req.body as {
      meetingDayId: string;
      teacherId: string;
      teacherName: string;
    };
    const slots = await MeetingService.generateSlots(
      schoolId,
      meetingDayId,
      teacherId,
      teacherName,
    );
    res.status(201).json(apiResponse(true, slots, 'Slots generated successfully'));
  }

  // ─── Admin: Stats ───────────────────────────────────────────────────────────

  static async getMeetingDayStats(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const stats = await MeetingService.getMeetingDayStats(
      schoolId,
      req.params.id as string,
    );
    res.json(apiResponse(true, stats, 'Meeting day stats retrieved successfully'));
  }

  // ─── Teacher: Slots ─────────────────────────────────────────────────────────

  static async getTeacherSlots(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const teacherId = getUser(req).id;
    const meetingDayId = req.query.meetingDayId as string | undefined;
    const slots = await MeetingService.getTeacherSlots(
      schoolId,
      teacherId,
      meetingDayId,
    );
    res.json(apiResponse(true, slots, 'Teacher slots retrieved successfully'));
  }

  static async markComplete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const teacherId = getUser(req).id;
    const notes = req.body.notes as string | undefined;
    const slot = await MeetingService.markComplete(
      teacherId,
      schoolId,
      req.params.id as string,
      notes,
    );
    res.json(apiResponse(true, slot, 'Meeting marked as completed'));
  }

  // ─── Parent: Available Slots ────────────────────────────────────────────────

  static async getAvailableSlots(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const meetingDayId = req.query.meetingDayId as string;
    const teacherId = req.query.teacherId as string | undefined;
    const slots = await MeetingService.getAvailableSlots(
      schoolId,
      meetingDayId,
      teacherId,
    );
    res.json(apiResponse(true, slots, 'Available slots retrieved successfully'));
  }

  // ─── Parent: Book Slot ──────────────────────────────────────────────────────

  static async bookSlot(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = getUser(req).id;
    const { studentId, studentName, parentName } = req.body as {
      studentId: string;
      studentName: string;
      parentName: string;
    };
    const slot = await MeetingService.bookSlot(
      userId,
      parentName ?? 'Parent',
      schoolId,
      req.params.id as string,
      studentId,
      studentName ?? 'Student',
    );
    res.json(apiResponse(true, slot, 'Slot booked successfully'));
  }

  // ─── Parent/Admin: Cancel Booking ───────────────────────────────────────────

  static async cancelBooking(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = getUser(req).id;
    const role = req.user!.role;
    const slot = await MeetingService.cancelBooking(
      userId,
      schoolId,
      req.params.id as string,
      role,
    );
    res.json(apiResponse(true, slot, 'Booking cancelled successfully'));
  }

  // ─── Parent: My Bookings ───────────────────────────────────────────────────

  static async getParentBookings(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const userId = getUser(req).id;
    const bookings = await MeetingService.getParentBookings(userId, schoolId);
    res.json(apiResponse(true, bookings, 'Parent bookings retrieved successfully'));
  }
}
