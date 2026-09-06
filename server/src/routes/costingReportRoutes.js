import { Router } from 'express';
import * as ctrl from '../controllers/costingReportController.js';
import { validatePagination } from '../middleware/validators.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/filters', ctrl.getFilters);
router.get('/plan/:planId/detail', ctrl.getDetailByPlan);
router.get('/:id/detail', ctrl.getDetail);

export default router;
