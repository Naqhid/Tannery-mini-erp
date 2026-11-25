import { Router } from 'express';
import { requireAuth, requireWriteAccess } from '../middleware/auth.js';
import * as c from '../controllers/rmWarehouseController.js';

const router = Router();
router.use(requireAuth);

router.get('/stats', c.stats);
router.get('/racks', c.racks);
router.get('/articles', c.articles);
router.get('/lot-lookups', c.lotLookups);

router.get('/lots', c.listLots);
router.post('/lots', requireWriteAccess, c.createLot);
router.delete('/lots/:id', requireWriteAccess, c.deleteLot);
router.post('/lots/:id/generate-qr', requireWriteAccess, c.generateQr);

router.get('/pieces', c.listPieces);
router.post('/pieces/grade', requireWriteAccess, c.gradePiece);
router.post('/pieces/putaway', requireWriteAccess, c.putAway);

router.get('/pick-lists', c.listPickLists);
router.post('/pick-lists', requireWriteAccess, c.createPickList);
router.get('/pick-lists/:id', c.getPickList);
router.post('/pick-lists/:id/pick', requireWriteAccess, c.pickPiece);
router.post('/pick-lists/:id/dispatch', requireWriteAccess, c.confirmDispatch);

export default router;
