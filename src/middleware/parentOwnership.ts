import type { Request, Response, NextFunction } from 'express';
import { Parent } from '../modules/Parent/model.js';
import { Student } from '../modules/Student/model.js';
import { Wallet } from '../modules/Wallet/model.js';

/**
 * Middleware that ensures parents and students can only access their own data.
 * Extracts studentId from req.params using the given param name.
 * Staff roles continue through to their controller-level school/role checks.
 */
export function requireParentOwnership(paramName = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (role !== 'parent' && role !== 'student') return next();

    const rawParam = req.params[paramName];
    const studentId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!studentId) return next();

    const userId = req.user?.id;

    if (role === 'student') {
      const student = await Student.findOne({
        _id: studentId,
        userId,
        ...(req.user?.schoolId ? { schoolId: req.user.schoolId } : {}),
        isDeleted: false,
      }).select('_id').lean();

      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'You can only access your own student data',
        });
      }

      return next();
    }

    const parent = await Parent.findOne({
      userId,
      ...(req.user?.schoolId ? { schoolId: req.user.schoolId } : {}),
      isDeleted: false,
    }).lean();

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
 * Middleware that ensures parents and students can only access their own wallets.
 * Looks up the wallet by walletId param, then checks if the wallet's studentId
 * is in the parent's childrenIds or belongs to the authenticated student.
 */
export function requireParentWalletOwnership(paramName = 'walletId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (role !== 'parent' && role !== 'student') return next();

    const rawParam = req.params[paramName];
    const walletId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!walletId) return next();

    const userId = req.user?.id;
    const wallet = await Wallet.findById(walletId).lean();

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    if (role === 'student') {
      const student = await Student.findOne({
        userId,
        ...(req.user?.schoolId ? { schoolId: req.user.schoolId } : {}),
        isDeleted: false,
      }).select('_id').lean();

      if (!student || wallet.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You can only access your own wallet',
        });
      }

      return next();
    }

    const parent = await Parent.findOne({
      userId,
      ...(req.user?.schoolId ? { schoolId: req.user.schoolId } : {}),
      isDeleted: false,
    }).lean();

    if (!parent) {
      return res.status(403).json({ success: false, error: 'Parent profile not found' });
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
