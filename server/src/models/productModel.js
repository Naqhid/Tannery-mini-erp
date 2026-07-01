import pool from '../config/db.js';

export async function getAll({ search, status, page, limit }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ? OR category LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM products ORDER BY id DESC LIMIT 1");
  if (!row) return 'PRD-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `PRD-${String(num).padStart(5, '0')}`;
}

export async function create(data) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO products (code, name, category, leather_type, uom, thickness, color, finish_type, description, standard_size, grade, sales_price, hsn_code, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.category, data.leather_type, data.uom, data.thickness,
     data.color, data.finish_type, data.description, data.standard_size,
     data.grade, data.sales_price, data.hsn_code, data.status || 'Active']
  );
  return { id: result.insertId, code };
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE products SET name=?, category=?, leather_type=?, uom=?, thickness=?, color=?, finish_type=?, description=?, standard_size=?, grade=?, sales_price=?, hsn_code=?, status=? WHERE id=?`,
    [data.name, data.category, data.leather_type, data.uom, data.thickness,
     data.color, data.finish_type, data.description, data.standard_size,
     data.grade, data.sales_price, data.hsn_code, data.status, id]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM products');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM products WHERE status='Active'");
  return { total: total.total, active: active.total };
}
