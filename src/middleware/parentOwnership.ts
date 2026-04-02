import type { Request, Response, NextFunction } from 'express';
import { Parent } from '../modules/Parent/model.js';
import { Wallet } from '../modules/Wallet/model.js';

/**
 * Middleware that ensures parents can only access their own children's data.
 * Extracts studentId from req.params using the given param name.
 * Non-parent roles (admin, teacher, super_admin, student) bypass this check.
 */
export function requireParentOwnership(paramName = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    // Non-parent roles bypass ownership check
    if (role !== 'parent') return next();

    const rawParam = req.params[paramName];
    const studentId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!studentId) return next();

    const userId = req.user?.id;
    const parent = await Parent.findOne({ userId }).lean();

    if (!parent) {
      return res.status(403).json({ success: false, error: 'Parent profile not found' });
    }

    const childIds = (parent.childrenIds ?? []).map((cid) => cid.toString());

    if (!childIds.includes(studentId)) {
      return res.status(403).json({
        success: false,
        error: "You can only access your own children's data",
      });
    }

    next();
  };
}

/**
 * Middleware that ensures parents can only access wallets belonging to their children.
 * Looks up the wallet by walletId param, then checks if the wallet's studentId
 * is in the parent's childrenIds.
 */
export function requireParentWalletOwnership(paramName = 'walletId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    // Non-parent roles bypass ownership check
    if (role !== 'parent') return next();

    const rawParam = req.params[paramName];
    const walletId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!walletId) return next();

    const userId = req.user?.id;

    const [parent, wallet] = await Promise.all([
      Parent.findOne({ userId }).lean(),
      Wallet.findById(walletId).lean(),
    ]);

    if (!parent) {
      return res.status(403).json({ success: false, error: 'Parent profile not found' });
    }

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    const childIds = (parent.childrenIds ?? []).map((cid) => cid.toString());
    const walletStudentId = wallet.studentId.toString();

    if (!childIds.includes(walletStudentId)) {
      return res.status(403).json({
        success: false,
        error: "You can only access your own children's wallets",
      });
    }

    next();
  };
}
