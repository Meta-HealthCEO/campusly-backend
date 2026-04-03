import mongoose from 'mongoose';
import { VirtualSession, SessionAttendance, VideoLesson, VideoProgress } from './model.js';

// ─── Analytics ────────────────────────────────────────────────────────────────

export class AnalyticsService {
  static async getTeacherStats(teacherId: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const teacherOid = new mongoose.Types.ObjectId(teacherId);

    const [sessions, recordings, attendanceGroups] = await Promise.all([
      VirtualSession.find({
        teacherId: teacherOid,
        schoolId: soid,
        isDeleted: false,
      }).lean(),
      VideoLesson.countDocuments({
        teacherId: teacherOid,
        schoolId: soid,
        videoType: 'recording',
        isDeleted: false,
      }),
      SessionAttendance.aggregate([
        {
          $match: {
            schoolId: soid,
          },
        },
        {
          $lookup: {
            from: 'virtualsessions',
            localField: 'sessionId',
            foreignField: '_id',
            as: 'session',
          },
        },
        { $unwind: '$session' },
        {
          $match: {
            'session.teacherId': teacherOid,
            'session.isDeleted': false,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: '$sessionId',
            attendeeCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const sessionCount = sessions.length;
    const endedSessions = sessions.filter((s) => s.status === 'ended');

    const totalDurationMinutes = endedSessions.reduce((sum, s) => {
      const mins = Math.round(
        (s.scheduledEnd.getTime() - s.scheduledStart.getTime()) / 60000,
      );
      return sum + mins;
    }, 0);

    const avgAttendance =
      attendanceGroups.length > 0
        ? Math.round(
            attendanceGroups.reduce(
              (sum: number, g: { attendeeCount: number }) => sum + g.attendeeCount,
              0,
            ) / attendanceGroups.length,
          )
        : 0;

    return {
      sessionCount,
      endedSessionCount: endedSessions.length,
      totalDurationMinutes,
      avgAttendancePerSession: avgAttendance,
      recordingCount: recordings,
    };
  }

  static async getClassStats(classId: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const classOid = new mongoose.Types.ObjectId(classId);

    const [sessions, videosForClass] = await Promise.all([
      VirtualSession.find({
        classId: classOid,
        schoolId: soid,
        isDeleted: false,
        status: 'ended',
      }).lean(),
      VideoLesson.find({
        classId: classOid,
        schoolId: soid,
        isDeleted: false,
      }).lean(),
    ]);

    const sessionIds = sessions.map((s) => s._id);

    const [attendanceRecords, progressRecords] = await Promise.all([
      sessionIds.length > 0
        ? SessionAttendance.find({
            sessionId: { $in: sessionIds },
            schoolId: soid,
            isDeleted: false,
          }).lean()
        : Promise.resolve([]),
      videosForClass.length > 0
        ? VideoProgress.find({
            videoId: { $in: videosForClass.map((v) => v._id) },
            schoolId: soid,
            isDeleted: false,
          }).lean()
        : Promise.resolve([]),
    ]);

    const attendanceBySession = new Map<string, number>();
    for (const record of attendanceRecords) {
      const key = record.sessionId.toString();
      attendanceBySession.set(key, (attendanceBySession.get(key) ?? 0) + 1);
    }

    const avgParticipation =
      sessions.length > 0
        ? Math.round(
            Array.from(attendanceBySession.values()).reduce((a, b) => a + b, 0) / sessions.length,
          )
        : 0;

    const completedViews = progressRecords.filter((p) => p.isCompleted).length;
    const videoWatchRate =
      progressRecords.length > 0
        ? Math.round((completedViews / progressRecords.length) * 100)
        : 0;

    return {
      sessionsHeld: sessions.length,
      avgParticipationPerSession: avgParticipation,
      videoCount: videosForClass.length,
      videoProgressRecords: progressRecords.length,
      videoWatchRate,
    };
  }
}
