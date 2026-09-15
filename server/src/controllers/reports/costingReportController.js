import * as model from '../../models/reports/costingReportModel.js';

const shape = (res, { rows, total, totals }, page, limit) =>
  res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit), totals: totals || null });

export async function wipCostSheet(req, res, next) {
  try {
    const { stage, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.wipCostSheet({ stage, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function fullOrderCostSheet(req, res, next) {
  try {
    const { customer, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.fullOrderCostSheet({ customer, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function stageCostSummary(req, res, next) {
  try {
    const { from_date, to_date, stage, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.stageCostSummary({ from_date, to_date, stage, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function standardVsActual(req, res, next) {
  try {
    const { from_date, to_date, search } = req.query;
    const { page, limit } = req;
    shape(res, await model.standardVsActual({ from_date, to_date, search, page, limit }), page, limit);
  } catch (err) { next(err); }
}

export async function filters(req, res, next) {
  try {
    res.json({ data: await model.getCostingFilters() });
  } catch (err) { next(err); }
}
