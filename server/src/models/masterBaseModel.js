/**
 * Creates a model for simple master tables with CRUD operations
 * Supports: soft delete, audit fields, bulk operations, duplicate check, archived filtering
 * @param {string} tableName - Name of the database table
 * @param {string} codePrefix - Prefix for auto-generated codes (e.g., 'CAT' for product_categories)
 * @param {string[]} listFields - Fields to fetch in list queries
 * @param {string[]} searchFields - Fields to search in
 * @param {object} options - Optional config: { uniqueFields, filterableFields }
 */
import pool from '../config/db.js';

export function createMasterModel(tableName, codePrefix, listFields, searchFields, options = {}) {
  const _tableName = tableName;
  const _codePrefix = codePrefix;
  const _listFields = listFields || ['id', 'code', 'name', 'status', 'created_at', 'updated_at'];
  const _searchFields = searchFields || ['name', 'code'];
  const _uniqueFields = options.uniqueFields || [];
  const _filterableFields = options.filterableFields || [];
  const _extraColumns = options.extraColumns || {};

  function escapeField(f) {
    return `\`${f}\``;
  }

  async function getAll({ search, status, sortBy, sortOrder, page, limit, includeArchived, filters }) {
    let where = '1=1';
    const params = [];

    // Soft-delete: by default show only non-archived
    if (includeArchived === true) {
      // show everything
    } else {
      where += ' AND deleted_at IS NULL';
    }

    if (search) {
      where += ` AND (${_searchFields.map(f => `${escapeField(f)} LIKE ?`).join(' OR ')})`;
      const term = `%${search}%`;
      params.push(..._searchFields.map(() => term));
    }
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    // Dynamic filters (e.g., city, category, type, warehouse_id)
    if (filters && typeof filters === 'object') {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (_filterableFields.includes(key)) {
            where += ` AND ${escapeField(key)} = ?`;
            params.push(value);
          }
        }
      }
    }

    const allowedSortColumns = ['id', 'code', 'name', 'status', 'created_at', 'updated_at', 'seq', 'rank'];
    const column = allowedSortColumns.includes(sortBy) ? escapeField(sortBy) : escapeField('id');
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;
    const escapedListFields = _listFields.map(f => escapeField(f)).join(', ');
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
    const [rows] = await pool.query(`SELECT * FROM ${_tableName} WHERE code = ? AND deleted_at IS NULL`, [code]);
    return rows[0] || null;
  }

  async function getNextCode() {
    // Find the highest numeric suffix among codes that match this prefix.
    // This is robust against legacy/malformed codes that would otherwise yield NaN.
    const [rows] = await pool.query(
      `SELECT code FROM ${_tableName} WHERE code LIKE ?`,
      [`${_codePrefix}-%`]
    );
    let maxNum = 0;
    for (const r of rows) {
      const parts = String(r.code || '').split('-');
      const n = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(n) && n > maxNum) maxNum = n;
    }
    return `${_codePrefix}-${String(maxNum + 1).padStart(5, '0')}`;
  }

  async function checkDuplicate(data, excludeId = null) {
    if (!_uniqueFields || _uniqueFields.length === 0) return null;

    for (const rule of _uniqueFields) {
      const conditions = rule.fields.map(f => `${escapeField(f)} = ?`).join(' AND ');
      const values = rule.fields.map(f => data[f]).filter(v => v !== undefined && v !== null && v !== '');
      if (values.length !== rule.fields.length) continue;

      let query = `SELECT id, code, name FROM ${_tableName} WHERE ${conditions} AND deleted_at IS NULL`;
      if (excludeId) {
        query += ' AND id != ?';
        values.push(excludeId);
      }
      const [rows] = await pool.query(query, values);
      if (rows.length > 0) {
        return { field: rule.fields.join('+'), existing: rows[0] };
      }
    }
    return null;
  }

  // Date fields that need to be sanitized to YYYY-MM-DD format
  const _dateFields = new Set(
    Object.entries(_extraColumns)
      .filter(([, type]) => type === 'date')
      .map(([field]) => field)
  );

  // Numeric fields: empty strings must become null so they don't fail
  // strict-mode INT/DECIMAL columns (e.g. seq, gst_rate, *_id, rate_*).
  const _numericFields = new Set([
    'seq', 'rank', 'value_mm', 'gst_rate', 'capacity',
    'rate_indian', 'rate_imported', 'min_value', 'max_value',
    'category_id', 'company_id', 'country_id', 'state_id',
    'process_stage_id', 'warehouse_id',
    ...Object.entries(_extraColumns)
      .filter(([, type]) => type === 'number')
      .map(([field]) => field),
  ]);

  function sanitizeValue(field, value) {
    if (_dateFields.has(field)) {
      if (!value || value === '') return null;
      // Convert ISO timestamp or any date string to YYYY-MM-DD
      const d = new Date(value);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    }
    if (_numericFields.has(field)) {
      if (value === '' || value === null || value === undefined) return null;
      const n = Number(value);
      return Number.isNaN(n) ? null : n;
    }
    return value;
  }

  async function create(data, createdBy = null) {
    const code = data.code || await getNextCode();

    const columns = ['code'];
    const values = [code];

    const knownFields = [...new Set([
      'name', 'description', 'status', 'access_level', 'value_mm', 'rank', 'hex_code', 'seq',
      'gst_rate', 'machine_type', 'capacity', 'process_stage_id', 'parameter_name',
      'unit', 'default_value', 'min_value', 'max_value', 'required',
      'phone_code', 'country_id', 'state_id', 'pincode', 'company_id',
      'address', 'city', 'state', 'country', 'phone', 'email', 'gstin',
      'category_id', 'hsn_code', 'uom_type', 'uom', 'rate_indian', 'rate_imported',
      'warehouse_id',
      ...Object.keys(_extraColumns),
    ])];

    for (const f of knownFields) {
      if (data[f] !== undefined) {
        columns.push(f);
        values.push(sanitizeValue(f, data[f]));
      }
    }

    if (createdBy !== null) { columns.push('created_by'); values.push(createdBy); }

    const placeholders = values.map(() => '?').join(', ');
    const escapedColumns = columns.map(c => escapeField(c)).join(', ');
    const [result] = await pool.query(
      `INSERT INTO ${_tableName} (${escapedColumns}) VALUES (${placeholders})`,
      values
    );
    return { id: result.insertId, code };
  }

  async function update(id, data, updatedBy = null) {
    const updates = [];
    const values = [];

    const knownFields = [...new Set([
      'code', 'name', 'description', 'status', 'access_level', 'value_mm', 'rank', 'hex_code', 'seq',
      'gst_rate', 'machine_type', 'capacity', 'process_stage_id', 'parameter_name',
      'unit', 'default_value', 'min_value', 'max_value', 'required',
      'phone_code', 'country_id', 'state_id', 'pincode', 'company_id',
      'address', 'city', 'state', 'country', 'phone', 'email', 'gstin',
      'category_id', 'hsn_code', 'uom_type', 'uom', 'rate_indian', 'rate_imported',
      'warehouse_id',
      ...Object.keys(_extraColumns),
    ])];

    for (const f of knownFields) {
      if (data[f] !== undefined) {
        updates.push(`${escapeField(f)} = ?`);
        values.push(sanitizeValue(f, data[f]));
      }
    }

    if (updatedBy !== null) { updates.push('`updated_by` = ?'); values.push(updatedBy); }

    if (updates.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE ${_tableName} SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );
    return result.affectedRows > 0;
  }

  async function softDelete(id) {
    const [result] = await pool.query(
      `UPDATE ${_tableName} SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows > 0;
  }

  async function restore(id) {
    const [result] = await pool.query(
      `UPDATE ${_tableName} SET deleted_at = NULL, status = 'Active' WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  async function bulkSoftDelete(ids) {
    if (!ids || ids.length === 0) return 0;
    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(
      `UPDATE ${_tableName} SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      ids
    );
    return result.affectedRows;
  }

  async function bulkUpdateStatus(ids, status) {
    if (!ids || ids.length === 0) return 0;
    const placeholders = ids.map(() => '?').join(', ');
    const [result] = await pool.query(
      `UPDATE ${_tableName} SET status = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      [status, ...ids]
    );
    return result.affectedRows;
  }

  async function bulkArchive(ids) {
    return bulkSoftDelete(ids);
  }

  async function duplicate(id) {
    const original = await getById(id);
    if (!original) return null;

    const newCode = await getNextCode();
    const { id: _id, code: _code, created_at: _ca, updated_at: _ua, deleted_at: _da, created_by: _cb, updated_by: _ub, ...rest } = original;
    const data = { ...rest, code: newCode, name: `${original.name} (Copy)` };
    return create(data, null);
  }

  async function remove(id) {
    return softDelete(id);
  }

  async function hardDelete(id) {
    const [result] = await pool.query(`DELETE FROM ${_tableName} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  async function getStats() {
    const [[total]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName} WHERE deleted_at IS NULL`);
    const [[active]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName} WHERE status='Active' AND deleted_at IS NULL`);
    const [[inactive]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName} WHERE status='Inactive' AND deleted_at IS NULL`);
    const [[archived]] = await pool.query(`SELECT COUNT(*) AS total FROM ${_tableName} WHERE deleted_at IS NOT NULL`);
    return { total: total.total, active: active.total, inactive: inactive.total, archived: archived.total };
  }

  async function checkReferences(tableName, fieldName, id) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${fieldName} = ?`,
      [id]
    );
    return rows[0].count > 0;
  }

  async function getAuditInfo(id) {
    const [rows] = await pool.query(
      `SELECT id, code, name, created_by, created_at, updated_by, updated_at, deleted_at FROM ${_tableName} WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  return {
    getAll,
    getById,
    getByCode,
    getNextCode,
    checkDuplicate,
    create,
    update,
    remove,
    softDelete,
    restore,
    bulkSoftDelete,
    bulkUpdateStatus,
    bulkArchive,
    duplicate,
    hardDelete,
    getStats,
    checkReferences,
    getAuditInfo,
    tableName: _tableName,
  };
}

export default createMasterModel;
