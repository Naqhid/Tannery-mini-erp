import * as model from '../models/productionPlanModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, customer_id, product_id, article, color, finish, sales_order_no, customer_order_no, from_date, to_date, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, customer_id, product_id, article, color, finish, sales_order_no, customer_order_no, from_date, to_date, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const plan = await model.getById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Production plan not found' });
    res.json({ data: plan });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { items = [], stages = [], ...data } = req.body;
    if (!data.plan_date) return res.status(400).json({ error: 'Plan date is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(data, items, stages, createdBy);
    res.status(201).json({ data: result, message: 'Production plan created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { items = [], stages = [], ...data } = req.body;
    if (!data.plan_date) return res.status(400).json({ error: 'Plan date is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, data, items, stages, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Production plan not found' });
    res.json({ data: { id: req.params.id }, message: 'Production plan updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.softDelete(req.params.id, req.user?.id || null);
    if (!ok) return res.status(404).json({ error: 'Production plan not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Production plan deleted successfully!' });
  } catch (err) { next(err); }
}

export async function bulkDelete(req, res, next) {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'No IDs provided' });
    const count = await model.bulkDelete(ids, req.user?.id || null);
    res.json({ data: { count }, message: `${count} production plan(s) deleted` });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function nextNo(_req, res, next) {
  try {
    const plan_no = await model.getNextNo();
    res.json({ data: { plan_no } });
  } catch (err) { next(err); }
}

export async function filterOptions(_req, res, next) {
  try {
    const data = await model.getFilterOptions();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function salesOrderItems(req, res, next) {
  try {
    const { search, status, customer_id, article, color } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getSalesOrderItems({ search, status, customer_id, article, color, page, limit });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}
