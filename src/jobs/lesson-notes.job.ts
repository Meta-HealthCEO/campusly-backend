import https from 'https';
import http from 'http';
import { Worker, Job } from 'bullmq';
import { logger } from '../common/logger.js';
import { redisConnection, lessonNotesQueue } from './queues.js';
import { AIService } from '../services/ai.service.js';
import { VirtualSession } from '../modules/Classroom/model.js';
import { SessionChatMessage } from '../modules/Classroom/model-chat.js';
import {
  LessonNote,
  type ILessonNotes,
  type ITranscriptSegment,
} from '../modules/Classroom/model-lesson-note.js';

export interface LessonNotesJobData {
  sessionId: string;
  schoolId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  recordingUrl: string;
}

interface RawTranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string | number;
}

const TRANSCRIPTION_PROMPT = `Transcribe this classroom lesson recording. Identify speakers:
- Label the main/dominant voice as "Teacher"
- Label other voices as "Student 1", "Student 2", etc.
- If you cannot distinguish individual students, use "Student"

Return a JSON array of segments:
[{ "speaker": "Teacher", "text": "...", "timestamp": "MM:SS" }, ...]

Include a timestamp marker every time the speaker changes or every 30 seconds.`;

const NOTES_PROMPT = `You are generating study notes from a classroom lesson for student revision. You have:

1. A transcript of the lesson
2. Chat messages from the session
3. Poll results

Generate structured notes in this exact JSON format:
{
  "summary": "3-5 paragraph overview of what was taught",
  "keyConcepts": ["concept 1", "concept 2"],
  "teacherQuestions": [{ "question": "...", "answer": "...", "timestamp": "MM:SS" }],
  "studentQuestions": [{ "student": "...", "question": "...", "response": "...", "source": "verbal" }],
  "pollResults": [{ "question": "...", "options": ["A", "B"], "responseCounts": [10, 5], "totalResponses": 15 }],
  "actionItems": ["task 1", "task 2"],
  "keyTerms": [{ "term": "...", "definition": "..." }]
}

Merge questions from the transcript (source: "verbal") and chat messages (source: "chat").
Be thorough — students will use these notes to revise for exams.`;

async function downloadAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

function timestampToSeconds(value: string | number): number {
  if (typeof value === 'number') return value;
  const parts = value.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    const [m, s] = parts;
    if (Number.isFinite(m) && Number.isFinite(s)) return m * 60 + s;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (Number.isFinite(h) && Number.isFinite(m) && Number.isFinite(s)) {
      return h * 3600 + m * 60 + s;
    }
  }
  return 0;
}

function normalizeTranscript(raw: unknown, fallbackText: string): ITranscriptSegment[] {
  if (Array.isArray(raw)) {
    return (raw as RawTranscriptSegment[]).map((seg) => ({
      speaker: typeof seg.speaker === 'string' ? seg.speaker : 'Unknown',
      text: typeof seg.text === 'string' ? seg.text : '',
      timestamp: timestampToSeconds(seg.timestamp ?? 0),
    }));
  }
  return [{ speaker: 'Teacher', text: fallbackText, timestamp: 0 }];
}

function safeJsonParse<T>(text: string): T | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

async function processLessonNotes(job: Job<LessonNotesJobData>): Promise<void> {
  const { sessionId, schoolId, teacherId, classId, subjectId, recordingUrl } = job.data;

  logger.info(`[LessonNotesJob] Starting lesson notes for session ${sessionId}`);

  const lessonNote = await LessonNote.create({
    sessionId,
    schoolId,
    teacherId,
    classId,
    subjectId,
    recordingUrl,
    transcript: [],
    notes: {
      summary: '',
      keyConcepts: [],
      teacherQuestions: [],
      studentQuestions: [],
      pollResults: [],
      actionItems: [],
      keyTerms: [],
    },
    status: 'processing',
  });

  await VirtualSession.updateOne(
    { _id: sessionId },
    { $set: { lessonNoteId: lessonNote._id } },
  );

  try {
    const audioBase64 = await downloadAsBase64(recordingUrl);

    const transcriptionResult = await AIService.generateAudioCompletion(
      TRANSCRIPTION_PROMPT,
      'Please transcribe the lesson recording.',
      audioBase64,
      'audio/mp4',
      { maxTokens: 16384, temperature: 0.1 },
    );

    const parsedTranscript = safeJsonParse<RawTranscriptSegment[]>(transcriptionResult.text);
    const transcript = normalizeTranscript(parsedTranscript, transcriptionResult.text);

    const chatMessages = await SessionChatMessage.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    const session = await VirtualSession.findById(sessionId).lean();
    const polls = session?.polls ?? [];

    const transcriptText = transcript
      .map((seg) => `[${seg.timestamp}s] ${seg.speaker}: ${seg.text}`)
      .join('\n');

    const chatText = chatMessages
      .map((m) => `${m.userName} (${m.userRole}): ${m.message}`)
      .join('\n');

    const pollsText = polls
      .map((p) => {
        const counts = p.options.map(
          (_opt, idx) => p.responses.filter((r) => r.answer === idx).length,
        );
        return `Poll: ${p.question}\nOptions: ${p.options.join(' | ')}\nCounts: ${counts.join(' | ')}\nTotal: ${p.responses.length}`;
      })
      .join('\n\n');

    const contextText = `## Transcript\n${transcriptText}\n\n## Chat Messages\n${chatText || '(none)'}\n\n## Poll Results\n${pollsText || '(none)'}`;

    const notesResult = await AIService.generateCompletion(
      NOTES_PROMPT +
        '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.',
      contextText,
      { maxTokens: 8192, temperature: 0.3 },
    );

    const notes = safeJsonParse<ILessonNotes>(notesResult);
    if (!notes) {
      throw new Error('Failed to parse notes JSON from AI response');
    }

    lessonNote.transcript = transcript;
    lessonNote.notes = {
      summary: notes.summary ?? '',
      keyConcepts: notes.keyConcepts ?? [],
      teacherQuestions: notes.teacherQuestions ?? [],
      studentQuestions: notes.studentQuestions ?? [],
      pollResults: notes.pollResults ?? [],
      actionItems: notes.actionItems ?? [],
      keyTerms: notes.keyTerms ?? [],
    };
    lessonNote.status = 'completed';
    await lessonNote.save();

    logger.info(`[LessonNotesJob] Completed lesson notes for session ${sessionId}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[LessonNotesJob] Failed for session ${sessionId}: ${message}`);
    lessonNote.status = 'failed';
    lessonNote.errorMessage = message;
    await lessonNote.save();
    throw err;
  }
}

export function createLessonNotesWorker(): Worker {
  const worker = new Worker<LessonNotesJobData>(
    'lesson-notes',
    processLessonNotes,
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  worker.on('completed', (job) => {
    logger.info(`[LessonNotesJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[LessonNotesJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function addLessonNotesJob(data: LessonNotesJobData): Promise<void> {
  await lessonNotesQueue.add('generate-notes', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30000 },
  });
}
