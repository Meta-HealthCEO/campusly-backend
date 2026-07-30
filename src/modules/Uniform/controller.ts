import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { UniformService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { UserRole } from '../../common/enums.js';
import { resolveSchoolScope } from '../../common/school-scope.js';

export class UniformController {
  // ─── Uniform Items ────────────────────────────────────────────────────────

  static async createItem(req: Request, res: Response): Promise<void> {
    const item = await UniformService.createItem(req.body);
    res.status(201).json(apiResponse(true, item, 'Uniform item created successfully'));
  }

  static async listItems(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId,
      category: req.query.category as string | undefined,
    };

    const result = await UniformService.listItems(query);
    res.json(apiResponse(true, result, 'Uniform items retrieved successfully'));
  }

  static async getItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await UniformService.getItem(req.params.id as string, schoolId);
    res.json(apiResponse(true, item, 'Uniform item retrieved successfully'));
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const item = await UniformService.updateItem(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, item, 'Uniform item updated successfully'));
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await UniformService.deleteItem(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Uniform item deleted successfully'));
  }

  // ─── Uniform Orders ──────────────────────────────────────────────────────

  static async createOrder(req: Request, res: Response): Promise<void> {
    const order = await UniformService.createOrder(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, order, 'Uniform order created successfully'));
  }

  static async listOrders(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId,
      studentId: req.query.studentId as string | undefined,
      status: req.query.status as string | undefined,
    };

    const result = await UniformService.listOrders(query);
    res.json(apiResponse(true, result, 'Uniform orders retrieved successfully'));
  }

  static async getOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const order = await UniformService.getOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, order, 'Uniform order retrieved successfully'));
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const order = await UniformService.updateOrderStatus(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, order, 'Uniform order status updated successfully'));
  }

  static async deleteOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await UniformService.deleteOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Uniform order deleted successfully'));
  }

  // ─── Second Hand Marketplace ───────────────────────────────────────────────

  static async createSecondHandListing(req: Request, res: Response): Promise<void> {
    const listing = await UniformService.createSecondHandListing(req.body);
    res.status(201).json(apiResponse(true, listing, 'Second hand listing created successfully'));
  }

  static async listSecondHandListings(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId,
      condition: req.query.condition as string | undefined,
      status: req.query.status as string | undefined,
    };

    const result = await UniformService.listSecondHandListings(query);
    res.json(apiResponse(true, result, 'Second hand listings retrieved successfully'));
  }

  static async getSecondHandListing(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const listing = await UniformService.getSecondHandListing(req.params.id as string, schoolId);
    res.json(apiResponse(true, listing, 'Second hand listing retrieved successfully'));
  }

  static async reserveSecondHandListing(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    // Non-admin users can only reserve for themselves — override buyerId with their own ID
    const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SCHOOL_ADMIN;
    const buyerId = isAdmin ? (req.body.buyerId as string) : user.id;
    const listing = await UniformService.reserveSecondHandListing(req.params.id as string, schoolId, buyerId);
    res.json(apiResponse(true, listing, 'Listing reserved successfully'));
  }

  static async markSecondHandSold(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const listing = await UniformService.markSecondHandSold(req.params.id as string, schoolId);
    res.json(apiResponse(true, listing, 'Listing marked as sold successfully'));
  }

  static async getMyListings(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SCHOOL_ADMIN;

    let parentId: string;
    if (isAdmin) {
      // Admins may view any parent's listings via the URL param
      parentId = req.params.parentId as string;
    } else {
      // Non-admin (parent) users — resolve parentId from their own user record
      const { Parent } = await import('../Parent/model.js');
      const parent = await Parent.findOne({ userId: user.id, isDeleted: false }).lean();
      if (!parent) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'Parent record not found for this user'));
        return;
      }
      parentId = String(parent._id);
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await UniformService.getMyListings(parentId, query);
    res.json(apiResponse(true, result, 'My listings retrieved successfully'));
  }

  // ─── Size Guide ──────────────────────────────────────────────────────────

  static async createSizeGuide(req: Request, res: Response): Promise<void> {
    const data = {
      ...req.body,
      uniformItemId: req.params.itemId,
    };
    const sizeGuide = await UniformService.createSizeGuide(data);
    res.status(201).json(apiResponse(true, sizeGuide, 'Size guide created successfully'));
  }

  static async getSizeGuide(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sizeGuide = await UniformService.getSizeGuideByItem(req.params.itemId as string, schoolId);
    res.json(apiResponse(true, sizeGuide, 'Size guide retrieved successfully'));
  }

  static async updateSizeGuide(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sizeGuide = await UniformService.updateSizeGuide(req.params.itemId as string, schoolId, req.body);
    res.json(apiResponse(true, sizeGuide, 'Size guide updated successfully'));
  }

  static async deleteSizeGuide(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await UniformService.deleteSizeGuide(req.params.itemId as string, schoolId);
    res.json(apiResponse(true, undefined, 'Size guide deleted successfully'));
  }

  // ─── Pre Orders ──────────────────────────────────────────────────────────

  static async createPreOrder(req: Request, res: Response): Promise<void> {
    const preOrder = await UniformService.createPreOrder(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, preOrder, 'Pre-order created successfully'));
  }

  static async listPreOrders(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId,
      status: req.query.status as string | undefined,
      uniformItemId: req.query.uniformItemId as string | undefined,
    };

    const result = await UniformService.listPreOrders(query);
    res.json(apiResponse(true, result, 'Pre-orders retrieved successfully'));
  }

  static async getPreOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const preOrder = await UniformService.getPreOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, preOrder, 'Pre-order retrieved successfully'));
  }

  static async updatePreOrderStatus(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const preOrder = await UniformService.updatePreOrderStatus(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, preOrder, 'Pre-order status updated successfully'));
  }

  static async deletePreOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await UniformService.deletePreOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Pre-order deleted successfully'));
  }

  // ─── Order Timeline ──────────────────────────────────────────────────────

  static async getOrderTimeline(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const timeline = await UniformService.getOrderTimeline(req.params.id as string, schoolId);
    res.json(apiResponse(true, timeline, 'Order timeline retrieved successfully'));
  }

  // ─── Size Recommendation ────────────────────────────────────────────────

  static async getSizeRecommendation(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await UniformService.getSizeRecommendation(schoolId, req.params.studentId as string);
    res.json(apiResponse(true, result, 'Size recommendation retrieved successfully'));
  }

  // ─── Uniform Requirements ──────────────────────────────────────────────

  static async getUniformRequirements(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const items = await UniformService.getUniformRequirements(schoolId, req.params.gradeId as string);
    res.json(apiResponse(true, items, 'Uniform requirements retrieved successfully'));
  }

  // ─── Low Stock ───────────────────────────────────────────────────────────

  static async getLowStockItems(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId,
    };

    const result = await UniformService.getLowStockItems(query);
    res.json(apiResponse(true, result, 'Low stock items retrieved successfully'));
  }
}
