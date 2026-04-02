import mongoose from 'mongoose';
import { Student } from '../../Student/model.js';
import { Invoice, Payment } from '../../Fee/model.js';
import { Attendance } from '../../Attendance/model.js';
import { TuckShopOrder } from '../../TuckShop/model.js';
import { Homework } from '../../Homework/model.js';
import { Event } from '../../Event/model.js';

export class DashboardReportService {
  static async getDashboardStats(schoolId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    const [
      totalStudents,
      revenueResult,
      collectionResult,
      attendanceResult,
      outstandingResult,
    ] = await Promise.all([
      Student.countDocuments({
        schoolId: schoolObjectId,
        enrollmentStatus: 'active',
        isDeleted: false,
      }),

      Payment.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            isDeleted: false,
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      Invoice.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$paidAmount' },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]),

      Attendance.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
            },
          },
        },
      ]),

      Invoice.aggregate([
        {
          $match: {
            schoolId: schoolObjectId,
            status: { $nin: ['paid', 'cancelled'] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            outstanding: { $sum: { $subtract: ['$totalAmount', { $add: ['$paidAmount', '$writeOffAmount'] }] } },
          },
        },
      ]),
    ]);

    const totalRevenueThisMonth = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const feeCollectionRate =
      collectionResult.length > 0 && collectionResult[0].totalAmount > 0
        ? Math.round((collectionResult[0].totalPaid / collectionResult[0].totalAmount) * 10000) / 100
        : 0;

    const attendanceRate =
      attendanceResult.length > 0 && attendanceResult[0].total > 0
        ? Math.round((attendanceResult[0].present / attendanceResult[0].total) * 10000) / 100
        : 0;

    const outstandingFees = outstandingResult.length > 0 ? outstandingResult[0].outstanding : 0;

    return {
      totalStudents,
      totalRevenueThisMonth,
      feeCollectionRate,
      attendanceRate,
      outstandingFees,
    };
  }

  static async getComprehensiveDashboard(schoolId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    const [
      totalStudents,
      revenueResult,
      collectionResult,
      attendanceResult,
      tuckShopToday,
      upcomingEvents,
      overdueHomework,
    ] = await Promise.all([
      Student.countDocuments({ schoolId: schoolObjId, enrollmentStatus: 'active', isDeleted: false }),

      Payment.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      Invoice.aggregate([
        { $match: { schoolId: schoolObjId, isDeleted: false } },
        { $group: { _id: null, totalPaid: { $sum: '$paidAmount' }, totalAmount: { $sum: '$totalAmount' } } },
      ]),

      Attendance.aggregate([
        { $match: { schoolId: schoolObjId, date: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
      ]),

      TuckShopOrder.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: today, $lt: tomorrow }, isDeleted: false } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      ]),

      Event.countDocuments({ schoolId: schoolObjId, date: { $gte: today }, isDeleted: false }),

      Homework.countDocuments({ schoolId: schoolObjId, dueDate: { $lt: today }, status: 'assigned', isDeleted: false }),
    ]);

    const totalRevenueThisMonth = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const collectionRate = collectionResult.length > 0 && collectionResult[0].totalAmount > 0
      ? Math.round((collectionResult[0].totalPaid / collectionResult[0].totalAmount) * 10000) / 100 : 0;
    const attendanceRate = attendanceResult.length > 0 && attendanceResult[0].total > 0
      ? Math.round((attendanceResult[0].present / attendanceResult[0].total) * 10000) / 100 : 0;

    return {
      totalStudents,
      totalRevenueThisMonth,
      collectionRate,
      attendanceRate,
      tuckShopSalesToday: tuckShopToday.length > 0 ? tuckShopToday[0].totalSales : 0,
      tuckShopOrdersToday: tuckShopToday.length > 0 ? tuckShopToday[0].orderCount : 0,
      upcomingEvents,
      overdueHomeworkCount: overdueHomework,
    };
  }
}
