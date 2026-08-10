import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as ctrl from '../controllers/bomController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../../uploads/boms');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/generate-code/:customerName', ctrl.generateCode);
router.get('/:id', validateId, ctrl.getOne);
router.get('/:id/versions', validateId, ctrl.listVersions);
router.post('/:id/revisions', validateId, requireWriteAccess, ctrl.createRevision);

// BOM items
router.get('/:id/items', validateId, ctrl.listItems);
router.post('/:id/items', validateId, requireWriteAccess, ctrl.addItem);
router.put('/:id/items/:itemId', validateId, requireWriteAccess, ctrl.updateItem);
router.delete('/:id/items/:itemId', validateId, requireWriteAccess, ctrl.removeItem);

// BOM Attachments
router.get('/:id/attachments', validateId, ctrl.listAttachments);
router.post('/:id/attachments', validateId, requireWriteAccess, upload.single('file'), ctrl.addAttachment);
router.delete('/:id/attachments/:attachmentId', validateId, requireWriteAccess, ctrl.removeAttachment);

// BOM CRUD
router.post('/', requireWriteAccess, ctrl.create);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

export default router;
