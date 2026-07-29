import * as model from '../models/authModel.js';
import { getCurrentUserId, generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';
import pool from '../config/db.js';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await model.authenticateUser(username, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken(result.user);

    // Fetch menu access for the user's role
    let menu_access = [];
    if (result.user.role_id) {
      const [rows] = await pool.query('SELECT menu_path FROM role_menu_access WHERE role_id = ?', [result.user.role_id]);
      menu_access = rows.map(r => r.menu_path);
    }

    res.json({
      message: 'Login successful',
      token: result.token,
      refreshToken,
      user: { ...result.user, menu_access },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Get fresh user data
    const user = await model.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newToken = generateToken(user);
    // Generate new refresh token (rotate)
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await model.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch menu access for the user's role
    let menu_access = [];
    if (user.role_id) {
      const [rows] = await pool.query('SELECT menu_path FROM role_menu_access WHERE role_id = ?', [user.role_id]);
      menu_access = rows.map(r => r.menu_path);
    }

    res.json({ data: { ...user, menu_access } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Both old and new passwords are required' });
    }

    const result = await model.changePassword(userId, oldPassword, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Optionally, you could implement token blacklisting
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export default {
  login,
  me,
  changePassword,
  logout,
};
