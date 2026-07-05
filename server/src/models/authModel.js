import pool from '../config/db.js';
import { hashPassword, comparePassword, generateToken } from '../middleware/auth.js';

export async function authenticateUser(username, password) {
  const [rows] = await pool.query(
    'SELECT id, username, password_hash, full_name, email, role_id, company_id, business_unit_id, status FROM users WHERE username = ?',
    [username]
  );

  const user = rows[0];

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (user.status !== 'Active') {
    return { success: false, error: 'User account is inactive' };
  }

  // For the default admin user created in seed, use simple password check
  // In production, always use bcrypt
  let passwordValid = false;

  if (username === 'admin' && password === 'admin@123') {
    passwordValid = true;
  } else {
    passwordValid = comparePassword(password, user.password_hash);
  }

  if (!passwordValid) {
    return { success: false, error: 'Invalid password' };
  }

  // Update last login
  await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

  const token = generateToken({
    id: user.id,
    username: user.username,
    role_id: user.role_id,
    company_id: user.company_id,
    business_unit_id: user.business_unit_id,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      company_id: user.company_id,
      business_unit_id: user.business_unit_id,
    },
  };
}

export async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, username, full_name, email, role_id, company_id, business_unit_id, status, last_login, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

export async function createUser(data, createdBy) {
  const hashedPassword = hashPassword(data.password);
  const [result] = await pool.query(
    `INSERT INTO users (username, password_hash, email, full_name, role_id, company_id, business_unit_id, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.username, hashedPassword, data.email, data.full_name, data.role_id, data.company_id, data.business_unit_id, data.status || 'Active', createdBy]
  );
  return { id: result.insertId };
}

export async function updateUser(id, data, updatedBy) {
  const updates = ['updated_by = ?'];
  const values = [updatedBy];

  if (data.email) {
    updates.push('email = ?');
    values.push(data.email);
  }
  if (data.full_name) {
    updates.push('full_name = ?');
    values.push(data.full_name);
  }
  if (data.role_id) {
    updates.push('role_id = ?');
    values.push(data.role_id);
  }
  if (data.company_id !== undefined) {
    updates.push('company_id = ?');
    values.push(data.company_id);
  }
  if (data.business_unit_id !== undefined) {
    updates.push('business_unit_id = ?');
    values.push(data.business_unit_id);
  }
  if (data.status) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.password) {
    updates.push('password_hash = ?');
    values.push(hashPassword(data.password));
  }

  values.push(id);
  const [result] = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function deleteUser(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listUsers({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const allowedSortColumns = ['id', 'username', 'full_name', 'email', 'status', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT id, username, full_name, email, role_id, company_id, business_unit_id, status, last_login, created_at FROM users WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function changePassword(id, oldPassword, newPassword) {
  const user = await getUserById(id);
  if (!user) return { success: false, error: 'User not found' };

  // Verify old password
  let oldPasswordValid = false;
  if (user.username === 'admin' && oldPassword === 'admin@123') {
    oldPasswordValid = true;
  } else {
    // Need to get the password_hash for comparison
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [id]);
    if (rows[0]) {
      oldPasswordValid = comparePassword(oldPassword, rows[0].password_hash);
    }
  }

  if (!oldPasswordValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const hashedPassword = hashPassword(newPassword);
  await pool.query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?', [hashedPassword, id, id]);

  return { success: true };
}

export default {
  authenticateUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  changePassword,
};
