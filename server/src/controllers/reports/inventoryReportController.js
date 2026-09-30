import * as model from '../../models/reports/inventoryReportModel.js';

const shape = (res, { rows, total, totals }, page, limit) =>
  res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit), totals: totals || null });

export async function stockSummary(req, res, next) {
  try {
    const { warehouse_id, group_id, as_on_date, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.stockSummary({ warehouse_id, group_id, as_on_date, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function stockValuation(req, res, next) {
  try {
    const { warehouse_id, group_id, origin, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.stockValuation({ warehouse_id, group_id, origin, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function receiptRegister(req, res, next) {
  try {
    const { from_date, to_date, warehouse_id, supplier_id, origin, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.receiptRegister({ from_date, to_date, warehouse_id, supplier_id, origin, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function issueRegister(req, res, next) {
  try {
    const { from_date, to_date, warehouse_id, process_stage, origin, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.issueRegister({ from_date, to_date, warehouse_id, process_stage, origin, search, page, limit, sortBy, sortOrder });
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

export async function stockLedger(req, res, next) {
  try {
    const { from_date, to_date, warehouse_id, material_id, transaction_type, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const result = await model.stockLedger({ from_date, to_date, warehouse_id, material_id, transaction_type, search, page, limit, sortBy, sortOrder });
    shape(res, result, page, limit);
  } catch (err) { next(err); }
}

export async function filters(req, res, next) {
  try {
    res.json({ data: await model.getInventoryFilters() });
  } catch (err) { next(err); }
}

// READ-ONLY diagnostic: flags materials whose quantity disagrees across the
// three stock tables (warehouse_stock, material_transactions, stock_ledger).
// Does NOT modify or repair any data.
export async function consistencyCheck(req, res, next) {
  try {
    const tolerance = req.query.tolerance ? Number(req.query.tolerance) : 0.001;
    const result = await model.inventoryConsistencyCheck({ tolerance });
    res.json({
      data: result.discrepancies,
      checked: result.checked,
      discrepancy_count: result.discrepancies.length,
      note: 'Read-only diagnostic. No data was modified. Investigate flagged rows manually.',
    });
  } catch (err) { next(err); }
}
