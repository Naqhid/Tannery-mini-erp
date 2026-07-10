/**
 * Creates a controller for simple master tables
 * @param {object} model - The model created by createMasterModel
 * @param {string} entityName - Human-readable name for error messages
 * @param {array} referenceChecks - Array of {table, field} to check before deletion
 */

export function createMasterController(model, entityName, referenceChecks = []) {
  async function list(req, res, next) {
    try {
      const { search, status, sortBy, sortOrder } = req.query;
      const { page, limit } = req;
      const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
      const totalPages = Math.ceil(total / limit);
      res.json({ data: rows, total, page, limit, totalPages });
    } catch (err) {
      next(err);
    }
  }

  async function getOne(req, res, next) {
    try {
      const record = await model.getById(req.params.id);
      if (!record) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  }

  async function create(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: `${entityName} name is required` });
      }
      const createdBy = req.user?.id || null;
      const result = await model.create(req.body, createdBy);
      res.status(201).json({
        data: { id: result.id, code: result.code },
        message: `${entityName} created successfully!`,
      });
    } catch (err) {
      next(err);
    }
  }

  async function update(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: `${entityName} name is required` });
      }
      const updatedBy = req.user?.id || null;
      const ok = await model.update(req.params.id, req.body, updatedBy);
      if (!ok) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: { id: req.params.id }, message: `${entityName} updated successfully!` });
    } catch (err) {
      next(err);
    }
  }

  async function remove(req, res, next) {
    try {
      const id = req.params.id;

      // Check references before deletion
      for (const ref of referenceChecks) {
        const hasReferences = await model.checkReferences(ref.table, ref.field, id);
        if (hasReferences) {
          return res.status(400).json({
            error: `Cannot delete this ${entityName}. It is being referenced in ${ref.entityName || ref.table}.`,
          });
        }
      }

      const ok = await model.remove(id);
      if (!ok) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: { id, deleted: true }, message: `${entityName} deleted successfully!` });
    } catch (err) {
      next(err);
    }
  }

  async function stats(_req, res, next) {
    try {
      const data = await model.getStats();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async function dropdown(_req, res, next) {
    try {
      const { rows } = await model.getAll({ status: 'Active', page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' });
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }

  return {
    list,
    getOne,
    create,
    update,
    remove,
    stats,
    dropdown,
  };
}

export default createMasterController;
