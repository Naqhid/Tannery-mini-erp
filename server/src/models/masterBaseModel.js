/**
 * Creates a model for simple master tables with CRUD operations
 * @param {string} tableName - Name of the database table
 * @param {string} codePrefix - Prefix for auto-generated codes (e.g., 'CAT' for product_categories)
 * @param {string[]} listFields - Fields to fetch in list queries
 * @param {string[]} searchFields - Fields to search in
 */

import pool from '../config/db.js';

export function createMasterModel(tableName, codePrefix, listFields, searchFields) {
  const _tableName = tableName;
  const _codePrefix = codePrefix;
  const _listFields = listFields || ['id', 'code', 'name', 'status', 'created_at', 'updated_at'];
  const _searchFields = searchFields || ['name', 'code'];

  async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
    let where = '1=1';
    const params = [];

    if (search) {
      where += ` AND (${_searchFields.map(f => `\`${f}\` LIKE ?`).join(' OR ')})`;
      const term = `%${search}%`;
      params.push(..._searchFields.map(() => term));
    }
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    const allowedSortColumns = ['id', 'code', 'name', 'status', 'created_at'];
    const column = allowedSortColumns.includes(sortBy) ? `\`${sortBy}\`` : '`id`';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;
    const escapedListFields = _listFields.map(f => `\`${f}\``).join(', ');
    const [rows] = await pool.query(
      `SELECT ${escapedListFields} FROM ${_tableName} WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${_tableName} WHERE ${where}`,
      params
    );
    return { rows, total };
  }

  async function getById(id) {
    const [rows] = await pool.query(`SELECT * FROM ${_tableName} WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  async function getByCode(code) {
    const [rows] = await pool.query(`SELECT * FROM ${_tableName} WHERE code = ?`, [code]);
    return rows[0] || null;
  }

  async function getNextCode() {
    const [[row]] = await pool.query(
      `SELECT code FROM ${_tableName} ORDER BY id DESC LIMIT 1`
    );
    if (!row) return `${_codePrefix}-00001`;
    const num = parseInt(row.code.split('-')[1], 10) + 1;
    return `${_codePrefix}-${String(num).padStart(5, '0')}`;
  }

  async function create(data, createdBy = null) {
    const code = data.code || await getNextCode();

    // Build columns and values from data
    const columns = ['code'];
    const values = [code];

    if (data.name !== undefined) { columns.push('name'); values.push(data.name); }
    if (data.description !== undefined) { columns.push('description'); values.push(data.description); }
    if (data.status !== undefined) { columns.push('status'); values.push(data.status); }
    if (data.value_mm !== undefined) { columns.push('value_mm'); values.push(data.value_mm); }
    if (data.rank !== undefined) { columns.push('rank'); values.push(data.rank); }
    if (data.hex_code !== undefined) { columns.push('hex_code'); values.push(data.hex_code); }
    if (data.seq !== undefined) { columns.push('seq'); values.push(data.seq); }
    if (data.gst_rate !== undefined) { columns.push('gst_rate'); values.push(data.gst_rate); }
    if (data.machine_type !== undefined) { columns.push('machine_type'); values.push(data.machine_type); }
    if (data.capacity !== undefined) { columns.push('capacity'); values.push(data.capacity); }
    if (data.process_stage_id !== undefined) { columns.push('process_stage_id'); values.push(data.process_stage_id); }
    if (data.parameter_name !== undefined) { columns.push('parameter_name'); values.push(data.parameter_name); }
    if (data.unit !== undefined) { columns.push('unit'); values.push(data.unit); }
    if (data.default_value !== undefined) { columns.push('default_value'); values.push(data.default_value); }
    if (data.min_value !== undefined) { columns.push('min_value'); values.push(data.min_value); }
    if (data.max_value !== undefined) { columns.push('max_value'); values.push(data.max_value); }
    if (data.required !== undefined) { columns.push('required'); values.push(data.required ? 1 : 0); }
    if (data.phone_code !== undefined) { columns.push('phone_code'); values.push(data.phone_code); }
    if (data.country_id !== undefined) { columns.push('country_id'); values.push(data.country_id); }
    if (data.state_id !== undefined) { columns.push('state_id'); values.push(data.state_id); }
    if (data.pincode !== undefined) { columns.push('pincode'); values.push(data.pincode); }
    if (data.company_id !== undefined) { columns.push('company_id'); values.push(data.company_id); }
    if (createdBy !== null) { columns.push('created_by'); values.push(createdBy); }

    const placeholders = values.map(() => '?').join(', ');
    const escapedColumns = columns.map(c => `\`${c}\``).join(', ');
    const [result] = await pool.query(
      `INSERT INTO ${_tableName} (${escapedColumns}) VALUES (${placeholders})`,
      values
    );
    return { id: result.insertId, code };
  }

  async function update(id, data, updatedBy = null) {
    const updates = [];
    const values = [];

    if (data.code !== undefined) { updates.push('`code` = ?'); values.push(data.code); }
    if (data.name !== undefined) { updates.push('`name` = ?'); values.push(data.name); }
    if (data.description !== undefined) { updates.push('`description` = ?'); values.push(data.description); }
    if (data.status !== undefined) { updates.push('`status` = ?'); values.push(data.status); }
    if (data.value_mm !== undefined) { updates.push('`value_mm` = ?'); values.push(data.value_mm); }
    if (data.rank !== undefined) { updates.push('`rank` = ?'); values.push(data.rank); }
    if (data.hex_code !== undefined) { updates.push('`hex_code` = ?'); values.push(data.hex_code); }
    if (data.seq !== undefined) { updates.push('`seq` = ?'); values.push(data.seq); }
    if (data.gst_rate !== undefined) { updates.push('`gst_rate` = ?'); values.push(data.gst_rate); }
    if (data.machine_type !== undefined) { updates.push('`machine_type` = ?'); values.push(data.machine_type); }
    if (data.capacity !== undefined) { updates.push('`capacity` = ?'); values.push(data.capacity); }
    if (data.process_stage_id !== undefined) { updates.push('`process_stage_id` = ?'); values.push(data.process_stage_id); }
    if (data.parameter_name !== undefined) { updates.push('`parameter_name` = ?'); values.push(data.parameter_name); }
    if (data.unit !== undefined) { updates.push('`unit` = ?'); values.push(data.unit); }
    if (data.default_value !== undefined) { updates.push('`default_value` = ?'); values.push(data.default_value); }
    if (data.min_value !== undefined) { updates.push('`min_value` = ?'); values.push(data.min_value); }
    if (data.max_value !== undefined) { updates.push('`max_value` = ?'); values.push(data.max_value); }
    if (data.required !== undefined) { updates.push('`required` = ?'); values.push(data.required ? 1 : 0); }
    if (data.phone_code !== undefined) { updates.push('`phone_code` = ?'); values.push(data.phone_code); }
    if (data.country_id !== undefined) { updates.push('`country_id` = ?'); values.push(data.country_id); }
    if (data.state_id !== undefined) { updates.push('`state_id` = ?'); values.push(data.state_id); }
    if (data.pincode !== undefined) { updates.push('`pincode` = ?'); values.push(data.pincode); }
    if (data.company_id !== undefined) { updates.push('`company_id` = ?'); values.push(data.company_id); }
    if (updatedBy !== null) { updates.push('`updated_by` = ?'); values.push(updatedBy); }

    if (updates.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE ${_tableName} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async function remove(id) {
    const [result] = await pool.query(`DELETE FROM ${_tableName} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  async function getStats() {
    const [[total]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName}`);
    const [[active]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName} WHERE status='Active'`);
    const [[inactive]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName} WHERE status='Inactive'`);
    return { total: total.total, active: active.total, inactive: inactive.total };
  }

  async function checkReferences(tableName, fieldName, id) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${fieldName} = ?`,
      [id]
    );
    return rows[0].count > 0;
  }

  return {
    getAll,
    getById,
    getByCode,
    getNextCode,
    create,
    update,
    remove,
    getStats,
    checkReferences,
    tableName: _tableName,
  };
}

export default createMasterModel;
