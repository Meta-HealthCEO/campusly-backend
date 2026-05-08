import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { resolveAcademicAncestor } from './service-academic-bridge.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateNodeInput, UpdateNodeInput, BulkImportInput, NodeQueryInput } from './validation.js';

export class NodesService {
  static async listNodes(schoolId: string, filters: NodeQueryInput) {
    const query: Record<string, unknown> = { isDeleted: false };
    const soid = new mongoose.Types.ObjectId(schoolId);

    if (filters.frameworkId) {
      query.frameworkId = new mongoose.Types.ObjectId(filters.frameworkId);
    }
    if (filters.parentId !== undefined) {
      const pid = filters.parentId;
      query.parentId = (pid && pid !== 'null')
        ? new mongoose.Types.ObjectId(pid)
        : null;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    // Academic Subject / Grade ID filtering — resolve to curriculum-node
    // ancestor + descendant ID sets, then constrain by intersection.
    const subjectIds = await resolveAcademicAncestor(filters.subjectId, 'subject', soid);
    const gradeIds = await resolveAcademicAncestor(filters.gradeId, 'grade', soid);
    if (subjectIds === null || gradeIds === null) {
      return { nodes: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 50 };
    }
    const idConstraints: mongoose.Types.ObjectId[][] = [];
    if (subjectIds) idConstraints.push(subjectIds);
    if (gradeIds) idConstraints.push(gradeIds);
    if (idConstraints.length === 1) {
      query._id = { $in: idConstraints[0] };
    } else if (idConstraints.length === 2) {
      const subjectSet = new Set(idConstraints[0].map((o: mongoose.Types.ObjectId) => o.toString()));
      const intersection = idConstraints[1].filter(
        (o: mongoose.Types.ObjectId) => subjectSet.has(o.toString()),
      );
      if (intersection.length === 0) {
        return { nodes: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 50 };
      }
      query._id = { $in: intersection };
    }

    query.$or = [{ schoolId: null }, { schoolId: soid }];

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [nodes, total] = await Promise.all([
      CurriculumNode.find(query)
        .sort({ order: 1, title: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CurriculumNode.countDocuments(query),
    ]);

    return { nodes, total, page: filters.page ?? 1, limit };
  }

  static async getNode(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const node = await CurriculumNode.findOne({
      _id: oid,
      $or: [{ schoolId: null }, { schoolId: soid }],
      isDeleted: false,
    }).lean();
    if (!node) throw new NotFoundError('Curriculum node not found');

    const children = await CurriculumNode.find({
      parentId: oid,
      isDeleted: false,
      $or: [{ schoolId: null }, { schoolId: soid }],
    })
      .sort({ order: 1, title: 1 })
      .lean();

    return { ...node, children };
  }

  static async getSubtree(id: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const root = await CurriculumNode.findOne({
      _id: oid,
      $or: [{ schoolId: null }, { schoolId: soid }],
      isDeleted: false,
    }).lean();
    if (!root) throw new NotFoundError('Curriculum node not found');

    const descendants = await CurriculumNode.aggregate([
      {
        $match: {
          _id: oid,
          isDeleted: false,
        },
      },
      {
        $graphLookup: {
          from: 'curriculumnodes',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          restrictSearchWithMatch: {
            isDeleted: false,
            $or: [{ schoolId: null }, { schoolId: soid }],
          },
        },
      },
      { $project: { descendants: 1 } },
    ]);

    const allDescendants = descendants[0]?.descendants ?? [];
    return { root, descendants: allDescendants };
  }

  static async createNode(schoolId: string | null, data: CreateNodeInput) {
    const existing = await CurriculumNode.findOne({
      code: data.code,
      isDeleted: false,
    }).lean();
    if (existing) {
      throw new ConflictError(`A node with code "${data.code}" already exists`);
    }

    if (data.parentId) {
      const parent = await CurriculumNode.findOne({
        _id: new mongoose.Types.ObjectId(data.parentId),
        isDeleted: false,
      }).lean();
      if (!parent) throw new NotFoundError('Parent node not found');
    }

    const node = await CurriculumNode.create({
      frameworkId: new mongoose.Types.ObjectId(data.frameworkId),
      type: data.type,
      parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null,
      title: data.title,
      code: data.code,
      description: data.description,
      metadata: data.metadata,
      order: data.order,
      schoolId: schoolId ? new mongoose.Types.ObjectId(schoolId) : null,
    });
    return node.toObject();
  }

  static async updateNode(id: string, schoolId: string, data: UpdateNodeInput) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const node = await CurriculumNode.findOne({
      _id: oid,
      $or: [{ schoolId: null }, { schoolId: soid }],
      isDeleted: false,
    }).lean();
    if (!node) throw new NotFoundError('Curriculum node not found');

    if (data.code && data.code !== node.code) {
      const dup = await CurriculumNode.findOne({
        code: data.code,
        _id: { $ne: oid },
        isDeleted: false,
      }).lean();
      if (dup) throw new ConflictError(`A node with code "${data.code}" already exists`);
    }

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.code !== undefined) update.code = data.code;
    if (data.description !== undefined) update.description = data.description;
    if (data.order !== undefined) update.order = data.order;
    if (data.parentId !== undefined) {
      update.parentId = data.parentId
        ? new mongoose.Types.ObjectId(data.parentId)
        : null;
    }
    if (data.metadata) {
      for (const [key, val] of Object.entries(data.metadata)) {
        if (val !== undefined) update[`metadata.${key}`] = val;
      }
    }

    const updated = await CurriculumNode.findOneAndUpdate(
      { _id: oid, isDeleted: false },
      { $set: update },
      { new: true },
    ).lean();
    return updated;
  }

  static async deleteNode(id: string, schoolId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const node = await CurriculumNode.findOne({
      _id: oid,
      $or: [{ schoolId: null }, { schoolId: soid }],
      isDeleted: false,
    }).lean();
    if (!node) throw new NotFoundError('Curriculum node not found');

    const result = await CurriculumNode.aggregate([
      { $match: { _id: oid } },
      {
        $graphLookup: {
          from: 'curriculumnodes',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants',
          restrictSearchWithMatch: {
            isDeleted: false,
            $or: [{ schoolId: null }, { schoolId: soid }],
          },
        },
      },
      { $project: { descendantIds: '$descendants._id' } },
    ]);

    const descendantIds: mongoose.Types.ObjectId[] = result[0]?.descendantIds ?? [];
    const allIds = [oid, ...descendantIds];

    await CurriculumNode.updateMany(
      { _id: { $in: allIds } },
      { $set: { isDeleted: true } },
    );

    return { deleted: allIds.length };
  }

  static async bulkImport(schoolId: string | null, data: BulkImportInput) {
    const frameworkOid = new mongoose.Types.ObjectId(data.frameworkId);
    const codeToId = new Map<string, mongoose.Types.ObjectId>();

    const existingNodes = await CurriculumNode.find({
      frameworkId: frameworkOid,
      isDeleted: false,
    })
      .select('code _id')
      .lean();
    for (const n of existingNodes) {
      codeToId.set(n.code, n._id as mongoose.Types.ObjectId);
    }

    const toInsert: Array<Record<string, unknown>> = [];
    const skipped: string[] = [];

    for (const node of data.nodes) {
      if (codeToId.has(node.code)) {
        skipped.push(node.code);
        continue;
      }

      let parentId: mongoose.Types.ObjectId | null = null;
      if (node.parentCode) {
        const resolved = codeToId.get(node.parentCode);
        if (!resolved) {
          throw new BadRequestError(
            `Parent code "${node.parentCode}" not found for node "${node.code}". Ensure parents appear before children.`,
          );
        }
        parentId = resolved;
      }

      const newId = new mongoose.Types.ObjectId();
      codeToId.set(node.code, newId);

      toInsert.push({
        _id: newId,
        frameworkId: frameworkOid,
        type: node.type,
        parentId,
        title: node.title,
        code: node.code,
        description: node.description,
        metadata: node.metadata,
        order: node.order,
        schoolId: schoolId ? new mongoose.Types.ObjectId(schoolId) : null,
        isDeleted: false,
      });
    }

    if (toInsert.length > 0) {
      await CurriculumNode.insertMany(toInsert);
    }

    return { imported: toInsert.length, skipped: skipped.length, skippedCodes: skipped };
  }
}
