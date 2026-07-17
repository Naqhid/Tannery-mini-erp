import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/masterControllers.js';

// Helper to create routes for a master controller
function createMasterRoutes(controller) {
  const router = Router();

  router.get('/', validatePagination, controller.list);
  router.get('/dropdown', controller.dropdown);
  router.get('/stats', controller.stats);
  router.post('/check-duplicate', controller.checkDuplicate);
  router.post('/bulk-delete', requireWriteAccess, controller.bulkDelete);
  router.post('/bulk-status', requireWriteAccess, controller.bulkStatus);
  router.post('/bulk-archive', requireWriteAccess, controller.bulkArchive);
  router.get('/:id', validateId, controller.getOne);
  router.get('/:id/audit', validateId, controller.audit);
  router.post('/', requireWriteAccess, controller.create);
  router.post('/:id/duplicate', validateId, requireWriteAccess, controller.duplicateRecord);
  router.put('/:id', validateId, requireWriteAccess, controller.update);
  router.delete('/:id', validateId, requireWriteAccess, controller.remove);
  router.post('/:id/restore', validateId, requireWriteAccess, controller.restore);

  return router;
}

// Product Category routes
export const productCategoryRoutes = createMasterRoutes(ctrl.productCategoryController);

// Leather Type routes
export const leatherTypeRoutes = createMasterRoutes(ctrl.leatherTypeController);

// UOM routes
export const uomRoutes = createMasterRoutes(ctrl.uomController);

// Thickness routes
export const thicknessRoutes = createMasterRoutes(ctrl.thicknessController);

// Standard Size routes
export const standardSizeRoutes = createMasterRoutes(ctrl.standardSizeController);

// Color routes
export const colorRoutes = createMasterRoutes(ctrl.colorController);

// Finish Type routes
export const finishTypeRoutes = createMasterRoutes(ctrl.finishTypeController);

// Grade routes
export const gradeRoutes = createMasterRoutes(ctrl.gradeController);

// HSN Code routes
export const hsnCodeRoutes = createMasterRoutes(ctrl.hsnCodeController);

// Process Stage routes
export const processStageRoutes = createMasterRoutes(ctrl.processStageController);

// Machine routes
export const machineRoutes = createMasterRoutes(ctrl.machineController);

// Role routes
export const roleRoutes = createMasterRoutes(ctrl.roleController);

// Company routes
export const companyRoutes = createMasterRoutes(ctrl.companyController);

// Business Unit routes
export const businessUnitRoutes = createMasterRoutes(ctrl.businessUnitController);

export default {
  productCategoryRoutes,
  leatherTypeRoutes,
  uomRoutes,
  thicknessRoutes,
  standardSizeRoutes,
  colorRoutes,
  finishTypeRoutes,
  gradeRoutes,
  hsnCodeRoutes,
  processStageRoutes,
  machineRoutes,
  roleRoutes,
  companyRoutes,
  businessUnitRoutes,
};
