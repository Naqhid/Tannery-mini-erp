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
    const { search, status, sortBy, sortOrder, includeArchived } = req.query;
    const { page, limit } = req;
    // Archived view: show only soft-deleted rows. Default view: show only active rows.
    let where = includeArchived === 'true' ? 'g.deleted_at IS NOT NULL' : 'g.deleted_at IS NULL';
    const params = [];
    if (search) {
      where += ' AND (g.name LIKE ? OR g.code LIKE ? OR g.hsn_code LIKE ? OR pc.name LIKE ?)';
      const t = `%${search}%`;
      params.push(t, t, t, t);
    }
    if (status) { where += ' AND g.status = ?'; params.push(status); }
    // Whitelist sortable columns. category_name maps to the joined product_categories.name.
    const sortMap = {
      id: 'g.id', code: 'g.code', name: 'g.name', status: 'g.status',
      created_at: 'g.created_at', hsn_code: 'g.hsn_code', gst_rate: 'g.gst_rate',
      category_name: 'pc.name',
    };
    const col = sortMap[sortBy] || 'g.id';
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
// Product Category is mandatory for a Group (enforced server-side, not just in the UI).
function requireCategory(req, res, next) {
  const cat = req.body?.category_id;
  if (cat === undefined || cat === null || cat === '') {
    return res.status(400).json({ error: 'Product category is required' });
  }
  next();
}
groupMasterRoutes.post('/check-duplicate', ctrl.groupMasterController.checkDuplicate);
groupMasterRoutes.post('/bulk-delete', requireWriteAccess, ctrl.groupMasterController.bulkDelete);
groupMasterRoutes.post('/bulk-status', requireWriteAccess, ctrl.groupMasterController.bulkStatus);
groupMasterRoutes.post('/bulk-archive', requireWriteAccess, ctrl.groupMasterController.bulkArchive);
groupMasterRoutes.post('/', requireWriteAccess, requireCategory, ctrl.groupMasterController.create);
groupMasterRoutes.post('/:id/duplicate', validateId, requireWriteAccess, ctrl.groupMasterController.duplicateRecord);
groupMasterRoutes.post('/:id/restore', validateId, requireWriteAccess, ctrl.groupMasterController.restore);
groupMasterRoutes.get('/:id/audit', validateId, ctrl.groupMasterController.audit);
groupMasterRoutes.get('/:id', validateId, ctrl.groupMasterController.getOne);
groupMasterRoutes.put('/:id', validateId, requireWriteAccess, requireCategory, ctrl.groupMasterController.update);
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

// Cost Component routes — custom list/dropdown to include joined group & uom names
export const costComponentRoutes = Router();
// A list query that resolves group_name and uom_name for display
costComponentRoutes.get('/', validatePagination, async (req, res, next) => {
  try {
    const { search, status, sortBy, sortOrder, group_id } = req.query;
    const { page, limit } = req;
    let where = 'cc.deleted_at IS NULL';
    const params = [];
    if (search) {
      where += ' AND (cc.name LIKE ? OR cc.code LIKE ? OR g.name LIKE ?)';
      const t = `%${search}%`;
      params.push(t, t, t);
    }
    if (status) { where += ' AND cc.status = ?'; params.push(status); }
    if (group_id) { where += ' AND cc.group_id = ?'; params.push(group_id); }
    const col = ['id', 'code', 'name', 'status', 'created_at', 'cost_per_uom'].includes(sortBy) ? `cc.${sortBy}` : 'cc.id';
    const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT cc.*, g.name AS group_name, u.name AS uom_name
       FROM cost_components cc
       LEFT JOIN group_master g ON cc.group_id = g.id
       LEFT JOIN uom u ON cc.uom_id = u.id
       WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM cost_components cc LEFT JOIN group_master g ON cc.group_id = g.id WHERE ${where}`, params
    );
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});
// Dropdown returns id/name plus group_name, uom_name, cost_per_uom for the
// consuming forms (General Cost / Machine Cost).
costComponentRoutes.get('/dropdown', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT cc.id, cc.code, cc.name, cc.group_id, cc.uom_id, cc.cost_per_uom,
              g.name AS group_name, u.name AS uom_name
       FROM cost_components cc
       LEFT JOIN group_master g ON cc.group_id = g.id
       LEFT JOIN uom u ON cc.uom_id = u.id
       WHERE cc.status='Active' AND cc.deleted_at IS NULL
       ORDER BY cc.name ASC`
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});
costComponentRoutes.get('/next-code', ctrl.costComponentController.nextCode);
costComponentRoutes.get('/stats', ctrl.costComponentController.stats);
costComponentRoutes.post('/check-duplicate', ctrl.costComponentController.checkDuplicate);
costComponentRoutes.post('/bulk-delete', requireWriteAccess, ctrl.costComponentController.bulkDelete);
costComponentRoutes.post('/bulk-status', requireWriteAccess, ctrl.costComponentController.bulkStatus);
costComponentRoutes.post('/bulk-archive', requireWriteAccess, ctrl.costComponentController.bulkArchive);
costComponentRoutes.post('/', requireWriteAccess, ctrl.costComponentController.create);
costComponentRoutes.post('/:id/duplicate', validateId, requireWriteAccess, ctrl.costComponentController.duplicateRecord);
costComponentRoutes.post('/:id/restore', validateId, requireWriteAccess, ctrl.costComponentController.restore);
costComponentRoutes.get('/:id/audit', validateId, ctrl.costComponentController.audit);
costComponentRoutes.get('/:id', validateId, ctrl.costComponentController.getOne);
costComponentRoutes.put('/:id', validateId, requireWriteAccess, ctrl.costComponentController.update);
costComponentRoutes.delete('/:id', validateId, requireWriteAccess, ctrl.costComponentController.remove);
costComponentRoutes.delete('/:id/permanent', validateId, requireWriteAccess, ctrl.costComponentController.permanentDelete);

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
  costComponentRoutes,
};
