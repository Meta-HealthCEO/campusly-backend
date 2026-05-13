import { NoticeBoardPost } from './model.js';
import type { CreatePostInput, UpdatePostInput } from './validation.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { Class, Timetable } from '../Academic/model.js';
import { AcademicService } from '../Academic/service.js';

interface ListQuery {
  page?: number;
  limit?: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function isAdminRole(userRole: string) {
  return userRole === 'school_admin' || userRole === 'super_admin';
}

async function getTeacherClassIds(userId: string, schoolId: string): Promise<string[]> {
  const [homeroomClassIds, subjectClassIds] = await Promise.all([
    Class.distinct('_id', { schoolId, teacherId: userId, isDeleted: false }),
    Timetable.distinct('classId', { schoolId, teacherId: userId, isDeleted: false }),
  ]);
  return [...new Set([...homeroomClassIds, ...subjectClassIds].map((id) => id.toString()))];
}

async function assertCanUseScope(
  userId: string,
  userRole: string,
  schoolId: string,
  scope: string,
  scopeId: string,
  action: 'read' | 'write',
) {
  if (isAdminRole(userRole)) return;
  if (scope === 'school' && action === 'read') return;

  if (userRole === 'parent') {
    const parent = await Parent.findOne({ userId, schoolId, isDeleted: false }).lean();
    if (!parent) throw new ForbiddenError('Notice board is not available for this parent');

    const children = await Student.find({
      _id: { $in: parent.childrenIds },
      schoolId,
      isDeleted: false,
    }).select('classId gradeId').lean();

    const classIds = new Set(children.map((student) => student.classId.toString()));
    const gradeIds = new Set(children.map((student) => student.gradeId.toString()));
    if (
      (scope === 'class' && classIds.has(scopeId))
      || (scope === 'grade' && gradeIds.has(scopeId))
    ) return;

    throw new ForbiddenError('You can only view notice boards linked to your children');
  }

  if (userRole === 'student') {
    const student = await Student.findOne({ userId, schoolId, isDeleted: false })
      .select('classId gradeId')
      .lean();
    if (!student) throw new ForbiddenError('Notice board is not available for this learner');
    if (
      (scope === 'class' && student.classId.toString() === scopeId)
      || (scope === 'grade' && student.gradeId.toString() === scopeId)
    ) return;

    throw new ForbiddenError('You can only view notice boards linked to your class or grade');
  }

  if (userRole === 'teacher') {
    if (scope !== 'class') {
      throw new ForbiddenError('Teachers can only post to class notice boards');
    }

    const canAccess = await AcademicService.teacherCanAccessClass(userId, scopeId, schoolId);
    if (!canAccess) {
      throw new ForbiddenError('You can only use notice boards for classes you teach');
    }
    return;
  }

  throw new ForbiddenError('Notice board scope is not available for your role');
}

export class NoticeBoardService {
  static async createPost(
    userId: string,
    userName: string,
    userRole: string,
    schoolId: string,
    input: CreatePostInput,
  ) {
    await assertCanUseScope(userId, userRole, schoolId, input.scope, input.scopeId, 'write');
    const post = new NoticeBoardPost({
      schoolId,
      scope: input.scope,
      scopeId: input.scopeId,
      authorId: userId,
      authorName: userName,
      authorRole: userRole,
      title: input.title,
      content: input.content,
      pinned: input.pinned ?? false,
      attachments: input.attachments ?? [],
    });
    return post.save();
  }

  static async listPosts(
    schoolId: string,
    scope: string,
    scopeId: string,
    query: ListQuery,
    viewer?: { userId: string; userRole: string },
  ) {
    if (viewer) {
      await assertCanUseScope(viewer.userId, viewer.userRole, schoolId, scope, scopeId, 'read');
    }
    const { page, limit, skip } = getPagination(query);
    const filter = { schoolId, scope, scopeId, isDeleted: false };

    const [data, total] = await Promise.all([
      NoticeBoardPost.find(filter)
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NoticeBoardPost.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async updatePost(postId: string, userId: string, userRole: string, schoolId: string, input: UpdatePostInput) {
    const post = await NoticeBoardPost.findOne({ _id: postId, schoolId, isDeleted: false });
    if (!post) throw new NotFoundError('Post not found');

    const isAuthor = post.authorId.toString() === userId;
    const isAdmin = isAdminRole(userRole);
    if (!isAuthor && !isAdmin) throw new ForbiddenError('You can only edit your own posts');

    const updated = await NoticeBoardPost.findOneAndUpdate(
      { _id: postId, schoolId, isDeleted: false },
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundError('Post not found');
    return updated;
  }

  static async deletePost(postId: string, userId: string, userRole: string, schoolId: string) {
    const post = await NoticeBoardPost.findOne({ _id: postId, schoolId, isDeleted: false });
    if (!post) throw new NotFoundError('Post not found');

    const isAuthor = post.authorId.toString() === userId;
    const isAdmin = isAdminRole(userRole);
    if (!isAuthor && !isAdmin) throw new ForbiddenError('You can only delete your own posts');

    post.isDeleted = true;
    return post.save();
  }

  static async togglePin(postId: string, userId: string, userRole: string, schoolId: string) {
    const post = await NoticeBoardPost.findOne({ _id: postId, schoolId, isDeleted: false });
    if (!post) throw new NotFoundError('Post not found');

    const isAuthor = post.authorId.toString() === userId;
    const isAdmin = isAdminRole(userRole);
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('You can only pin your own posts');
    }

    post.pinned = !post.pinned;
    return post.save();
  }

  static async getPostsByUser(userId: string, userRole: string, schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);

    // Determine which scope filters to use based on role
    const scopeFilters: Array<{ scope: string; scopeId: string }> = [];

    if (userRole === 'school_admin' || userRole === 'super_admin') {
      // Admins see all posts for the school
      const filter = { schoolId, isDeleted: false };
      const [data, total] = await Promise.all([
        NoticeBoardPost.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        NoticeBoardPost.countDocuments(filter),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    if (userRole === 'teacher') {
      // Teachers see school-wide + their class boards
      const classIds = await getTeacherClassIds(userId, schoolId);
      scopeFilters.push(
        { scope: 'school', scopeId: schoolId },
        ...classIds.map((id) => ({ scope: 'class', scopeId: id })),
      );
      const filter = { schoolId, isDeleted: false, $or: scopeFilters };
      const [data, total] = await Promise.all([
        NoticeBoardPost.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        NoticeBoardPost.countDocuments(filter),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    if (userRole === 'parent') {
      // Parents see school-wide + their children's class + grade boards
      const parent = await Parent.findOne({ userId, schoolId, isDeleted: false }).lean();
      if (parent && parent.childrenIds.length > 0) {
        const children = await Student.find({
          _id: { $in: parent.childrenIds },
          schoolId,
          isDeleted: false,
        }).select('classId gradeId').lean();

        const classIds = [...new Set(children.map((c) => c.classId.toString()))];
        const gradeIds = [...new Set(children.map((c) => c.gradeId.toString()))];

        const orClauses = [
          { scope: 'school' as const, scopeId: schoolId },
          ...classIds.map((id) => ({ scope: 'class' as const, scopeId: id })),
          ...gradeIds.map((id) => ({ scope: 'grade' as const, scopeId: id })),
        ];

        const filter = { schoolId, isDeleted: false, $or: orClauses };
        const [data, total] = await Promise.all([
          NoticeBoardPost.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
          NoticeBoardPost.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
      }
    }

    // Fallback: school-wide posts only
    const filter = { schoolId, scope: 'school', isDeleted: false };
    const [data, total] = await Promise.all([
      NoticeBoardPost.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      NoticeBoardPost.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
