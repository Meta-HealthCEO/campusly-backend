import { EgressClient, EncodedFileOutput, EncodedFileType } from 'livekit-server-sdk';
import { VirtualSession } from './model.js';
import { LessonNote } from './model-lesson-note.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

export class RecordingService {
  private static isEgressConfigured(): boolean {
    return Boolean(
      process.env.LIVEKIT_URL &&
        process.env.LIVEKIT_API_KEY &&
        process.env.LIVEKIT_API_SECRET &&
        process.env.LIVEKIT_EGRESS_ENABLED === 'true',
    );
  }

  private static getEgressClient(): EgressClient {
    return new EgressClient(
      process.env.LIVEKIT_URL ?? '',
      process.env.LIVEKIT_API_KEY ?? '',
      process.env.LIVEKIT_API_SECRET ?? '',
    );
  }

  static async startRecording(sessionId: string, schoolId: string): Promise<void> {
    if (!RecordingService.isEgressConfigured()) {
      throw new BadRequestError('Recording is not configured');
    }

    const session = await VirtualSession.findOne({
      _id: sessionId,
      schoolId,
      isDeleted: false,
    });
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.status !== 'live') {
      throw new BadRequestError('Session must be live to record');
    }

    if (session.isRecording) {
      throw new BadRequestError('Already recording');
    }

    const roomName = `session_${String(session._id)}`;
    const output = new EncodedFileOutput({ fileType: EncodedFileType.MP4 });

    const client = RecordingService.getEgressClient();
    const egress = await client.startRoomCompositeEgress(roomName, output);

    session.egressId = egress.egressId;
    session.isRecording = true;
    await session.save();

    logger.info(
      `[RecordingService] Started recording for session ${sessionId} (egress ${egress.egressId})`,
    );
  }

  static async stopRecording(sessionId: string, schoolId: string): Promise<void> {
    const session = await VirtualSession.findOne({
      _id: sessionId,
      schoolId,
      isDeleted: false,
    });
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (!session.isRecording || !session.egressId) {
      throw new BadRequestError('Not recording');
    }

    const client = RecordingService.getEgressClient();
    await client.stopEgress(session.egressId);

    session.isRecording = false;
    await session.save();

    logger.info(`[RecordingService] Stopped recording for session ${sessionId}`);
  }

  static async handleEgressWebhook(egressId: string, recordingUrl: string): Promise<void> {
    const session = await VirtualSession.findOne({ egressId });
    if (!session) {
      logger.warn(`[RecordingService] No session found for egressId ${egressId}`);
      return;
    }

    session.recordingUrl = recordingUrl;
    session.isRecorded = true;
    session.isRecording = false;
    await session.save();

    const { addLessonNotesJob } = await import('../../jobs/lesson-notes.job.js');
    await addLessonNotesJob({
      sessionId: String(session._id),
      schoolId: String(session.schoolId),
      teacherId: String(session.teacherId),
      classId: String(session.classId),
      subjectId: String(session.subjectId),
      recordingUrl,
    });

    logger.info(`[RecordingService] Queued lesson notes job for session ${String(session._id)}`);
  }

  static async getLessonNote(sessionId: string, schoolId: string): Promise<unknown> {
    const note = await LessonNote.findOne({ sessionId, schoolId }).lean();
    if (!note) {
      throw new NotFoundError('Lesson note not found');
    }
    return note;
  }

  static async getClassLessonNotes(classId: string, schoolId: string): Promise<unknown[]> {
    return LessonNote.find({ classId, schoolId, status: 'completed' })
      .sort({ createdAt: -1 })
      .select('-transcript')
      .lean();
  }

  static async retryLessonNotes(sessionId: string, schoolId: string): Promise<void> {
    const session = await VirtualSession.findOne({
      _id: sessionId,
      schoolId,
      isDeleted: false,
    });
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (!session.recordingUrl) {
      throw new BadRequestError('No recording to process');
    }

    await LessonNote.deleteOne({ sessionId, status: 'failed' });

    const { addLessonNotesJob } = await import('../../jobs/lesson-notes.job.js');
    await addLessonNotesJob({
      sessionId: String(session._id),
      schoolId: String(session.schoolId),
      teacherId: String(session.teacherId),
      classId: String(session.classId),
      subjectId: String(session.subjectId),
      recordingUrl: session.recordingUrl,
    });

    logger.info(`[RecordingService] Retry lesson notes job queued for session ${sessionId}`);
  }
}
