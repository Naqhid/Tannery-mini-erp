import * as model from '../models/productionStatusModel.js';

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function listOrders(req, res, next) {
  try {
    const { search, process_stage, show_completed, status_filter, has_transactions, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getOrders({ process_stage, show_completed, status_filter, search, has_transactions, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getOrder(req, res, next) {
  try {
    const data = await model.getOrderById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Order not found' });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createOrder(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const result = await model.createOrder(req.body, userId);
    res.status(201).json({ data: result, message: 'Order created successfully!' });
  } catch (err) { next(err); }
}

export async function updateOrder(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.updateOrder(req.params.id, req.body, userId);
    if (!ok) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: { id: req.params.id }, message: 'Order updated successfully!' });
  } catch (err) { next(err); }
}

export async function deleteOrder(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.deleteOrder(req.params.id, userId);
    if (!ok) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: { id: req.params.id }, message: 'Order deleted successfully!' });
  } catch (err) { next(err); }
}

// ─── Transactions ────────────────────────────────────────────────────────────

export async function listTransactions(req, res, next) {
  try {
    const { production_status_order_id, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    if (!production_status_order_id) return res.status(400).json({ error: 'production_status_order_id is required' });
    const { rows, total, summary } = await model.getTransactions({ production_status_order_id, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit), summary });
  } catch (err) { next(err); }
}

export async function getTransaction(req, res, next) {
  try {
    const data = await model.getTransactionById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getNextNo(_req, res, next) {
  try {
    const transaction_no = await model.getNextTransactionNo();
    res.json({ data: { transaction_no } });
  } catch (err) { next(err); }
}

export async function createTransaction(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const result = await model.createTransaction(req.body, userId);
    res.status(201).json({ data: result, message: 'Transaction created successfully!' });
  } catch (err) { next(err); }
}

export async function updateTransaction(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.updateTransaction(req.params.id, req.body, userId);
    if (!ok) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ data: { id: req.params.id }, message: 'Transaction updated successfully!' });
  } catch (err) { next(err); }
}

export async function deleteTransaction(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.deleteTransaction(req.params.id, userId);
    if (!ok) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ data: { id: req.params.id }, message: 'Transaction deleted successfully!' });
  } catch (err) { next(err); }
}


export async function dateSummary(req, res, next) {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: 'date is required' });
    const data = await model.getOrderDateSummary(req.params.id, date);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function postOrder(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.postOrder(req.params.id, userId);
    if (!ok) return res.status(404).json({ error: 'Record not found or already posted' });
    res.json({ data: { id: req.params.id, status: 'Posted' }, message: 'Posted successfully!' });
  } catch (err) {
    if (err.message?.includes('already posted')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}
