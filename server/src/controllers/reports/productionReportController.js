import * as model from '../../models/reports/productionReportModel.js';

const shape = (res, { rows, total, totals }, page, limit) =>
  res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit), totals: totals || null });

export async function planSummary(req, res, next) {
  try {
    const { from_date, to_date, customer_id, status, search, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    shape(res, await model.planSummary({ from_date, to_date, customer_id, status, search, page, limit, sortBy, sortOrder }), page, limit);
  } catch (err) { next(err); }
}

export async function planVsActual(req, res, next) {
  try {
    const { from_date, to_date, customer_id, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.planVsActual({ from_date, to_date, customer_id, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function planStatus(req, res, next) {
  try {
    const { from_date, to_date, stage, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.planStatus({ from_date, to_date, stage, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function orderProductionPlan(req, res, next) {
  try {
    const { from_date, to_date, customer_id, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.orderProductionPlan({ from_date, to_date, customer_id, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function dailyProductionOutput(req, res, next) {
  try {
    const { from_date, to_date, stage, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.dailyProductionOutput({ from_date, to_date, stage, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function stageWiseProduction(req, res, next) {
  try {
    const { from_date, to_date, stage, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.stageWiseProduction({ from_date, to_date, stage, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function productionWip(req, res, next) {
  try {
    const { stage, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.productionWip({ stage, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function filters(req, res, next) {
  try {
    res.json({ data: await model.getProductionFilters() });
  } catch (err) { next(err); }
}
