import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';
import { isCoreModule } from '../common/moduleConfig.js';
import { School } from '../modules/School/model.js';
import { redis } from '../config/redis.js';

const SCHOOL_CACHE_TTL = 300; // 5 minutes

async function getSchoolModules(schoolId: string): Promise<string[]> {
  const cacheKey = `school:modules:${schoolId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as string[];
  }

  const school = await School.findOne({ _id: schoolId, isDeleted: false, isActive: true })
    .select('modulesEnabled')
    .lean();

  if (!school) {
    return [];
  }

  const modules = school.modulesEnabled ?? [];
  await redis.set(cacheKey, JSON.stringify(modules), 'EX', SCHOOL_CACHE_TTL);

  return modules;
}

export function requireModule(moduleName: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Core modules always pass
    if (isCoreModule(moduleName)) {
      next();
      return;
    }

    if (!req.user) {
      throw new UnauthorizedError('Authentication is required');
    }

    // super_admin bypasses module checks
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    const schoolId = req.user.schoolId ?? (req.params.schoolId as string | undefined);

    if (!schoolId) {
      throw new ForbiddenError('School context is required to access this module.');
    }

    const enabledModules = await getSchoolModules(schoolId);

    if (!enabledModules.includes(moduleName)) {
      throw new ForbiddenError(
        'This module is not enabled for your school. Contact your administrator.',
      );
    }

    next();
  };
}
