import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { authenticateSocket, type SocketUser } from './auth.js';
import { logger } from '../common/logger.js';

let io: SocketServer | null = null;

export function getIO(): SocketServer | null {
  return io;
}

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true },
    path: '/socket.io',
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    logger.info({ userId: user.id }, 'Socket connected');

    // ─── Room management ──────────────────────────────────────────────
    socket.on('session:join', (data: { sessionId: string }) => {
      const room = `session:${data.sessionId}`;
      void socket.join(room);
      socket.to(room).emit('participant:joined', {
        userId: user.id,
        role: user.role,
      });
    });

    socket.on('session:leave', (data: { sessionId: string }) => {
      const room = `session:${data.sessionId}`;
      socket.to(room).emit('participant:left', { userId: user.id });
      void socket.leave(room);
    });

    // ─── Chat ─────────────────────────────────────────────────────────
    socket.on(
      'chat:message',
      async (data: { sessionId: string; message: string; userName: string }) => {
        const room = `session:${data.sessionId}`;
        const payload = {
          userId: user.id,
          userName: data.userName,
          userRole: user.role,
          message: data.message,
          timestamp: new Date().toISOString(),
        };
        io?.to(room).emit('chat:message', payload);

        // Persist asynchronously
        try {
          const { SessionChatMessage } = await import(
            '../modules/Classroom/model-chat.js'
          );
          await SessionChatMessage.create({
            sessionId: data.sessionId,
            userId: user.id,
            userName: data.userName,
            userRole: user.role,
            message: data.message,
          });
        } catch (err: unknown) {
          logger.error({ err }, 'Failed to persist chat message');
        }
      },
    );

    // ─── Hand raise ───────────────────────────────────────────────────
    socket.on('hand:raise', (data: { sessionId: string }) => {
      const room = `session:${data.sessionId}`;
      io?.to(room).emit('hand:raised', { userId: user.id });
    });

    socket.on('hand:lower', (data: { sessionId: string }) => {
      const room = `session:${data.sessionId}`;
      io?.to(room).emit('hand:lowered', { userId: user.id });
    });

    // ─── Polls ────────────────────────────────────────────────────────
    socket.on(
      'poll:create',
      (data: { sessionId: string; poll: { question: string; options: string[] } }) => {
        const room = `session:${data.sessionId}`;
        io?.to(room).emit('poll:created', data.poll);
      },
    );

    socket.on(
      'poll:respond',
      (data: { sessionId: string; pollId: string; answer: number }) => {
        const room = `session:${data.sessionId}`;
        io?.to(room).emit('poll:response', {
          pollId: data.pollId,
          userId: user.id,
          answer: data.answer,
        });
      },
    );

    socket.on('poll:end', (data: { sessionId: string; pollId: string }) => {
      const room = `session:${data.sessionId}`;
      io?.to(room).emit('poll:ended', { pollId: data.pollId });
    });

    // ─── Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
      logger.info({ userId: user.id }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}
