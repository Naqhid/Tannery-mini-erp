export function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((f) => {
      const v = req.body[f];
      return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    });
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

export function validateId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  req.params.id = id;
  next();
}

export function validatePagination(req, res, next) {
  req.query.page = Math.max(1, parseInt(req.query.page, 10) || 1);
  req.query.limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  req.page = req.query.page;
  req.limit = req.query.limit;
  next();
}
