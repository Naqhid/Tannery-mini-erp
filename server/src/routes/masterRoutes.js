import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/masterControllers.js';
import pool from '../config/db.js';

// Helper to create routes for a master controller
function createMasterRoutes(controller) {
  const router = Router();

  router.get('/', validatePagination, controller.list);
  router.get('/dropdown', controller.dropdown);
  router.get('/next-code', controller.nextCode);
  router.get('/stats', controller.stats);
  router.post('/check-duplicate', controller.checkDuplicate);
  router.post('/bulk-delete', requireWriteAccess, controller.bulkDelete);
  router.post('/bulk-status', requireWriteAccess, controller.bulkStatus);
  router.post('/bulk-archive', requireWriteAccess, controller.bulkArchive);
  router.post('/', requireWriteAccess, controller.create);
  router.post('/:id/duplicate', validateId, requireWriteAccess, controller.duplicateRecord);
  router.post('/:id/restore', validateId, requireWriteAccess, controller.restore);
  router.get('/:id/audit', validateId, controller.audit);
  router.get('/:id', validateId, controller.getOne);
  router.put('/:id', validateId, requireWriteAccess, controller.update);
  router.delete('/:id', validateId, requireWriteAccess, controller.remove);
  router.delete('/:id/permanent', validateId, requireWriteAccess, controller.permanentDelete);

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

// Tax Master routes
export const taxMasterRoutes = createMasterRoutes(ctrl.taxMasterController);

// Process Stage routes
export const processStageRoutes = createMasterRoutes(ctrl.processStageController);

// Group Master routes
export const groupMasterRoutes = Router();
// Register custom group routes FIRST (before /:id)
groupMasterRoutes.get('/', validatePagination, ctrl.groupMasterController.list);
groupMasterRoutes.get('/dropdown', ctrl.groupMasterController.dropdown);
groupMasterRoutes.get('/next-code', ctrl.groupMasterController.nextCode);
groupMasterRoutes.get('/stats', ctrl.groupMasterController.stats);
groupMasterRoutes.get('/with-category', validatePagination, async (req, res, next) => {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    let where = 'g.deleted_at IS NULL';
    const params = [];
    if (search) {
      where += ' AND (g.name LIKE ? OR g.code LIKE ? OR g.hsn_code LIKE ? OR pc.name LIKE ?)';
      const t = `%${search}%`;
      params.push(t, t, t, t);
    }
    if (status) { where += ' AND g.status = ?'; params.push(status); }
    const col = ['id', 'code', 'name', 'status', 'created_at'].includes(sortBy) ? `g.${sortBy}` : 'g.id';
    const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT g.*, pc.name AS category_name FROM group_master g LEFT JOIN product_categories pc ON g.category_id = pc.id WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM group_master g LEFT JOIN product_categories pc ON g.category_id = pc.id WHERE ${where}`, params
    );
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});
groupMasterRoutes.get('/dropdown/by-category/:categoryId', async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const [rows] = await pool.query(
      `SELECT id, code, name, category_id, hsn_code, gst_rate FROM group_master WHERE status='Active' AND deleted_at IS NULL AND category_id = ? ORDER BY name ASC`,
      [categoryId]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});
groupMasterRoutes.post('/check-duplicate', ctrl.groupMasterController.checkDuplicate);
groupMasterRoutes.post('/bulk-delete', requireWriteAccess, ctrl.groupMasterController.bulkDelete);
groupMasterRoutes.post('/bulk-status', requireWriteAccess, ctrl.groupMasterController.bulkStatus);
groupMasterRoutes.post('/bulk-archive', requireWriteAccess, ctrl.groupMasterController.bulkArchive);
groupMasterRoutes.post('/', requireWriteAccess, ctrl.groupMasterController.create);
groupMasterRoutes.post('/:id/duplicate', validateId, requireWriteAccess, ctrl.groupMasterController.duplicateRecord);
groupMasterRoutes.post('/:id/restore', validateId, requireWriteAccess, ctrl.groupMasterController.restore);
groupMasterRoutes.get('/:id/audit', validateId, ctrl.groupMasterController.audit);
groupMasterRoutes.get('/:id', validateId, ctrl.groupMasterController.getOne);
groupMasterRoutes.put('/:id', validateId, requireWriteAccess, ctrl.groupMasterController.update);
groupMasterRoutes.delete('/:id', validateId, requireWriteAccess, ctrl.groupMasterController.remove);
groupMasterRoutes.delete('/:id/permanent', validateId, requireWriteAccess, ctrl.groupMasterController.permanentDelete);

// Machine routes
export const machineRoutes = createMasterRoutes(ctrl.machineController);

// Rate Master routes
export const rateMasterRoutes = createMasterRoutes(ctrl.rateMasterController);

// Role routes
export const roleRoutes = createMasterRoutes(ctrl.roleController);
// Add menu-access endpoints to roles
roleRoutes.get('/:id/menu-access', validateId, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT menu_path FROM role_menu_access WHERE role_id = ?', [req.params.id]);
    res.json({ data: rows.map(r => r.menu_path) });
  } catch (err) { next(err); }
});
roleRoutes.put('/:id/menu-access', validateId, async (req, res, next) => {
  try {
    const { paths } = req.body;
    if (!Array.isArray(paths)) return res.status(400).json({ error: 'paths array is required' });
    const roleId = req.params.id;
    await pool.query('DELETE FROM role_menu_access WHERE role_id = ?', [roleId]);
    if (paths.length > 0) {
      const values = paths.map(p => [roleId, p]);
      await pool.query('INSERT INTO role_menu_access (role_id, menu_path) VALUES ?', [values]);
    }
    res.json({ message: 'Menu access updated successfully!' });
  } catch (err) { next(err); }
});

// Company routes
export const companyRoutes = createMasterRoutes(ctrl.companyController);

// Business Unit routes
export const businessUnitRoutes = createMasterRoutes(ctrl.businessUnitController);

// Location/Rack routes
export const locationRackRoutes = createMasterRoutes(ctrl.locationRackController);

// Department routes
export const departmentRoutes = createMasterRoutes(ctrl.departmentController);

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
  groupMasterRoutes,
  machineRoutes,
  rateMasterRoutes,
  roleRoutes,
  companyRoutes,
  businessUnitRoutes,
  locationRackRoutes,
  departmentRoutes,
};
