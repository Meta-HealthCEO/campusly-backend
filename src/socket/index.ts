import type { Server as HttpServer } from 'http';
import mongoose from 'mongoose';
import { Server as SocketServer, type Socket } from 'socket.io';
import { authenticateSocket, type SocketUser } from './auth.js';
import { User } from '../modules/Auth/model.js';
import { SessionService } from '../modules/Classroom/service-sessions.js';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';

let io: SocketServer | null = null;

const HOST_ROLES = new Set(['super_admin', 'school_admin', 'principal', 'teacher']);
const activePolls = new Map<
  string,
  { id: string; question: string; options: string[]; createdBy: string }
>();

type AccessibleSession = {
  settings?: {
    chatEnabled?: boolean;
  };
};

export function getIO(): SocketServer | null {
  return io;
}

function roomName(sessionId: string): string {
  return `session:${sessionId}`;
}

function emitSocketError(socket: Socket, message: string): void {
  socket.emit('classroom:error', { message });
}

function isHostRole(role: string): boolean {
  return HOST_ROLES.has(role);
}

async function assertSessionAccess(sessionId: string, user: SocketUser): Promise<AccessibleSession> {
  if (!user.schoolId) throw new Error('School context is required');
  return SessionService.getSession(sessionId, user.schoolId, user.id, user.role);
}

async function displayName(user: SocketUser): Promise<string> {
  const found = await User.findById(user.id).select('firstName lastName email').lean();
  if (!found) return user.email || user.role;
  const name = [found.firstName, found.lastName].filter(Boolean).join(' ').trim();
  return name || found.email || user.email || user.role;
}

async function persistChatMessage(
  sessionId: string,
  user: SocketUser,
  name: string,
  message: string,
): Promise<void> {
  try {
    const { SessionChatMessage } = await import('../modules/Classroom/model-chat.js');
    await SessionChatMessage.create({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(user.id),
      userName: name,
      userRole: user.role,
      message,
    });
  } catch (err: unknown) {
    logger.error({ err }, 'Failed to persist chat message');
  }
}

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: config.cors.origin, credentials: true },
    path: '/socket.io',
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    logger.info({ userId: user.id }, 'Socket connected');

    socket.on('session:join', async (data: { sessionId: string }) => {
      try {
        await assertSessionAccess(data.sessionId, user);
        const room = roomName(data.sessionId);
        await socket.join(room);
        socket.to(room).emit('participant:joined', {
          userId: user.id,
          role: user.role,
          name: await displayName(user),
        });

        const activePoll = activePolls.get(data.sessionId);
        if (activePoll) socket.emit('poll:started', activePoll);
      } catch (err: unknown) {
        logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Socket session join denied');
        emitSocketError(socket, 'You do not have access to this session');
      }
    });

    socket.on('session:leave', async (data: { sessionId: string }) => {
      const room = roomName(data.sessionId);
      socket.to(room).emit('participant:left', { userId: user.id });
      await socket.leave(room);
    });

    async function handleChat(data: { sessionId: string; text?: string; message?: string }) {
      const text = (data.text ?? data.message ?? '').trim();
      if (!text) return;

      try {
        const session = await assertSessionAccess(data.sessionId, user);
        if (session.settings?.chatEnabled === false) {
          emitSocketError(socket, 'Chat is disabled for this session');
          return;
        }
        const name = await displayName(user);
        const payload = {
          userId: user.id,
          name,
          text,
          timestamp: new Date().toISOString(),
        };
        io?.to(roomName(data.sessionId)).emit('chat:message', payload);
        await persistChatMessage(data.sessionId, user, name, text);
      } catch (err: unknown) {
        logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Socket chat denied');
        emitSocketError(socket, 'Your message could not be sent');
      }
    }

    socket.on('chat:send', handleChat);
    socket.on('chat:message', handleChat);

    socket.on('hand:raise', async (data: { sessionId: string }) => {
      try {
        await assertSessionAccess(data.sessionId, user);
        io?.to(roomName(data.sessionId)).emit('hand:raised', {
          userId: user.id,
          name: await displayName(user),
          raisedAt: new Date().toISOString(),
        });
      } catch (err: unknown) {
        logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Hand raise denied');
        emitSocketError(socket, 'Hand raise could not be sent');
      }
    });

    socket.on('hand:lower', async (data: { sessionId: string; userId?: string }) => {
      const targetUserId = data.userId ?? user.id;
      try {
        await assertSessionAccess(data.sessionId, user);
        if (targetUserId !== user.id && !isHostRole(user.role)) {
          emitSocketError(socket, 'Only the host can lower another participant hand');
          return;
        }
        io?.to(roomName(data.sessionId)).emit('hand:lowered', { userId: targetUserId });
      } catch (err: unknown) {
        logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Hand lower denied');
        emitSocketError(socket, 'Hand raise could not be cleared');
      }
    });

    socket.on(
      'poll:create',
      async (data: { sessionId: string; question?: string; options?: string[]; poll?: { question: string; options: string[] } }) => {
        try {
          if (!user.schoolId) throw new Error('School context is required');
          if (!isHostRole(user.role)) {
            emitSocketError(socket, 'Only the host can create polls');
            return;
          }

          const question = data.question ?? data.poll?.question ?? '';
          const options = data.options ?? data.poll?.options ?? [];
          const poll = await SessionService.createPoll(data.sessionId, user.schoolId, user.id, user.role, {
            question,
            options,
          });
          const payload = {
            id: String(poll._id),
            question: poll.question,
            options: poll.options,
            createdBy: user.id,
          };
          activePolls.set(data.sessionId, payload);
          io?.to(roomName(data.sessionId)).emit('poll:started', payload);
        } catch (err: unknown) {
          logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Poll create denied');
          emitSocketError(socket, 'Poll could not be created');
        }
      },
    );

    socket.on(
      'poll:respond',
      async (data: { sessionId: string; optionIndex?: number; pollId?: string; answer?: number }) => {
        try {
          if (!user.schoolId) throw new Error('School context is required');
          const activePoll = activePolls.get(data.sessionId);
          const pollId = data.pollId ?? activePoll?.id;
          const optionIndex = data.optionIndex ?? data.answer;
          if (!pollId || optionIndex === undefined) {
            emitSocketError(socket, 'No active poll is available');
            return;
          }

          await SessionService.respondToPoll(
            data.sessionId,
            pollId,
            user.schoolId,
            user.id,
            user.role,
            { answer: optionIndex },
          );
          io?.to(roomName(data.sessionId)).emit('poll:response', {
            userId: user.id,
            optionIndex,
          });
        } catch (err: unknown) {
          logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Poll response denied');
          emitSocketError(socket, 'Poll response could not be recorded');
        }
      },
    );

    socket.on('poll:end', async (data: { sessionId: string; pollId?: string }) => {
      try {
        await assertSessionAccess(data.sessionId, user);
        if (!isHostRole(user.role)) {
          emitSocketError(socket, 'Only the host can end polls');
          return;
        }
        const activePoll = activePolls.get(data.sessionId);
        activePolls.delete(data.sessionId);
        io?.to(roomName(data.sessionId)).emit('poll:ended', {
          pollId: data.pollId ?? activePoll?.id,
        });
      } catch (err: unknown) {
        logger.warn({ err, userId: user.id, sessionId: data.sessionId }, 'Poll end denied');
        emitSocketError(socket, 'Poll could not be ended');
      }
    });

    socket.on('disconnect', () => {
      logger.info({ userId: user.id }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}
