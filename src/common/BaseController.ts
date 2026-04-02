import type { Request, Response } from 'express';

/**
 * Factory that generates standard CRUD controller handlers from a service object.
 *
 * Usage — when creating a NEW module, wire up the standard endpoints like this:
 *
 * ```ts
 * import { createCrudController } from '../../common/BaseController.js';
 * import { MyService } from './service.js';
 *
 * const crud = createCrudController<MyType>({
 *   create: (data, schoolId) => MyService.create({ ...data, schoolId }),
 *   list:   (query)          => MyService.list(query),
 *   getById:(id)             => MyService.getById(id),
 *   update: (id, data)       => MyService.update(id, data),
 *   remove: (id)             => MyService.delete(id),
 * });
 *
 * // Then in routes:
 * router.post('/',        asyncHandler(crud.create));
 * router.get('/',         asyncHandler(crud.list));
 * router.get('/:id',      asyncHandler(crud.getById));
 * router.put('/:id',      asyncHandler(crud.update));
 * router.delete('/:id',   asyncHandler(crud.remove));
 * ```
 *
 * Existing controllers are NOT required to migrate — this is an opt-in
 * convenience for new modules or when refactoring individual controllers.
 */
export function createCrudController<T>(service: {
  create?: (data: unknown, schoolId?: string) => Promise<T>;
  list?: (query: Record<string, unknown>) => Promise<{ data: T[]; pagination: unknown }>;
  getById?: (id: string) => Promise<T | null>;
  update?: (id: string, data: unknown) => Promise<T | null>;
  remove?: (id: string) => Promise<void>;
}) {
  return {
    async create(req: Request, res: Response) {
      const result = await service.create!(req.body, req.user?.schoolId);
      return res.status(201).json({ success: true, data: result });
    },

    async list(req: Request, res: Response) {
      const result = await service.list!({ ...req.query, schoolId: req.user?.schoolId });
      return res.json({ success: true, ...result });
    },

    async getById(req: Request, res: Response) {
      const result = await service.getById!(req.params.id as string);
      if (!result) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: result });
    },

    async update(req: Request, res: Response) {
      const result = await service.update!(req.params.id as string, req.body);
      if (!result) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: result });
    },

    async remove(req: Request, res: Response) {
      await service.remove!(req.params.id as string);
      return res.json({ success: true, message: 'Deleted' });
    },
  };
}
