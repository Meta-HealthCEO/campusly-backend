import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { TuckShopService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { resolveSchoolScope } from '../../common/school-scope.js';

export class TuckShopController {
  // ─── Menu Items ─────────────────────────────────────────────────────────────

  static async createMenuItem(req: Request, res: Response): Promise<void> {
    const item = await TuckShopService.createMenuItem(req.body);
    res.status(201).json(apiResponse(true, item, 'Menu item created successfully'));
  }

  static async listMenuItems(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      category: req.query.category as string | undefined,
    };

    const result = await TuckShopService.listMenuItems(schoolId, query);
    res.json(apiResponse(true, result, 'Menu items retrieved successfully'));
  }

  static async getMenuItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await TuckShopService.getMenuItem(req.params.id as string, schoolId);
    res.json(apiResponse(true, item, 'Menu item retrieved successfully'));
  }

  static async updateMenuItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await TuckShopService.updateMenuItem(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, item, 'Menu item updated successfully'));
  }

  static async deleteMenuItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await TuckShopService.deleteMenuItem(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Menu item deleted successfully'));
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  static async placeOrder(req: Request, res: Response): Promise<void> {
    const order = await TuckShopService.placeOrder(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, order, 'Order placed successfully'));
  }

  static async getOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const order = await TuckShopService.getOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, order, 'Order retrieved successfully'));
  }

  static async getStudentOrders(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await TuckShopService.getStudentOrders(studentId, query);
    res.json(apiResponse(true, result, 'Student orders retrieved successfully'));
  }

  static async getDailySales(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { date } = req.query;

    if (!date) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'date is required'));
      return;
    }

    const result = await TuckShopService.getDailySales(schoolId, date as string);
    res.json(apiResponse(true, result, 'Daily sales retrieved successfully'));
  }

  static async updateStock(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const id = req.params.id as string;
    const { stock } = req.body;

    if (stock === undefined || typeof stock !== 'number') {
      res.status(400).json(apiResponse(false, undefined, undefined, 'stock (number) is required'));
      return;
    }

    const item = await TuckShopService.updateStock(id, schoolId, stock);
    res.json(apiResponse(true, item, 'Stock updated successfully'));
  }
}
