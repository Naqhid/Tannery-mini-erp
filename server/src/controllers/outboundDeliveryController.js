import * as model from '../models/outboundDeliveryModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

export async function getOne(req, res, next) {
  try {
    const delivery = await model.getById(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Outbound delivery not found' });
    res.json({ data: delivery });
  } catch (error) { next(error); }
}

export async function nextNo(_req, res, next) {
  try { res.json({ data: { outbound_no: await model.getNextNo() } }); }
  catch (error) { next(error); }
}

export async function nextChallanNo(_req, res, next) {
  try { res.json({ data: { delivery_challan_no: await model.getNextChallanNo() } }); }
  catch (error) { next(error); }
}

export async function stats(_req, res, next) {
  try { res.json({ data: await model.getStats() }); }
  catch (error) { next(error); }
}

export async function create(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.outbound_date) return res.status(400).json({ error: 'Outbound date is required' });
    if (!data.from_warehouse_id) return res.status(400).json({ error: 'Warehouse is required' });
    if (!data.supplier_id) return res.status(400).json({ error: 'Supplier is required' });
    if (!items.length) return res.status(400).json({ error: 'At least one item is required' });
    const result = await model.create(data, items, req.user?.id || null);
    res.status(201).json({ data: result, message: 'Outbound delivery created successfully!' });
  } catch (error) {
    if (error.message?.includes('Insufficient stock') || error.message?.includes('Outbound quantity')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.outbound_date) return res.status(400).json({ error: 'Outbound date is required' });
    if (!data.from_warehouse_id) return res.status(400).json({ error: 'Warehouse is required' });
    if (!data.supplier_id) return res.status(400).json({ error: 'Supplier is required' });
    if (!items.length) return res.status(400).json({ error: 'At least one item is required' });
    const ok = await model.update(req.params.id, data, items, req.user?.id || null);
    if (!ok) return res.status(404).json({ error: 'Outbound delivery not found' });
    res.json({ data: { id: req.params.id }, message: 'Outbound delivery updated successfully!' });
  } catch (error) {
    if (error.message?.includes('Insufficient stock') || error.message?.includes('Outbound quantity')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Outbound delivery not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Outbound delivery removed and stock restored.' });
  } catch (error) { next(error); }
}
