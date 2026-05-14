import mongoose from 'mongoose';
import { BadRequestError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';

export interface TextbookActor extends AuthenticatedUser {
  schoolId: string;
}

export type TextbookScope = string | TextbookActor;

export function isTextbookActor(scope: TextbookScope): scope is TextbookActor {
  return typeof scope !== 'string';
}

export function canManageAllTextbooks(actor: TextbookActor): boolean {
  const role = actor.role as string;
  return role === 'super_admin'
    || role === 'school_admin'
    || role === 'principal'
    || role === 'hod'
    || actor.isSchoolPrincipal === true
    || actor.isHOD === true
    || actor.isStandaloneTeacher === true;
}

export function toObjectId(
  value: string | mongoose.Types.ObjectId,
  label: string,
): mongoose.Types.ObjectId {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (!mongoose.isValidObjectId(value)) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(value);
}

export function schoolIdFromScope(scope: TextbookScope): string {
  return isTextbookActor(scope) ? scope.schoolId : scope;
}

export function schoolObjectId(scope: TextbookScope): mongoose.Types.ObjectId {
  return toObjectId(schoolIdFromScope(scope), 'schoolId');
}

export function textbookVisibilityFilter(scope: TextbookScope): Record<string, unknown> {
  const schoolId = schoolObjectId(scope);
  const publishedNational = { schoolId: null, status: 'published' };
  const publishedSchool = { schoolId, status: 'published' };

  if (!isTextbookActor(scope)) {
    return {
      isDeleted: false,
      $or: [publishedNational, { schoolId }],
    };
  }

  if (scope.role === 'student') {
    return {
      isDeleted: false,
      $or: [publishedNational, publishedSchool],
    };
  }

  if (canManageAllTextbooks(scope)) {
    return {
      isDeleted: false,
      $or: [publishedNational, { schoolId }],
    };
  }

  if (scope.role === 'teacher') {
    return {
      isDeleted: false,
      $or: [
        publishedNational,
        publishedSchool,
        {
          schoolId,
          createdBy: toObjectId(scope.id, 'createdBy'),
        },
      ],
    };
  }

  return {
    isDeleted: false,
    $or: [publishedNational, publishedSchool],
  };
}

export function textbookMutationFilter(scope: TextbookActor): Record<string, unknown> {
  const schoolId = schoolObjectId(scope);
  // Standalone teachers are the de-facto admin of their single-teacher school —
  // they have no super-admin above them, so let them also manage national
  // (schoolId: null) textbooks that live in their environment.
  const schoolMatches: Record<string, unknown>[] = [{ schoolId }];
  if (scope.isStandaloneTeacher) {
    schoolMatches.push({ schoolId: null });
  }

  const filter: Record<string, unknown> = {
    isDeleted: false,
    $or: schoolMatches,
  };

  if (scope.role === 'teacher' && !canManageAllTextbooks(scope)) {
    filter.createdBy = toObjectId(scope.id, 'createdBy');
  }

  return filter;
}
