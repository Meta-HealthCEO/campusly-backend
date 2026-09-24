// Development-only one-click sign-in. app.ts mounts this router at
// /api/auth/dev-sign-in only when config/dev-sign-in.ts says the gate is open;
// otherwise the paths 404 like any unknown route. Even when mounted it answers
// only callers on this computer.
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod/v4';
import { ForbiddenError } from '../../common/errors.js';
import { apiResponse } from '../../common/utils.js';
import { isLoopbackAddress } from '../../config/dev-sign-in.js';
import { DevSignInService } from './dev-sign-in.service.js';
import { sendLoginResponse } from './controller.js';

const signInSchema = z.object({ userId: z.string().max(64) });

/** Uses the socket address, so a spoofed X-Forwarded-For cannot pass. */
function requireLoopback(req: Request, _res: Response, next: NextFunction): void {
  if (!isLoopbackAddress(req.socket.remoteAddress)) {
    throw new ForbiddenError('Development sign-in only answers on this computer');
  }
  next();
}

const router = express.Router();

router.use(requireLoopback);

router.get('/accounts', async (_req: Request, res: Response) => {
  const accounts = await DevSignInService.listAccounts();
  res.status(200).json(apiResponse(true, accounts, 'Development accounts'));
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) throw new ForbiddenError('That account is not offered for development sign-in');
  sendLoginResponse(res, await DevSignInService.signIn(parsed.data.userId));
});

export default router;
