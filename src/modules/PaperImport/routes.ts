import { Router } from 'express';
import { PaperImportController } from './controller.js';
import { createUpload } from './service-storage.js';
import { authenticate } from '../../middleware/auth.js';
import { refuseStandalone } from '../../middleware/refuse-standalone.js';

const router = Router();
const upload = createUpload();

router.use(authenticate);

// Library import is hidden from standalone teachers (AI reads the paper outside their allowance).
router.post('/', refuseStandalone(), upload.single('source'), PaperImportController.create);
router.get('/', PaperImportController.list);
router.get('/:jobId', PaperImportController.get);
router.post('/:jobId/cancel', PaperImportController.cancel);
router.delete('/:jobId', PaperImportController.remove);
router.get('/:jobId/source', PaperImportController.streamSource);
router.get('/:jobId/crops/:filename', PaperImportController.streamCrop);
router.get('/:jobId/page/:page', PaperImportController.streamPage);

export default router;
