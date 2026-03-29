import { UserRole } from '../common/enums.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        schoolId?: string;
      };
      requestId?: string;
      schoolId?: string;
    }
  }
}

export {};
