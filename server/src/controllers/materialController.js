import * as model from '../models/materialModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../../uploads/materials');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export async function list(req, res, next) {
  try {
    const { search, type, category, status, supplier, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { rows, total } = await model.getAll({ search, type, category, status, supplier, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const material = await model.getById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ data: material });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Material name is required' });
    if (!req.body.type) return res.status(400).json({ error: 'Material type is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(req.body, createdBy);
    res.status(201).json({ data: { id: result.id, code: result.code }, message: 'Material created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Material name is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Material not found' });
    res.json({ data: { id: req.params.id }, message: 'Material updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Material not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Material deleted successfully!' });
  } catch (err) {
    if (err.code === 'REFERENCE_ERROR') return res.status(400).json({ error: err.message });
    next(err);
  }
}

export async function dropdown(_req, res, next) {
  try {
    const rows = await model.getDropdown();
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = `/uploads/materials/${req.file.filename}`;
    await model.updateAttachment(req.params.id, filePath);
    res.json({ data: { file_path: filePath, file_name: req.file.originalname }, message: 'Attachment uploaded successfully!' });
  } catch (err) { next(err); }
}

export async function nextCode(_req, res, next) {
  try {
    const code = await model.getNextCode();
    res.json({ data: { code, next_code: code } });
  } catch (err) { next(err); }
}
