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
