import pool from '../config/db.js';

// Country model
export async function listCountries({ search, status, page, limit }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM countries WHERE ${where} ORDER BY name ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM countries WHERE ${where}`,
    params
  );
  return { rows, total };
}

// State model
export async function listStates({ country_id, search, status, page, limit }) {
  let where = '1=1';
  const params = [];

  if (country_id) {
    where += ' AND country_id = ?';
    params.push(country_id);
  }
  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT s.*, c.name as country_name FROM states s LEFT JOIN countries c ON s.country_id = c.id WHERE ${where} ORDER BY s.name ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM states s WHERE ${where}`,
    params
  );
  return { rows, total };
}

// City model
export async function listCities({ state_id, country_id, search, status, page, limit }) {
  let where = '1=1';
  const params = [];

  if (state_id) {
    where += ' AND state_id = ?';
    params.push(state_id);
  }
  if (country_id) {
    where += ' AND country_id = ?';
    params.push(country_id);
  }
  if (search) {
    where += ' AND (name LIKE ?)';
    const term = `%${search}%`;
    params.push(term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ci.*, s.name as state_name, co.name as country_name FROM cities ci LEFT JOIN states s ON ci.state_id = s.id LEFT JOIN countries co ON ci.country_id = co.id WHERE ${where} ORDER BY ci.name ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM cities ci WHERE ${where}`,
    params
  );
  return { rows, total };
}

// Get pincode by city
export async function getPincodeByCity(cityId) {
  const [rows] = await pool.query('SELECT pincode FROM cities WHERE id = ?', [cityId]);
  return rows[0]?.pincode || null;
}

// Get states by country (for dropdown)
export async function getStatesByCountry(countryId) {
  const [rows] = await pool.query(
    `SELECT id, code, name FROM states WHERE country_id = ? AND status = 'Active' ORDER BY name ASC`,
    [countryId]
  );
  return rows;
}

// Get cities by state (for dropdown)
export async function getCitiesByState(stateId) {
  const [rows] = await pool.query(
    `SELECT id, name, pincode FROM cities WHERE state_id = ? AND status = 'Active' ORDER BY name ASC`,
    [stateId]
  );
  return rows;
}

// Get all countries (for dropdown)
export async function getAllCountries() {
  const [rows] = await pool.query(
    `SELECT id, code, name, phone_code FROM countries WHERE status = 'Active' ORDER BY name ASC`
  );
  return rows;
}

export default {
  listCountries,
  listStates,
  listCities,
  getPincodeByCity,
  getStatesByCountry,
  getCitiesByState,
  getAllCountries,
};
