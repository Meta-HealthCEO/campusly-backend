import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { resolveSubjectOrGradeIds, resolveTermNumberToNodeIds } from './service-academic-bridge.js';
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
    // `types` (CSV) wins over single `type`. Empty array means no constraint.
    if (filters.types && filters.types.length > 0) {
      query.type = { $in: filters.types };
    } else if (filters.type) {
      query.type = filters.type;
    }
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }
    // Subject / Grade / Term filtering — each resolver tries denormalized-ref
    // match first, then falls back to parentId tree traversal, then academic
    // bridge. Resilient to migration state and data drift.
    const subjectIds = await resolveSubjectOrGradeIds(filters.subjectId, 'subject', soid);
    const gradeIds = await resolveSubjectOrGradeIds(filters.gradeId, 'grade', soid);
    const termIds = await resolveTermNumberToNodeIds(filters.termNumber, soid);
    // eslint-disable-next-line no-console
    console.log('[curriculum-list:debug]', {
      filters: {
        frameworkId: filters.frameworkId,
        subjectId: filters.subjectId,
        gradeId: filters.gradeId,
        termNumber: filters.termNumber,
        types: filters.types,
      },
      subjectIds: subjectIds === null ? 'null' : subjectIds === undefined ? 'undefined' : subjectIds.length,
      gradeIds: gradeIds === null ? 'null' : gradeIds === undefined ? 'undefined' : gradeIds.length,
      termIds: termIds === null ? 'null' : termIds === undefined ? 'undefined' : termIds.length,
    });
    if (subjectIds === null || gradeIds === null || termIds === null) {
      return { nodes: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 50 };
    }
    const idConstraints: mongoose.Types.ObjectId[][] = [];
    if (subjectIds) idConstraints.push(subjectIds);
    if (gradeIds) idConstraints.push(gradeIds);
    if (termIds) idConstraints.push(termIds);
    if (idConstraints.length > 0) {
      // Intersect every set into one array.
      const intersection = idConstraints.reduce<mongoose.Types.ObjectId[]>(
        (acc, set) => {
          if (acc.length === 0) return set;
          const setKeys = new Set(set.map((o) => o.toString()));
          return acc.filter((o) => setKeys.has(o.toString()));
        },
        [],
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

    // eslint-disable-next-line no-console
    console.log('[curriculum-list:debug] final', {
      query: JSON.stringify(query),
      total,
      returned: nodes.length,
    });

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
    // Mirror schema for in-memory denormalization (since insertMany skips the
    // pre-save hook). We track every node's lineage as we build the insert
    // batch so children resolve their phase/grade/subject/term in O(1).
    interface Lineage {
      type: 'phase' | 'grade' | 'subject' | 'term' | 'topic' | 'subtopic' | 'outcome';
      title: string;
      parentId: mongoose.Types.ObjectId | null;
      phaseId: mongoose.Types.ObjectId | null;
      gradeId: mongoose.Types.ObjectId | null;
      subjectId: mongoose.Types.ObjectId | null;
      termNumber: number | null;
    }
    const lineageById = new Map<string, Lineage>();
    const TERM_NUMBER_RE = /Term\s+(\d)/i;
    const parseTermNumber = (title: string): number | null => {
      const match = title.match(TERM_NUMBER_RE);
      if (!match) return null;
      const n = Number(match[1]);
      if (Number.isNaN(n) || n < 1 || n > 4) return null;
      return n;
    };

    const existingNodes = await CurriculumNode.find({
      frameworkId: frameworkOid,
      isDeleted: false,
    })
      .select('code _id type title parentId phaseId gradeId subjectId termNumber')
      .lean<Array<{
        _id: mongoose.Types.ObjectId;
        code: string;
        type: Lineage['type'];
        title: string;
        parentId: mongoose.Types.ObjectId | null;
        phaseId: mongoose.Types.ObjectId | null;
        gradeId: mongoose.Types.ObjectId | null;
        subjectId: mongoose.Types.ObjectId | null;
        termNumber: number | null;
      }>>();
    for (const n of existingNodes) {
      codeToId.set(n.code, n._id);
      lineageById.set(n._id.toString(), {
        type: n.type,
        title: n.title,
        parentId: n.parentId,
        phaseId: n.phaseId,
        gradeId: n.gradeId,
        subjectId: n.subjectId,
        termNumber: n.termNumber,
      });
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

      // Inherit denormalized hierarchy from parent, applying self-counts.
      const parentLineage = parentId ? lineageById.get(parentId.toString()) : undefined;
      let phaseId = parentLineage?.phaseId ?? null;
      let gradeId = parentLineage?.gradeId ?? null;
      let subjectId = parentLineage?.subjectId ?? null;
      let termNumber = parentLineage?.termNumber ?? null;
      if (node.type === 'phase') phaseId = newId;
      if (node.type === 'grade') gradeId = newId;
      if (node.type === 'subject') subjectId = newId;
      if (node.type === 'term' && termNumber === null) {
        termNumber = parseTermNumber(node.title);
      }

      lineageById.set(newId.toString(), {
        type: node.type,
        title: node.title,
        parentId,
        phaseId,
        gradeId,
        subjectId,
        termNumber,
      });

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
        phaseId,
        gradeId,
        subjectId,
        termNumber,
        isDeleted: false,
      });
    }

    if (toInsert.length > 0) {
      await CurriculumNode.insertMany(toInsert);
    }

    return { imported: toInsert.length, skipped: skipped.length, skippedCodes: skipped };
  }
}
