import pool from '../config/db.js';

const GRADES = ['A', 'B', 'C', 'D'];

const fail = (res, code, error) => res.status(code).json({ error });
const normCode = (v) => String(v || '').trim().toUpperCase();

// ---------- Stats & lookups ----------
export async function stats(_req, res, next) {
  try {
    const [[r]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM rmw_lots WHERE qr_generated = 0) AS lots_pending,
         (SELECT COUNT(*) FROM rmw_pieces) AS qr_count,
         (SELECT COUNT(*) FROM rmw_pieces WHERE grade IS NOT NULL AND grade <> 'D' AND rack_location IS NULL) AS awaiting_putaway,
         (SELECT COUNT(*) FROM rmw_pick_lists WHERE status = 'Open') AS open_picks,
         (SELECT COUNT(*) FROM rmw_pieces WHERE status = 'Stored') AS in_stock`
    );
    res.json({ data: r });
  } catch (err) { next(err); }
}

export async function racks(_req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT code, name FROM location_racks WHERE status = 'Active' ORDER BY code`
    );
    res.json({ data: rows });
  } catch (err) {
    // location_racks may not exist in some installs; fall back to free text entry
    if (err.code === 'ER_NO_SUCH_TABLE') return res.json({ data: [] });
    next(err);
  }
}

export async function articles(_req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT l.article FROM rmw_pieces p JOIN rmw_lots l ON l.id = p.lot_id
       WHERE p.status = 'Stored' ORDER BY l.article`
    );
    res.json({ data: rows.map((r) => r.article) });
  } catch (err) { next(err); }
}

// ---------- Step 1: Lots & QR ----------
export async function listLots(_req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, (SELECT COUNT(*) FROM rmw_pieces p WHERE p.lot_id = l.id) AS piece_count
       FROM rmw_lots l ORDER BY l.id DESC`
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function createLot(req, res, next) {
  try {
    const { lot_no, supplier_name, article, receipt_date } = req.body;
    const qty = Number(req.body.qty);
    if (!lot_no || !String(lot_no).trim()) return fail(res, 400, 'Receipt lot / GRN number is required');
    if (!supplier_name || !article) return fail(res, 400, 'Supplier and article are required');
    if (!receipt_date) return fail(res, 400, 'Receipt date is required');
    if (!Number.isInteger(qty) || qty < 1 || qty > 5000) return fail(res, 400, 'Quantity must be a whole number between 1 and 5000');
    const [r] = await pool.query(
      `INSERT INTO rmw_lots (lot_no, supplier_name, article, receipt_date, qty, created_by) VALUES (?,?,?,?,?,?)`,
      [String(lot_no).trim().toUpperCase(), String(supplier_name).trim(), String(article).trim(), receipt_date, qty, req.user?.id || null]
    );
    res.status(201).json({ data: { id: r.insertId }, message: 'Receipt lot created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 400, 'A lot with this number already exists');
    next(err);
  }
}

export async function deleteLot(req, res, next) {
  try {
    const [[l]] = await pool.query('SELECT qr_generated FROM rmw_lots WHERE id = ?', [req.params.id]);
    if (!l) return fail(res, 404, 'Lot not found');
    if (l.qr_generated) return fail(res, 400, 'Cannot delete a lot after QR codes are generated');
    await pool.query('DELETE FROM rmw_lots WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lot deleted' });
  } catch (err) { next(err); }
}

export async function generateQr(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[lot]] = await conn.query('SELECT * FROM rmw_lots WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!lot) { await conn.rollback(); return fail(res, 404, 'Lot not found'); }
    if (lot.qr_generated) { await conn.rollback(); return fail(res, 400, 'QR codes already generated for this receipt lot'); }
    const prefix = `LEA-${lot.lot_no.replace(/[^A-Z0-9]/gi, '')}`;
    const values = [];
    for (let i = 1; i <= lot.qty; i++) values.push([`${prefix}-${String(i).padStart(3, '0')}`, lot.id]);
    await conn.query('INSERT INTO rmw_pieces (piece_code, lot_id) VALUES ?', [values]);
    await conn.query('UPDATE rmw_lots SET qr_generated = 1, qr_generated_at = NOW() WHERE id = ?', [lot.id]);
    await conn.commit();
    res.json({ message: `${lot.qty} QR codes generated`, data: { count: lot.qty } });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 400, 'Generated QR IDs clash with existing pieces. Use a different lot number.');
    next(err);
  } finally { conn.release(); }
}

// ---------- Pieces (shared listing) ----------
export async function listPieces(req, res, next) {
  try {
    const { lot_id, stage } = req.query;
    const where = [];
    const params = [];
    if (lot_id) { where.push('p.lot_id = ?'); params.push(lot_id); }
    if (stage === 'grade') where.push('1=1');
    if (stage === 'putaway') where.push("p.grade IS NOT NULL AND p.grade <> 'D'");
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const [rows] = await pool.query(
      `SELECT p.id, p.piece_code, p.grade, p.sqft, p.rack_location, p.status, p.picked,
              l.lot_no, l.article
       FROM rmw_pieces p JOIN rmw_lots l ON l.id = p.lot_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY p.id DESC LIMIT ${limit}`,
      params
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
}

// ---------- Step 2: Grade ----------
export async function gradePiece(req, res, next) {
  try {
    const code = normCode(req.body.piece_code);
    const grade = String(req.body.grade || '').toUpperCase();
    const sqft = Number(req.body.sqft);
    if (!GRADES.includes(grade)) return fail(res, 400, 'Invalid grade');
    if (!Number.isFinite(sqft) || sqft <= 0) return fail(res, 400, 'Enter a valid Sq.ft per piece');
    const [[p]] = await pool.query('SELECT id, grade FROM rmw_pieces WHERE piece_code = ?', [code]);
    if (!p) return fail(res, 404, 'Leather QR not found');
    if (p.grade) return fail(res, 400, 'Grade already recorded');
    await pool.query(
      `UPDATE rmw_pieces SET grade = ?, sqft = ?, graded_at = NOW(), status = 'Graded' WHERE id = ?`,
      [grade, sqft, p.id]
    );
    res.json({ message: 'Grade and sq.ft saved' });
  } catch (err) { next(err); }
}

// ---------- Step 3: Put-away ----------
export async function putAway(req, res, next) {
  try {
    const code = normCode(req.body.piece_code);
    const location = String(req.body.rack_location || '').trim();
    if (!location) return fail(res, 400, 'Rack location is required');
    const [[p]] = await pool.query('SELECT id, grade, rack_location FROM rmw_pieces WHERE piece_code = ?', [code]);
    if (!p) return fail(res, 404, 'Leather QR not found');
    if (!p.grade) return fail(res, 400, 'Leather is not graded yet');
    if (p.grade === 'D') return fail(res, 400, 'Rejected (grade D) leather cannot be stored');
    if (p.rack_location) return fail(res, 400, 'Leather already stored');
    await pool.query(
      `UPDATE rmw_pieces SET rack_location = ?, stored_at = NOW(), status = 'Stored' WHERE id = ?`,
      [location, p.id]
    );
    res.json({ message: 'Put-away confirmed' });
  } catch (err) { next(err); }
}

// ---------- Step 4: Pick lists ----------
export async function listPickLists(req, res, next) {
  try {
    const open = req.query.status === 'Open';
    const [rows] = await pool.query(
      `SELECT pl.*, (SELECT COUNT(*) FROM rmw_pieces p WHERE p.pick_list_id = pl.id) AS item_count,
              (SELECT COUNT(*) FROM rmw_pieces p WHERE p.pick_list_id = pl.id AND p.picked = 1) AS picked_count
       FROM rmw_pick_lists pl ${open ? "WHERE pl.status = 'Open'" : ''} ORDER BY pl.id DESC`
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getPickList(req, res, next) {
  try {
    const [[pl]] = await pool.query('SELECT * FROM rmw_pick_lists WHERE id = ?', [req.params.id]);
    if (!pl) return fail(res, 404, 'Pick list not found');
    const [items] = await pool.query(
      `SELECT p.piece_code, p.grade, p.sqft, p.rack_location, p.picked, l.article
       FROM rmw_pieces p JOIN rmw_lots l ON l.id = p.lot_id
       WHERE p.pick_list_id = ? ORDER BY p.rack_location, p.piece_code`,
      [pl.id]
    );
    res.json({ data: { ...pl, items } });
  } catch (err) { next(err); }
}

export async function createPickList(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { dispatch_ref, customer_name, article, grade } = req.body;
    const qty = Number(req.body.qty);
    if (!dispatch_ref || !customer_name || !Number.isInteger(qty) || qty < 1) {
      return fail(res, 400, 'Enter dispatch reference, customer and quantity');
    }
    if (grade && !GRADES.slice(0, 3).includes(grade)) return fail(res, 400, 'Invalid grade');

    await conn.beginTransaction();
    const where = ["p.status = 'Stored'", 'p.pick_list_id IS NULL'];
    const params = [];
    if (article) { where.push('l.article = ?'); params.push(article); }
    if (grade) { where.push('p.grade = ?'); params.push(grade); }
    const [avail] = await conn.query(
      `SELECT p.id FROM rmw_pieces p JOIN rmw_lots l ON l.id = p.lot_id
       WHERE ${where.join(' AND ')} ORDER BY p.rack_location, p.id LIMIT ? FOR UPDATE`,
      [...params, qty]
    );
    if (avail.length < qty) {
      await conn.rollback();
      const [[{ n }]] = await pool.query(
        `SELECT COUNT(*) AS n FROM rmw_pieces p JOIN rmw_lots l ON l.id = p.lot_id WHERE ${where.join(' AND ')}`,
        params
      );
      return fail(res, 400, `Insufficient stock. Available: ${n}`);
    }
    const [ins] = await conn.query(
      `INSERT INTO rmw_pick_lists (pick_no, dispatch_ref, customer_name, article, grade, qty, created_by)
       VALUES (?,?,?,?,?,?,?)`,
      [`TMP-${Date.now()}-${Math.round(Math.random() * 1e6)}`, String(dispatch_ref).trim(), String(customer_name).trim(),
        article || null, grade || null, qty, req.user?.id || null]
    );
    const pickNo = `PL-${1000 + ins.insertId}`;
    await conn.query('UPDATE rmw_pick_lists SET pick_no = ? WHERE id = ?', [pickNo, ins.insertId]);
    await conn.query(
      `UPDATE rmw_pieces SET pick_list_id = ?, status = 'Allocated', picked = 0 WHERE id IN (?)`,
      [ins.insertId, avail.map((a) => a.id)]
    );
    await conn.commit();
    res.status(201).json({ data: { id: ins.insertId, pick_no: pickNo }, message: 'Pick list generated' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally { conn.release(); }
}

// ---------- Step 5: Picking & dispatch ----------
export async function pickPiece(req, res, next) {
  try {
    const code = normCode(req.body.piece_code);
    const [[pl]] = await pool.query('SELECT id, status FROM rmw_pick_lists WHERE id = ?', [req.params.id]);
    if (!pl) return fail(res, 404, 'Pick list not found');
    if (pl.status !== 'Open') return fail(res, 400, 'Pick list already dispatched');
    const [[p]] = await pool.query(
      'SELECT id, picked FROM rmw_pieces WHERE piece_code = ? AND pick_list_id = ?', [code, pl.id]
    );
    if (!p) return fail(res, 400, 'Scanned leather is not on this pick list');
    if (p.picked) return fail(res, 400, 'Already picked');
    await pool.query('UPDATE rmw_pieces SET picked = 1 WHERE id = ?', [p.id]);
    res.json({ message: 'Picked' });
  } catch (err) { next(err); }
}

export async function confirmDispatch(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[pl]] = await conn.query('SELECT id, status FROM rmw_pick_lists WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!pl) { await conn.rollback(); return fail(res, 404, 'Pick list not found'); }
    if (pl.status !== 'Open') { await conn.rollback(); return fail(res, 400, 'Pick list already dispatched'); }
    const [[{ pending }]] = await conn.query(
      'SELECT COUNT(*) AS pending FROM rmw_pieces WHERE pick_list_id = ? AND picked = 0', [pl.id]
    );
    if (pending > 0) { await conn.rollback(); return fail(res, 400, `${pending} leather(s) still pending pick`); }
    await conn.query(`UPDATE rmw_pieces SET status = 'Dispatched' WHERE pick_list_id = ?`, [pl.id]);
    await conn.query(`UPDATE rmw_pick_lists SET status = 'Dispatched', dispatched_at = NOW() WHERE id = ?`, [pl.id]);
    await conn.commit();
    res.json({ message: 'Dispatch confirmed' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally { conn.release(); }
}
