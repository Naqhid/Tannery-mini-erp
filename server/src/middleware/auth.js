import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tannery-erp-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role_id: user.role_id,
    role_code: user.role_code || null,
    access_level: user.access_level || 'read_write',
    company_id: user.company_id,
    business_unit_id: user.business_unit_id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.user = decoded;
  next();
}

export function requireAuth(req, res, next) {
  // If optionalAuth already verified the user, skip re-verification
  if (req.user) return next();
  return authMiddleware(req, res, next);
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // For now, we'll check role IDs
    // Admin = 1, Manager = 2, User = 3, Viewer = 4
    const userRoleId = req.user.role_id;

    if (!userRoleId && !allowedRoles.includes('guest')) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
}

export function requireWriteAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.access_level === 'read_only') {
    return res.status(403).json({ error: 'Access denied. You have read-only access.' });
  }

  next();
}

export function getCurrentUserId(req) {
  return req.user?.id || null;
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authMiddleware,
  requireAuth,
  optionalAuth,
  requireRole,
  getCurrentUserId,
};
