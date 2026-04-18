import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { FitnessService } from './service-fitness.js';

export class FitnessController {
  static async createTest(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const test = await FitnessService.createTest(req.body, user.schoolId!, user.id);
    res.status(201).json(apiResponse(true, test, 'Fitness test recorded'));
  }

  static async listTests(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { studentId, teamId, testType, from, to } = req.query;
    const tests = await FitnessService.listTests({
      schoolId: user.schoolId!,
      studentId: typeof studentId === 'string' ? studentId : undefined,
      teamId: typeof teamId === 'string' ? teamId : undefined,
      testType: typeof testType === 'string' ? testType : undefined,
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
    });
    res.status(200).json(apiResponse(true, tests, 'Fitness tests retrieved'));
  }

  static async updateTest(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const test = await FitnessService.updateTest(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, test, 'Fitness test updated'));
  }

  static async deleteTest(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await FitnessService.deleteTest(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, null, 'Fitness test deleted'));
  }

  static async playerProgression(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const grouped = await FitnessService.playerProgression(
      req.params.studentId as string,
      user.schoolId!,
    );
    res.status(200).json(apiResponse(true, grouped, 'Player progression retrieved'));
  }

  static async createBiometric(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const m = await FitnessService.createBiometric(req.body, user.schoolId!, user.id);
    res.status(201).json(apiResponse(true, m, 'Biometric recorded'));
  }

  static async listBiometrics(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { studentId, from, to } = req.query;
    const measurements = await FitnessService.listBiometrics({
      schoolId: user.schoolId!,
      studentId: typeof studentId === 'string' ? studentId : undefined,
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
    });
    res.status(200).json(apiResponse(true, measurements, 'Biometrics retrieved'));
  }

  static async updateBiometric(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const m = await FitnessService.updateBiometric(
      req.params.id as string,
      user.schoolId!,
      req.body,
    );
    res.status(200).json(apiResponse(true, m, 'Biometric updated'));
  }

  static async deleteBiometric(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    await FitnessService.deleteBiometric(req.params.id as string, user.schoolId!);
    res.status(200).json(apiResponse(true, null, 'Biometric deleted'));
  }
}
