import * as model from '../models/costingReportModel.js';

export async function list(req, res, next) {
  try {
    const { search, customer, article, color, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getReport({ search, customer, article, color, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getFilters(req, res, next) {
  try {
    const filters = await model.getFilterOptions();
    res.json({ data: filters });
  } catch (err) { next(err); }
}

export async function getDetail(req, res, next) {
  try {
    const data = await model.getActualCostDetail(req.params.id);
    if (!data) return res.status(404).json({ error: 'Production plan not found' });
    res.json({ data });
  } catch (err) { next(err); }
}
