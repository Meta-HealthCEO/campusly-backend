import { Request, Response } from 'express';
import { UniformService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class UniformController {
  // ─── Uniform Items ────────────────────────────────────────────────────────

  static async createItem(req: Request, res: Response): Promise<void> {
    const item = await UniformService.createItem(req.body);
    res.status(201).json(apiResponse(true, item, 'Uniform item created successfully'));
  }

  static async listItems(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      category: req.query.category as string | undefined,
    };

    const result = await UniformService.listItems(query);
    res.json(apiResponse(true, result, 'Uniform items retrieved successfully'));
  }

  static async getItem(req: Request, res: Response): Promise<void> {
    const item = await UniformService.getItem(req.params.id as string);
    res.json(apiResponse(true, item, 'Uniform item retrieved successfully'));
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    const item = await UniformService.updateItem(req.params.id as string, req.body);
    res.json(apiResponse(true, item, 'Uniform item updated successfully'));
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    await UniformService.deleteItem(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Uniform item deleted successfully'));
  }

  // ─── Uniform Orders ──────────────────────────────────────────────────────

  static async createOrder(req: Request, res: Response): Promise<void> {
    const order = await UniformService.createOrder(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, order, 'Uniform order created successfully'));
  }

  static async listOrders(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      studentId: req.query.studentId as string | undefined,
      status: req.query.status as string | undefined,
    };

    const result = await UniformService.listOrders(query);
    res.json(apiResponse(true, result, 'Uniform orders retrieved successfully'));
  }

  static async getOrder(req: Request, res: Response): Promise<void> {
    const order = await UniformService.getOrder(req.params.id as string);
    res.json(apiResponse(true, order, 'Uniform order retrieved successfully'));
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const order = await UniformService.updateOrderStatus(req.params.id as string, req.body);
    res.json(apiResponse(true, order, 'Uniform order status updated successfully'));
  }

  static async deleteOrder(req: Request, res: Response): Promise<void> {
    await UniformService.deleteOrder(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Uniform order deleted successfully'));
  }
}
