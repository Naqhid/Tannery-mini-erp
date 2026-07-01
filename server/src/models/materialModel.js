import pool from '../config/db.js';

export async function getAll({ search, type }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (type) { where += ' AND type = ?'; params.push(type); }

  const [rows] = await pool.query(
    `SELECT * FROM materials WHERE ${where} ORDER BY id DESC`,
    params
  );
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM materials ORDER BY id DESC LIMIT 1");
  if (!row) return 'MAT-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `MAT-${String(num).padStart(5, '0')}`;
}

export async function create(data) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    'INSERT INTO materials (code, name, uom, type) VALUES (?,?,?,?)',
    [code, data.name, data.uom || 'Kg', data.type || 'Chemical']
  );
  return { id: result.insertId, code };
}

export async function update(id, data) {
  const [result] = await pool.query(
    'UPDATE materials SET name=?, uom=?, type=? WHERE id=?',
    [data.name, data.uom, data.type, id]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM materials WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
