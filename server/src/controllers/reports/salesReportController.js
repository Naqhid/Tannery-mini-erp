import * as model from '../../models/reports/salesReportModel.js';

const shape = (res, { rows, total, totals }, page, limit) =>
  res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit), totals: totals || null });

export async function summary(req, res, next) {
  try {
    const { from_date, to_date, customer_id, status, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.salesOrderSummary({ from_date, to_date, customer_id, status, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function fulfillment(req, res, next) {
  try {
    const { from_date, to_date, customer_id, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.orderFulfillment({ from_date, to_date, customer_id, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function open(req, res, next) {
  try {
    const { customer_id, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.openSalesOrders({ customer_id, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function productionTracking(req, res, next) {
  try {
    const { customer_id, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.salesOrderProductionTracking({ customer_id, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function filters(req, res, next) {
  try {
    res.json({ data: await model.getSalesFilters() });
  } catch (err) { next(err); }
}
