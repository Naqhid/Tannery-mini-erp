import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as ctrl from '../controllers/recipeController.js';
import { validateId, validatePagination } from '../middleware/validators.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/recipes');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/bom-items/:productId', validateId, ctrl.getBOMItems);
router.get('/stage-parameters/:processStageId', validateId, ctrl.getStageParameters);
router.get('/:id', validateId, ctrl.getOne);

// Recipe items
router.get('/:id/items', validateId, ctrl.listItems);
router.post('/:id/items', validateId, ctrl.addItem);
router.put('/:id/items/:itemId', validateId, ctrl.updateItem);
router.delete('/:id/items/:itemId', validateId, ctrl.removeItem);

// Process stages
router.get('/:id/stages', validateId, ctrl.listStages);
router.post('/:id/stages', validateId, ctrl.addStage);
router.put('/:id/stages/:stageId', validateId, ctrl.updateStage);
router.delete('/:id/stages/:stageId', validateId, ctrl.removeStage);

// Attachments
router.get('/:id/attachments', validateId, ctrl.listAttachments);
router.post('/:id/attachments', validateId, upload.single('file'), ctrl.addAttachment);
router.delete('/:id/attachments/:attachmentId', validateId, ctrl.removeAttachment);

// Remarks
router.get('/:id/remarks', validateId, ctrl.getRemarks);
router.put('/:id/remarks', validateId, ctrl.updateRemarks);

// Recipe CRUD
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
