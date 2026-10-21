import * as model from '../models/materialRequirementModel.js';

// GET /api/material-requirement/sale-orders?search=...
export async function listOrders(req, res, next) {
  try {
    const rows = await model.listOrders({ search: req.query.search });
    res.json({ data: rows, total: rows.length });
  } catch (err) { next(err); }
}

// GET /api/material-requirement/:orderId
export async function getRequirements(req, res, next) {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId) || orderId < 1) {
      return res.status(400).json({ error: 'Invalid order ID parameter' });
    }
    const result = await model.getRequirements(orderId);
    if (!result) return res.status(404).json({ error: 'Sale order not found' });
    res.json({ data: result });
  } catch (err) { next(err); }
}
