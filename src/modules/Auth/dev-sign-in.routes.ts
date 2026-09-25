// Development-only one-click sign-in. app.ts mounts this router at
// /api/auth/dev-sign-in only when config/dev-sign-in.ts says the gate is open;
// otherwise the paths 404 like any unknown route. Even when mounted it answers
// only callers on this computer.
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod/v4';
import { ForbiddenError } from '../../common/errors.js';
import { apiResponse } from '../../common/utils.js';
import { isDevSignInEnabled, isLocalHostname, isLocalOrigin, isLoopbackAddress } from '../../config/dev-sign-in.js';
import { createRateLimiter } from '../../middleware/rateLimiter.js';
import { DevSignInService } from './dev-sign-in.service.js';
import { sendLoginResponse } from './controller.js';

const signInSchema = z.object({ userId: z.string().max(64) });

/**
 * Only this computer, asked by name, from a local page. The socket address defeats a spoofed
 * X-Forwarded-For; the Host check defeats DNS rebinding (a hostile site re-pointed at 127.0.0.1);
 * the Origin check and JSON-only POST defeat a cross-site form.
 */
function requireLocal(req: Request, _res: Response, next: NextFunction): void {
  const local = isDevSignInEnabled()
    && isLoopbackAddress(req.socket.remoteAddress)
    && isLocalHostname(req.hostname)
    && isLocalOrigin(req.get('origin'))
    && (req.method !== 'POST' || req.is('application/json') === 'application/json');
  if (!local) throw new ForbiddenError('Development sign-in only answers on this computer');
  next();
}

const router = express.Router();

router.use(createRateLimiter(60_000, 30));
router.use(requireLocal);

router.get('/accounts', async (_req: Request, res: Response) => {
  const accounts = await DevSignInService.listAccounts();
  res.status(200).json(apiResponse(true, accounts, 'Development accounts'));
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) throw new ForbiddenError('That account is not offered for development sign-in');
  await sendLoginResponse(res, await DevSignInService.signIn(parsed.data.userId));
});

export default router;
