import * as model from '../models/recipeModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const recipe = await model.getById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    const [items, stages, attachments] = await Promise.all([
      model.getItems(req.params.id),
      model.getStages(req.params.id),
      model.getAttachments(req.params.id),
    ]);
    res.json({ data: { ...recipe, items, stages, attachments } });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Recipe name is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(req.body, createdBy);
    res.status(201).json({ data: { id: result.id, code: result.code }, message: 'Recipe created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Recipe name is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ data: { id: req.params.id }, message: 'Recipe updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Recipe deleted successfully!' });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

// --- Recipe Items ---
export async function listItems(req, res, next) {
  try {
    const rows = await model.getItems(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function addItem(req, res, next) {
  try {
    if (!req.body.material_id) return res.status(400).json({ error: 'material_id is required' });
    const createdBy = req.user?.id || null;
    const result = await model.addItem(req.params.id, req.body, createdBy);
    res.status(201).json({ data: { id: result.id }, message: 'Item added successfully!' });
  } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
  try {
    const updatedBy = req.user?.id || null;
    const ok = await model.updateItem(req.params.itemId, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Recipe item not found' });
    res.json({ data: { id: req.params.itemId }, message: 'Item updated successfully!' });
  } catch (err) { next(err); }
}

export async function removeItem(req, res, next) {
  try {
    const ok = await model.removeItem(req.params.itemId);
    if (!ok) return res.status(404).json({ error: 'Recipe item not found' });
    res.json({ data: { id: req.params.itemId, deleted: true }, message: 'Item deleted successfully!' });
  } catch (err) { next(err); }
}

// --- Process Stages ---
export async function listStages(req, res, next) {
  try {
    const rows = await model.getStages(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function addStage(req, res, next) {
  try {
    const createdBy = req.user?.id || null;
    const result = await model.addStage(req.params.id, req.body, createdBy);
    res.status(201).json({ data: { id: result.id }, message: 'Stage added successfully!' });
  } catch (err) { next(err); }
}

export async function updateStage(req, res, next) {
  try {
    const updatedBy = req.user?.id || null;
    const ok = await model.updateStage(req.params.stageId, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Process stage not found' });
    res.json({ data: { id: req.params.stageId }, message: 'Stage updated successfully!' });
  } catch (err) { next(err); }
}

export async function removeStage(req, res, next) {
  try {
    const ok = await model.removeStage(req.params.stageId);
    if (!ok) return res.status(404).json({ error: 'Process stage not found' });
    res.json({ data: { id: req.params.stageId, deleted: true }, message: 'Stage deleted successfully!' });
  } catch (err) { next(err); }
}

// --- Attachments ---
export async function listAttachments(req, res, next) {
  try {
    const rows = await model.getAttachments(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function addAttachment(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const data = {
      file_name: req.file.originalname,
      file_path: req.file.path.replace(/\\/g, '/'),
      file_size: req.file.size,
      file_type: req.file.mimetype,
    };
    const uploadedBy = req.user?.id || null;
    const result = await model.addAttachment(req.params.id, data, uploadedBy);
    res.status(201).json({ data: { id: result.id, file_name: data.file_name }, message: 'Attachment uploaded successfully!' });
  } catch (err) { next(err); }
}

export async function removeAttachment(req, res, next) {
  try {
    const ok = await model.removeAttachment(req.params.attachmentId);
    if (!ok) return res.status(404).json({ error: 'Attachment not found' });
    res.json({ data: { id: req.params.attachmentId, deleted: true }, message: 'Attachment deleted successfully!' });
  } catch (err) { next(err); }
}

// --- Remarks ---
export async function getRemarks(req, res, next) {
  try {
    const remarks = await model.getRemarks(req.params.id);
    res.json({ data: { remarks } });
  } catch (err) { next(err); }
}

export async function updateRemarks(req, res, next) {
  try {
    const updatedBy = req.user?.id || null;
    const ok = await model.updateRemarks(req.params.id, req.body.remarks, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ data: { id: req.params.id }, message: 'Remarks updated successfully!' });
  } catch (err) { next(err); }
}

// --- BOM Items for Recipe ---
export async function getBOMItems(req, res, next) {
  try {
    const productId = req.params.productId;
    const rows = await model.getBOMItemsByProduct(productId);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

// --- Process Stage Parameters ---
export async function getStageParameters(req, res, next) {
  try {
    const processStageId = req.params.processStageId;
    const rows = await model.getStageParameters(processStageId);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function nextCode(_req, res, next) {
  try {
    const code = await model.getNextCode();
    res.json({ data: { code, next_code: code } });
  } catch (err) { next(err); }
}
