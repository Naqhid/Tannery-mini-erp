/**
 * Creates a controller for simple master tables
 * @param {object} model - The model created by createMasterModel
 * @param {string} entityName - Human-readable name for error messages
 * @param {array} referenceChecks - Array of {table, field, entityName} to check before deletion
 */
export function createMasterController(model, entityName, referenceChecks = []) {

  async function list(req, res, next) {
    try {
      const { search, status, sortBy, sortOrder, includeArchived, ...restFilters } = req.query;
      const { page, limit } = req;
      const { rows, total } = await model.getAll({
        search, status, sortBy, sortOrder, page, limit,
        includeArchived: includeArchived === 'true',
        filters: restFilters,
      });
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

  async function checkDuplicate(req, res, next) {
    try {
      const result = await model.checkDuplicate(req.body, req.body.excludeId || null);
      if (result) {
        return res.status(409).json({
          isDuplicate: true,
          message: `A ${entityName} with this ${result.field} already exists`,
          existing: result.existing,
        });
      }
      res.json({ isDuplicate: false });
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
      const duplicate = await model.checkDuplicate(req.body);
      if (duplicate) {
        return res.status(409).json({
          error: `A ${entityName} with this ${duplicate.field} already exists`,
          field: duplicate.field,
        });
      }

      const result = await model.create(req.body, createdBy);
      res.status(201).json({
        data: { id: result.id, code: result.code },
        message: `${entityName} created successfully!`,
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `A ${entityName} with this code or name already exists` });
      }
      next(err);
    }
  }

  async function update(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: `${entityName} name is required` });
      }
      const updatedBy = req.user?.id || null;
      const duplicate = await model.checkDuplicate(req.body, req.params.id);
      if (duplicate) {
        return res.status(409).json({
          error: `A ${entityName} with this ${duplicate.field} already exists`,
          field: duplicate.field,
        });
      }
      const ok = await model.update(req.params.id, req.body, updatedBy);
      if (!ok) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: { id: req.params.id }, message: `${entityName} updated successfully!` });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `A ${entityName} with this code or name already exists` });
      }
      next(err);
    }
  }

  async function remove(req, res, next) {
    try {
      const id = req.params.id;
      for (const ref of referenceChecks) {
        const hasReferences = await model.checkReferences(ref.table, ref.field, id);
        if (hasReferences) {
          return res.status(400).json({
            error: `Cannot delete this ${entityName}. It is being referenced in ${ref.entityName || ref.table}.`,
          });
        }
      }
      const ok = await model.softDelete(id);
      if (!ok) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: { id, deleted: true }, message: `${entityName} archived successfully!` });
    } catch (err) {
      next(err);
    }
  }

  async function restore(req, res, next) {
    try {
      const ok = await model.restore(req.params.id);
      if (!ok) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: { id: req.params.id }, message: `${entityName} restored successfully!` });
    } catch (err) {
      next(err);
    }
  }

  async function permanentDelete(req, res, next) {
    try {
      const id = req.params.id;
      for (const ref of referenceChecks) {
        const hasReferences = await model.checkReferences(ref.table, ref.field, id);
        if (hasReferences) {
          return res.status(400).json({
            error: `Cannot permanently delete this ${entityName}. It is being referenced in ${ref.entityName || ref.table}.`,
          });
        }
      }
      const ok = await model.hardDelete(id);
      if (!ok) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data: { id, deleted: true }, message: `${entityName} permanently deleted!` });
    } catch (err) {
      next(err);
    }
  }

  async function bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array is required' });
      }
      const count = await model.bulkSoftDelete(ids);
      res.json({ data: { count }, message: `${count} ${entityName}(s) archived successfully!` });
    } catch (err) {
      next(err);
    }
  }

  async function bulkStatus(req, res, next) {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array is required' });
      }
      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ error: 'status must be Active or Inactive' });
      }
      const count = await model.bulkUpdateStatus(ids, status);
      res.json({ data: { count }, message: `${count} ${entityName}(s) updated to ${status}!` });
    } catch (err) {
      next(err);
    }
  }

  async function bulkArchive(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array is required' });
      }
      const count = await model.bulkArchive(ids);
      res.json({ data: { count }, message: `${count} ${entityName}(s) archived successfully!` });
    } catch (err) {
      next(err);
    }
  }

  async function duplicateRecord(req, res, next) {
    try {
      const result = await model.duplicate(req.params.id);
      if (!result) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.status(201).json({
        data: { id: result.id, code: result.code },
        message: `${entityName} duplicated successfully!`,
      });
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

  async function audit(req, res, next) {
    try {
      const data = await model.getAuditInfo(req.params.id);
      if (!data) {
        return res.status(404).json({ error: `${entityName} not found` });
      }
      res.json({ data });
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
    restore,
    permanentDelete,
    bulkDelete,
    bulkStatus,
    bulkArchive,
    duplicateRecord,
    checkDuplicate,
    stats,
    dropdown,
    audit,
  };
}

export default createMasterController;
