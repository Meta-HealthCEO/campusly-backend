import { UserRole } from '../common/enums.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        schoolId?: string;
        isSchoolPrincipal?: boolean;
        isHOD?: boolean;
        departmentId?: string | null;
        isBursar?: boolean;
        isReceptionist?: boolean;
        isCounselor?: boolean;
      };
      requestId?: string;
      schoolId?: string;
    }
  }
}

export {};
