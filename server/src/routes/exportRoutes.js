import { Router } from 'express';
import { exportMaterialsExcel } from '../controllers/excelExportController.js';

const router = Router();

// GET /api/export/materials-excel - Download Excel with all material data
router.get('/materials-excel', exportMaterialsExcel);

export default router;
