import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireAuth } from '../middleware/auth.js';
import * as authModel from '../models/authModel.js';
import pool from '../config/db.js';

const router = Router();

// Users CRUD (optionalAuth is applied globally in server.js, so req.user is available)
router.get('/users', validatePagination, async (req, res, next) => {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await authModel.listUsers({ search, status, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
});

router.get('/users/:id', validateId, async (req, res, next) => {
  try {
    const user = await authModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.post('/users', requireAuth, async (req, res, next) => {
  try {
    const { username, password, email, full_name, role_id, company_id, business_unit_id, status } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Username, password and full name are required' });
    }
    const createdBy = req.user?.id || null;
    const result = await authModel.createUser({
      username, password, email, full_name, role_id, company_id, business_unit_id, status
    }, createdBy);
    res.status(201).json({ data: result, message: 'User created successfully!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    next(err);
  }
});

router.put('/users/:id', validateId, requireAuth, async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const ok = await authModel.updateUser(req.params.id, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    res.json({ data: { id: req.params.id }, message: 'User updated successfully!' });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', validateId, requireAuth, async (req, res, next) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const ok = await authModel.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'User deleted successfully!' });
  } catch (err) {
    next(err);
  }
});

// Roles CRUD
import { roleController } from '../controllers/masterControllers.js';
import pool from '../config/db.js';
const rolesRouter = Router();
rolesRouter.get('/', validatePagination, roleController.list);
rolesRouter.get('/dropdown', roleController.dropdown);
rolesRouter.get('/stats', roleController.stats);
rolesRouter.get('/:id', validateId, roleController.getOne);
rolesRouter.get('/:id/menu-access', validateId, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT menu_path FROM role_menu_access WHERE role_id = ?', [req.params.id]);
    res.json({ data: rows.map(r => r.menu_path) });
  } catch (err) { next(err); }
});
rolesRouter.post('/', roleController.create);
rolesRouter.put('/:id', validateId, roleController.update);
rolesRouter.put('/:id/menu-access', validateId, async (req, res, next) => {
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
rolesRouter.delete('/:id', validateId, roleController.remove);

// Companies CRUD
import { companyController } from '../controllers/masterControllers.js';
const companiesRouter = Router();
companiesRouter.get('/', validatePagination, companyController.list);
companiesRouter.get('/dropdown', companyController.dropdown);
companiesRouter.get('/stats', companyController.stats);
companiesRouter.get('/:id', validateId, companyController.getOne);
companiesRouter.post('/', companyController.create);
companiesRouter.put('/:id', validateId, companyController.update);
companiesRouter.delete('/:id', validateId, companyController.remove);

// Business Units CRUD
import { businessUnitController } from '../controllers/masterControllers.js';
const businessUnitsRouter = Router();
businessUnitsRouter.get('/', validatePagination, businessUnitController.list);
businessUnitsRouter.get('/dropdown', businessUnitController.dropdown);
businessUnitsRouter.get('/stats', businessUnitController.stats);
businessUnitsRouter.get('/:id', validateId, businessUnitController.getOne);
businessUnitsRouter.post('/', businessUnitController.create);
businessUnitsRouter.put('/:id', validateId, businessUnitController.update);
businessUnitsRouter.delete('/:id', validateId, businessUnitController.remove);

export default {
  usersRouter: router,
  rolesRouter,
  companiesRouter,
  businessUnitsRouter,
};
