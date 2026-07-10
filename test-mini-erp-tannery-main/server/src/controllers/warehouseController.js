import * as model from '../models/warehouseModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../../uploads/warehouses');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export async function list(req, res, next) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const wh = await model.getById(req.params.id);
    if (!wh) return res.status(404).json({ error: 'Warehouse not found' });
    res.json({ data: wh });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Warehouse name is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(req.body, createdBy);
    res.status(201).json({ data: result, message: 'Warehouse created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Warehouse name is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Warehouse not found' });
    res.json({ data: { id: req.params.id }, message: 'Warehouse updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const result = await model.remove(req.params.id);
    if (!result.deleted) return res.status(400).json({ error: result.reason });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Warehouse deleted successfully!' });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function dropdown(_req, res, next) {
  try {
    const rows = await model.getDropdown();
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getStock(req, res, next) {
  try {
    const { getWarehouseStock } = await import('../models/stockLedgerModel.js');
    const rows = await getWarehouseStock(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const uploadedBy = req.user?.id || null;
    const result = await model.addAttachment(req.params.id, {
      file_name: req.file.originalname,
      file_path: `/uploads/warehouses/${req.file.filename}`,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      document_type: req.body.document_type || null,
    }, uploadedBy);
    res.status(201).json({ data: result, message: 'File uploaded successfully!' });
  } catch (err) { next(err); }
}

export async function deleteAttachment(req, res, next) {
  try {
    const ok = await model.deleteAttachment(req.params.attachmentId);
    if (!ok) return res.status(404).json({ error: 'Attachment not found' });
    res.json({ message: 'Attachment deleted successfully!' });
  } catch (err) { next(err); }
}
