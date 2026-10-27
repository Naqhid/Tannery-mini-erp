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

// Parse a date-only value (YYYY-MM-DD or ISO) into a UTC day timestamp, so
// comparisons ignore the time-of-day component. Returns null when empty/invalid.
function toDay(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Delivery Date must be strictly later than both the Order Date and the order's
// creation date. Applies to the header delivery_date and every line item's
// delivery_date. `createdAt` is "now" for new orders, or the stored created_at
// for updates. Returns an error message string, or null when valid.
function validateDeliveryDates(data, items, createdAt) {
  const orderDay = toDay(data.order_date);
  const createdDay = toDay(createdAt);
  // The latest of order date / creation date is the floor the delivery must beat.
  const floor = Math.max(orderDay ?? -Infinity, createdDay ?? -Infinity);
  if (!Number.isFinite(floor)) return null;

  const check = (value, label) => {
    const day = toDay(value);
    if (day == null) return null;
    if (day <= floor) {
      return `${label} must be later than both the Order Date and the order creation date.`;
    }
    return null;
  };

  const headerErr = check(data.delivery_date, 'Delivery Date');
  if (headerErr) return headerErr;

  for (let i = 0; i < (items || []).length; i++) {
    const itemErr = check(items[i].delivery_date, `Delivery Date for item ${i + 1}`);
    if (itemErr) return itemErr;
  }
  return null;
}

export async function create(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.customer_id) return res.status(400).json({ error: 'Customer is required' });
    if (!data.order_date) return res.status(400).json({ error: 'Order date is required' });
    // New order: creation date is now.
    const dateErr = validateDeliveryDates(data, items, new Date());
    if (dateErr) return res.status(400).json({ error: dateErr });
    const createdBy = req.user?.id || null;
    const result = await model.create(data, items, createdBy);
    res.status(201).json({ data: result, message: 'Sales order created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.customer_id) return res.status(400).json({ error: 'Customer is required' });
    // Validate against the stored creation date (falls back to order_date).
    const existing = await model.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Sales order not found' });
    const dateErr = validateDeliveryDates(data, items, existing.created_at);
    if (dateErr) return res.status(400).json({ error: dateErr });
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

export async function resyncStatuses(_req, res, next) {
  try {
    const data = await model.resyncAllStatuses();
    res.json({ data, message: `Resynced ${data.updated} of ${data.total} sales orders` });
  } catch (err) { next(err); }
}

export async function nextNo(_req, res, next) {
  try {
    const order_no = await model.getNextOrderNo();
    res.json({ data: { order_no } });
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

export async function updateAttachment(req, res, next) {
  try {
    const ok = await model.updateAttachment(req.params.attachmentId, req.body);
    if (!ok) return res.status(404).json({ error: 'Attachment not found' });
    res.json({ data: { id: req.params.attachmentId }, message: 'Attachment updated successfully!' });
  } catch (err) { next(err); }
}

// --- Delivery Delete ---
export async function deleteDelivery(req, res, next) {
  try {
    const ok = await model.deleteDelivery(req.params.dnId);
    if (!ok) return res.status(404).json({ error: 'Delivery note not found' });
    res.json({ data: { deleted: true }, message: 'Delivery note deleted successfully!' });
  } catch (err) { next(err); }
}

// --- Payment Receipt Update ---
export async function updateReceipt(req, res, next) {
  try {
    const ok = await model.updateReceipt(req.params.receiptId, req.body);
    if (!ok) return res.status(404).json({ error: 'Receipt not found' });
    res.json({ data: { id: req.params.receiptId }, message: 'Receipt updated successfully!' });
  } catch (err) { next(err); }
}

// --- Invoices ---
export async function createInvoice(req, res, next) {
  try {
    const createdBy = req.user?.id || null;
    const result = await model.createInvoice(req.params.id, req.body, createdBy);
    res.status(201).json({ data: result, message: 'Invoice created successfully!' });
  } catch (err) { next(err); }
}

export async function updateInvoice(req, res, next) {
  try {
    const ok = await model.updateInvoice(req.params.invoiceId, req.body);
    if (!ok) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ data: { id: req.params.invoiceId }, message: 'Invoice updated successfully!' });
  } catch (err) { next(err); }
}

export async function deleteInvoice(req, res, next) {
  try {
    const ok = await model.deleteInvoice(req.params.invoiceId);
    if (!ok) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ data: { deleted: true }, message: 'Invoice deleted successfully!' });
  } catch (err) { next(err); }
}
