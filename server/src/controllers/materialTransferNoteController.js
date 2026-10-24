import * as model from '../models/materialTransferNoteModel.js';

// GET /api/material-transfer-notes/plans?search=&status=&stage=&page=&limit=
export async function listPlans(req, res, next) {
  try {
    const { search, status, stage, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.listPlans({ search, status, stage, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

// GET /api/material-transfer-notes/stage-options
export async function stageOptions(_req, res, next) {
  try {
    const data = await model.getStageOptions();
    res.json({ data });
  } catch (err) { next(err); }
}

// GET /api/material-transfer-notes/:planId
export async function getPlanTransfer(req, res, next) {
  try {
    const planId = parseInt(req.params.planId, 10);
    if (isNaN(planId) || planId < 1) {
      return res.status(400).json({ error: 'Invalid plan ID parameter' });
    }
    const result = await model.getPlanTransfer(planId);
    if (!result) return res.status(404).json({ error: 'Production plan not found' });
    res.json({ data: result });
  } catch (err) { next(err); }
}
