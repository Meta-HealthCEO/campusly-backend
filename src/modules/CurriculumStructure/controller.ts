import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { FrameworksService } from './service-frameworks.js';
import { NodesService } from './service-nodes.js';
import type { NodeQueryInput } from './validation.js';

export class CurriculumStructureController {
  // ─── Frameworks ──────────────────────────────────────────────────────────────

  static async listFrameworks(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const frameworks = await FrameworksService.listFrameworks(user.schoolId!);
    res.json(apiResponse(true, frameworks));
  }

  static async createFramework(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const framework = await FrameworksService.createFramework(
      user.schoolId!,
      user.id,
      req.body,
    );
    res.status(201).json(apiResponse(true, framework, 'Framework created successfully'));
  }

  // ─── Nodes ───────────────────────────────────────────────────────────────────

  static async listNodes(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    // Query has been parsed & defaulted by validate({ query: nodeQuerySchema })
    const filters = req.query as unknown as NodeQueryInput;
    const result = await NodesService.listNodes(user.schoolId!, filters);
    res.json(apiResponse(true, result));
  }

  static async getNode(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const node = await NodesService.getNode(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, node));
  }

  static async getSubtree(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const tree = await NodesService.getSubtree(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, tree));
  }

  static async createNode(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const node = await NodesService.createNode(user.schoolId!, req.body);
    res.status(201).json(apiResponse(true, node, 'Node created successfully'));
  }

  static async updateNode(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const node = await NodesService.updateNode(req.params.id as string, user.schoolId!, req.body);
    res.json(apiResponse(true, node, 'Node updated successfully'));
  }

  static async deleteNode(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await NodesService.deleteNode(req.params.id as string, user.schoolId!);
    res.json(apiResponse(true, result, 'Node and descendants deleted'));
  }

  static async bulkImport(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await NodesService.bulkImport(user.schoolId!, req.body);
    res.status(201).json(apiResponse(true, result, 'Bulk import completed'));
  }
}
