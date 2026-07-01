import * as model from '../models/recipeModel.js';

export async function list(req, res, next) {
  try {
    const { search, status } = req.query;
    const rows = await model.getAll({ search, status });
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const recipe = await model.getById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    const [items, stages] = await Promise.all([
      model.getItems(req.params.id),
      model.getStages(req.params.id),
    ]);
    res.json({ data: { ...recipe, items, stages } });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Recipe name is required' });
    const result = await model.create(req.body);
    res.status(201).json({ data: { id: result.id, code: result.code } });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Recipe name is required' });
    const ok = await model.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ data: { id: req.params.id } });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
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
    const result = await model.addItem(req.params.id, req.body);
    res.status(201).json({ data: { id: result.id } });
  } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
  try {
    const ok = await model.updateItem(req.params.itemId, req.body);
    if (!ok) return res.status(404).json({ error: 'Recipe item not found' });
    res.json({ data: { id: req.params.itemId } });
  } catch (err) { next(err); }
}

export async function removeItem(req, res, next) {
  try {
    const ok = await model.removeItem(req.params.itemId);
    if (!ok) return res.status(404).json({ error: 'Recipe item not found' });
    res.json({ data: { id: req.params.itemId, deleted: true } });
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
    if (!req.body.process_stage) return res.status(400).json({ error: 'process_stage is required' });
    const result = await model.addStage(req.params.id, req.body);
    res.status(201).json({ data: { id: result.id } });
  } catch (err) { next(err); }
}

export async function updateStage(req, res, next) {
  try {
    const ok = await model.updateStage(req.params.stageId, req.body);
    if (!ok) return res.status(404).json({ error: 'Process stage not found' });
    res.json({ data: { id: req.params.stageId } });
  } catch (err) { next(err); }
}

export async function removeStage(req, res, next) {
  try {
    const ok = await model.removeStage(req.params.stageId);
    if (!ok) return res.status(404).json({ error: 'Process stage not found' });
    res.json({ data: { id: req.params.stageId, deleted: true } });
  } catch (err) { next(err); }
}
