import * as model from '../models/salesOrderModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../../uploads/sales-orders');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// --- Sales Orders ---
export async function list(req, res, next) {
  try {
    const { search, status, customer_id, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { rows, total } = await model.getAll({ search, status, customer_id, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const order = await model.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ data: order });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.customer_id) return res.status(400).json({ error: 'Customer is required' });
    if (!data.order_date) return res.status(400).json({ error: 'Order date is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(data, items, createdBy);
    res.status(201).json({ data: result, message: 'Sales order created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.customer_id) return res.status(400).json({ error: 'Customer is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, data, items, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ data: { id: req.params.id }, message: 'Sales order updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Sales order deleted successfully!' });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

// --- Delivery Notes ---
export async function getDelivery(req, res, next) {
  try {
    const order = await model.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ data: { deliveries: order.deliveries, items: order.items } });
  } catch (err) { next(err); }
}

export async function createDelivery(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    const createdBy = req.user?.id || null;
    const result = await model.createDelivery(req.params.id, data, items, createdBy);
    res.status(201).json({ data: result, message: 'Delivery note created successfully!' });
  } catch (err) { next(err); }
}

export async function updateDelivery(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    const updatedBy = req.user?.id || null;
    const ok = await model.updateDelivery(req.params.dnId, data, items, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Delivery note not found' });
    res.json({ data: { id: req.params.dnId }, message: 'Delivery note updated successfully!' });
  } catch (err) { next(err); }
}

// --- Payment Receipts ---
export async function getPayments(req, res, next) {
  try {
    const order = await model.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ data: { receipts: order.receipts, invoices: order.invoices, order } });
  } catch (err) { next(err); }
}

export async function createReceipt(req, res, next) {
  try {
    const createdBy = req.user?.id || null;
    const result = await model.createReceipt(req.params.id, req.body, createdBy);
    res.status(201).json({ data: result, message: 'Payment receipt created successfully!' });
  } catch (err) { next(err); }
}

export async function deleteReceipt(req, res, next) {
  try {
    const ok = await model.deleteReceipt(req.params.receiptId);
    if (!ok) return res.status(404).json({ error: 'Receipt not found' });
    res.json({ data: { deleted: true }, message: 'Receipt deleted successfully!' });
  } catch (err) { next(err); }
}

// --- Attachments ---
export async function getAttachments(req, res, next) {
  try {
    const rows = await model.getAttachments(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const uploadedBy = req.user?.id || null;
    const ext = path.extname(req.file.originalname).substring(1).toUpperCase();
    const result = await model.addAttachment(req.params.id, {
      file_name: req.file.originalname,
      file_path: `/uploads/sales-orders/${req.file.filename}`,
      file_type: ext,
      category: req.body.category || 'Others',
      remarks: req.body.remarks || null,
    }, uploadedBy);
    res.status(201).json({ data: result, message: 'File uploaded successfully!' });
  } catch (err) { next(err); }
}

export async function deleteAttachment(req, res, next) {
  try {
    const ok = await model.deleteAttachment(req.params.attachmentId);
    if (!ok) return res.status(404).json({ error: 'Attachment not found' });
    res.json({ data: { deleted: true }, message: 'Attachment deleted successfully!' });
  } catch (err) { next(err); }
}
