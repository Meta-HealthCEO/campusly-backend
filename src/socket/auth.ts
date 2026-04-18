import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface SocketUser {
  id: string;
  email: string;
  role: string;
  schoolId?: string;
}

export function authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      algorithms: ['HS256'],
    }) as SocketUser;
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
