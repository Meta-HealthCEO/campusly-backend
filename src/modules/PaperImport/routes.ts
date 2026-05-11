import { Router } from 'express';
import { PaperImportController } from './controller.js';
import { createUpload } from './service-storage.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const upload = createUpload();

router.use(authenticate);

router.post('/', upload.single('source'), PaperImportController.create);
router.get('/', PaperImportController.list);
router.get('/:jobId', PaperImportController.get);
router.post('/:jobId/cancel', PaperImportController.cancel);
router.delete('/:jobId', PaperImportController.remove);
router.get('/:jobId/source', PaperImportController.streamSource);
router.get('/:jobId/crops/:filename', PaperImportController.streamCrop);
router.get('/:jobId/page/:page', PaperImportController.streamPage);

export default router;
