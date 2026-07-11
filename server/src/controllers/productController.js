import * as model from '../models/productModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const product = await model.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Product name is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(req.body, createdBy);
    res.status(201).json({ data: { id: result.id, code: result.code }, message: 'Product created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Product name is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: { id: req.params.id }, message: 'Product updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await model.remove(req.params.id);
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Product deleted successfully!' });
  } catch (err) {
    if (err.code === 'REFERENCE_ERROR') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function dropdown(_req, res, next) {
  try {
    const rows = await model.getDropdown();
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function restore(req, res, next) {
  try {
    const ok = await model.restore(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: { id: req.params.id }, message: 'Product restored successfully!' });
  } catch (err) { next(err); }
}

export async function bulkDelete(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });
    const count = await model.bulkSoftDelete(ids);
    res.json({ data: { count }, message: `${count} product(s) archived successfully!` });
  } catch (err) { next(err); }
}

export async function bulkStatus(req, res, next) {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });
    if (!['Active', 'Inactive'].includes(status)) return res.status(400).json({ error: 'status must be Active or Inactive' });
    const count = await model.bulkUpdateStatus(ids, status);
    res.json({ data: { count }, message: `${count} product(s) updated to ${status}!` });
  } catch (err) { next(err); }
}

export async function bulkArchive(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });
    const count = await model.bulkArchive(ids);
    res.json({ data: { count }, message: `${count} product(s) archived successfully!` });
  } catch (err) { next(err); }
}

export async function duplicateRecord(req, res, next) {
  try {
    const result = await model.duplicate(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.status(201).json({ data: { id: result.id, code: result.code }, message: 'Product duplicated successfully!' });
  } catch (err) { next(err); }
}

export async function checkDuplicate(req, res, next) {
  try {
    const result = await model.checkDuplicate(req.body, req.body.excludeId || null);
    if (result) return res.status(409).json({ isDuplicate: true, message: `A product with this ${result.field} already exists`, existing: result.existing });
    res.json({ isDuplicate: false });
  } catch (err) { next(err); }
}

export async function audit(req, res, next) {
  try {
    const data = await model.getAuditInfo(req.params.id);
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json({ data });
  } catch (err) { next(err); }
}
