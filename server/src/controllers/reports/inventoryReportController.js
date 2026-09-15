import * as model from '../../models/reports/inventoryReportModel.js';

const shape = (res, { rows, total, totals }, page, limit) =>
  res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit), totals: totals || null });

export async function stockSummary(req, res, next) {
  try {
    const { warehouse_id, group_id, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.stockSummary({ warehouse_id, group_id, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function stockValuation(req, res, next) {
  try {
    const { warehouse_id, group_id, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.stockValuation({ warehouse_id, group_id, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function receiptRegister(req, res, next) {
  try {
    const { from_date, to_date, warehouse_id, supplier_id, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.receiptRegister({ from_date, to_date, warehouse_id, supplier_id, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function issueRegister(req, res, next) {
  try {
    const { from_date, to_date, warehouse_id, process_stage, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.issueRegister({ from_date, to_date, warehouse_id, process_stage, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function stockMovement(req, res, next) {
  try {
    const { from_date, to_date, warehouse_id, material_id, transaction_type, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.stockMovement({ from_date, to_date, warehouse_id, material_id, transaction_type, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function filters(req, res, next) {
  try {
    res.json({ data: await model.getInventoryFilters() });
  } catch (err) { next(err); }
}
