import pool from '../config/db.js';

export async function getAll({ search, status, customer_id, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (so.order_no LIKE ? OR c.name LIKE ? OR so.customer_po_no LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) { where += ' AND so.status = ?'; params.push(status); }
  if (customer_id) { where += ' AND so.customer_id = ?'; params.push(customer_id); }

  const allowedSortColumns = ['id', 'order_no', 'order_date', 'status', 'grand_total', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `so.${sortBy}` : 'so.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT so.id, so.order_no, so.customer_id, so.order_date, so.delivery_date,
       so.customer_po_no, so.order_type, so.payment_terms, so.currency,
       so.sales_person, so.status, so.sub_total, so.discount, so.freight,
       so.tax_percent, so.tax_amount, so.grand_total, so.created_at,
       c.name AS customer_name, c.code AS customer_code,
       COALESCE((SELECT SUM(soi.quantity) FROM sales_order_items soi WHERE soi.sales_order_id = so.id), 0) AS total_quantity
     FROM sales_orders so
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM sales_orders so LEFT JOIN customers c ON so.customer_id = c.id WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[order]] = await pool.query(
    `SELECT so.*, c.name AS customer_name, c.code AS customer_code
     FROM sales_orders so
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE so.id = ?`,
    [id]
  );
  if (!order) return null;

  const [items] = await pool.query(
    `SELECT * FROM sales_order_items WHERE sales_order_id = ? ORDER BY id ASC`,
    [id]
  );
  const [deliveries] = await pool.query(
    `SELECT * FROM delivery_notes WHERE sales_order_id = ? ORDER BY id ASC`,
    [id]
  );
  const [receipts] = await pool.query(
    `SELECT * FROM payment_receipts WHERE sales_order_id = ? ORDER BY id ASC`,
    [id]
  );
  const [invoices] = await pool.query(
    `SELECT * FROM invoices WHERE sales_order_id = ? ORDER BY id ASC`,
    [id]
  );
  const [attachments] = await pool.query(
    `SELECT * FROM sales_order_attachments WHERE sales_order_id = ? ORDER BY uploaded_at ASC`,
    [id]
  );

  return { ...order, items, deliveries, receipts, invoices, attachments };
}

export async function getNextOrderNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT order_no FROM sales_orders WHERE order_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`SO-${year}-%`]
  );
  if (!row) return `SO-${year}-00001`;
  const num = parseInt(row.order_no.split('-')[2], 10) + 1;
  return `SO-${year}-${String(num).padStart(5, '0')}`;
}

function calcTotals(items, discount, freight, taxPercent) {
  const subTotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const discountAmt = parseFloat(discount) || 0;
  const freightAmt = parseFloat(freight) || 0;
  const taxable = subTotal - discountAmt + freightAmt;
  const taxAmount = (taxable * (parseFloat(taxPercent) || 18)) / 100;
  const grandTotal = taxable + taxAmount;
  return { subTotal, taxAmount, grandTotal };
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const order_no = data.order_no || await getNextOrderNo();
    const { subTotal, taxAmount, grandTotal } = calcTotals(items, data.discount, data.freight, data.tax_percent);

    const [result] = await conn.query(
      `INSERT INTO sales_orders (
        order_no, customer_id, order_date, delivery_date, customer_po_no, order_type,
        contact_person, delivery_address, payment_terms, currency, price_list,
        sales_person, status, terms_conditions, discount, freight,
        tax_percent, sub_total, tax_amount, grand_total, remarks, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        order_no, data.customer_id, data.order_date, data.delivery_date || null,
        data.customer_po_no || null, data.order_type || 'Standard',
        data.contact_person || null, data.delivery_address || null,
        data.payment_terms || null, data.currency || 'INR', data.price_list || null,
        data.sales_person || null, data.status || 'Draft', data.terms_conditions || null,
        data.discount || 0, data.freight || 0, data.tax_percent || 18,
        subTotal, taxAmount, grandTotal, data.remarks || null, createdBy,
      ]
    );
    const orderId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO sales_order_items (
          sales_order_id, item_code, item_description, product_id,
          leather_type, finish_color, thickness, uom, quantity, unit_price, discount_percent, amount
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          orderId, item.item_code || null, item.item_description || null, item.product_id || null,
          item.leather_type || null, item.finish_color || null, item.thickness || null,
          item.uom || null, item.quantity || 0, item.unit_price || 0,
          item.discount_percent || 0, item.amount || 0,
        ]
      );
    }

    await conn.commit();
    return { id: orderId, order_no };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, data, items = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { subTotal, taxAmount, grandTotal } = calcTotals(items, data.discount, data.freight, data.tax_percent);

    await conn.query(
      `UPDATE sales_orders SET
        customer_id=?, order_date=?, delivery_date=?, customer_po_no=?, order_type=?,
        contact_person=?, delivery_address=?, payment_terms=?, currency=?, price_list=?,
        sales_person=?, status=?, terms_conditions=?, discount=?, freight=?,
        tax_percent=?, sub_total=?, tax_amount=?, grand_total=?, remarks=?, updated_by=?
       WHERE id=?`,
      [
        data.customer_id, data.order_date, data.delivery_date || null,
        data.customer_po_no || null, data.order_type || 'Standard',
        data.contact_person || null, data.delivery_address || null,
        data.payment_terms || null, data.currency || 'INR', data.price_list || null,
        data.sales_person || null, data.status || 'Draft', data.terms_conditions || null,
        data.discount || 0, data.freight || 0, data.tax_percent || 18,
        subTotal, taxAmount, grandTotal, data.remarks || null, updatedBy, id,
      ]
    );

    await conn.query('DELETE FROM sales_order_items WHERE sales_order_id = ?', [id]);
    for (const item of items) {
      await conn.query(
        `INSERT INTO sales_order_items (
          sales_order_id, item_code, item_description, product_id,
          leather_type, finish_color, thickness, uom, quantity, unit_price, discount_percent, amount
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id, item.item_code || null, item.item_description || null, item.product_id || null,
          item.leather_type || null, item.finish_color || null, item.thickness || null,
          item.uom || null, item.quantity || 0, item.unit_price || 0,
          item.discount_percent || 0, item.amount || 0,
        ]
      );
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM sales_orders WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[data]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(status='Draft') AS draft,
       SUM(status='Confirmed') AS confirmed,
       SUM(status='Delivered') AS delivered,
       SUM(status='Cancelled') AS cancelled,
       SUM(grand_total) AS total_value
     FROM sales_orders`
  );
  return data;
}

// ---- Delivery Notes ----
export async function getNextDeliveryNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT delivery_no FROM delivery_notes WHERE delivery_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`DN-${year}-%`]
  );
  if (!row) return `DN-${year}-00001`;
  const num = parseInt(row.delivery_no.split('-')[2], 10) + 1;
  return `DN-${year}-${String(num).padStart(5, '0')}`;
}

export async function createDelivery(orderId, data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const delivery_no = data.delivery_no || await getNextDeliveryNo();
    const [result] = await conn.query(
      `INSERT INTO delivery_notes (
        delivery_no, sales_order_id, delivery_date, delivery_from, transporter,
        vehicle_no, lr_no, no_of_packages, delivery_to, delivery_instructions,
        status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        delivery_no, orderId, data.delivery_date || null, data.delivery_from || null,
        data.transporter || null, data.vehicle_no || null, data.lr_no || null,
        data.no_of_packages || null, data.delivery_to || null,
        data.delivery_instructions || null, data.status || 'Draft', createdBy,
      ]
    );
    const dnId = result.insertId;
    for (const item of items) {
      await conn.query(
        `INSERT INTO delivery_note_items (delivery_note_id, sales_order_item_id, item_code, item_description, uom, ordered_qty, shipped_qty, pending_qty)
         VALUES (?,?,?,?,?,?,?,?)`,
        [dnId, item.sales_order_item_id || null, item.item_code || null, item.item_description || null,
         item.uom || null, item.ordered_qty || 0, item.shipped_qty || 0, item.pending_qty || 0]
      );
    }
    await conn.commit();
    return { id: dnId, delivery_no };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateDelivery(dnId, data, items = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE delivery_notes SET
        delivery_date=?, delivery_from=?, transporter=?, vehicle_no=?, lr_no=?,
        no_of_packages=?, delivery_to=?, delivery_instructions=?, status=?, updated_by=?
       WHERE id=?`,
      [
        data.delivery_date || null, data.delivery_from || null, data.transporter || null,
        data.vehicle_no || null, data.lr_no || null, data.no_of_packages || null,
        data.delivery_to || null, data.delivery_instructions || null,
        data.status || 'Draft', updatedBy, dnId,
      ]
    );
    await conn.query('DELETE FROM delivery_note_items WHERE delivery_note_id = ?', [dnId]);
    for (const item of items) {
      await conn.query(
        `INSERT INTO delivery_note_items (delivery_note_id, sales_order_item_id, item_code, item_description, uom, ordered_qty, shipped_qty, pending_qty)
         VALUES (?,?,?,?,?,?,?,?)`,
        [dnId, item.sales_order_item_id || null, item.item_code || null, item.item_description || null,
         item.uom || null, item.ordered_qty || 0, item.shipped_qty || 0, item.pending_qty || 0]
      );
    }
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ---- Payment Receipts ----
export async function getNextReceiptNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT receipt_no FROM payment_receipts WHERE receipt_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`RCPT-${year}-%`]
  );
  if (!row) return `RCPT-${year}-00001`;
  const num = parseInt(row.receipt_no.split('-')[2], 10) + 1;
  return `RCPT-${year}-${String(num).padStart(5, '0')}`;
}

export async function createReceipt(orderId, data, createdBy = null) {
  const receipt_no = data.receipt_no || await getNextReceiptNo();
  const [result] = await pool.query(
    `INSERT INTO payment_receipts (receipt_no, sales_order_id, receipt_date, payment_mode, amount, remarks, created_by)
     VALUES (?,?,?,?,?,?,?)`,
    [receipt_no, orderId, data.receipt_date, data.payment_mode || 'Bank Transfer', data.amount || 0, data.remarks || null, createdBy]
  );
  return { id: result.insertId, receipt_no };
}

export async function deleteReceipt(receiptId) {
  const [result] = await pool.query('DELETE FROM payment_receipts WHERE id = ?', [receiptId]);
  return result.affectedRows > 0;
}

// ---- Attachments ----
export async function getAttachments(orderId) {
  const [rows] = await pool.query(
    `SELECT * FROM sales_order_attachments WHERE sales_order_id = ? ORDER BY uploaded_at ASC`,
    [orderId]
  );
  return rows;
}

export async function addAttachment(orderId, fileData, uploadedBy = null) {
  const [result] = await pool.query(
    `INSERT INTO sales_order_attachments (sales_order_id, file_name, file_path, file_type, category, remarks, uploaded_by)
     VALUES (?,?,?,?,?,?,?)`,
    [orderId, fileData.file_name, fileData.file_path, fileData.file_type || null,
     fileData.category || 'Others', fileData.remarks || null, uploadedBy]
  );
  return { id: result.insertId };
}

export async function deleteAttachment(attachmentId) {
  const [result] = await pool.query('DELETE FROM sales_order_attachments WHERE id = ?', [attachmentId]);
  return result.affectedRows > 0;
}

export async function updateAttachment(attachmentId, data) {
  const updates = [];
  const values = [];
  if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category); }
  if (data.remarks !== undefined) { updates.push('remarks = ?'); values.push(data.remarks); }
  if (updates.length === 0) return true;
  values.push(attachmentId);
  const [result] = await pool.query(`UPDATE sales_order_attachments SET ${updates.join(', ')} WHERE id = ?`, values);
  return result.affectedRows > 0;
}

// ---- Delete Delivery Note ----
export async function deleteDelivery(dnId) {
  const [result] = await pool.query('DELETE FROM delivery_notes WHERE id = ?', [dnId]);
  return result.affectedRows > 0;
}

// ---- Update Payment Receipt ----
export async function updateReceipt(receiptId, data) {
  const updates = [];
  const values = [];
  if (data.receipt_date !== undefined) { updates.push('receipt_date = ?'); values.push(data.receipt_date); }
  if (data.payment_mode !== undefined) { updates.push('payment_mode = ?'); values.push(data.payment_mode); }
  if (data.amount !== undefined) { updates.push('amount = ?'); values.push(data.amount); }
  if (data.remarks !== undefined) { updates.push('remarks = ?'); values.push(data.remarks); }
  if (updates.length === 0) return true;
  values.push(receiptId);
  const [result] = await pool.query(`UPDATE payment_receipts SET ${updates.join(', ')} WHERE id = ?`, values);
  return result.affectedRows > 0;
}

// ---- Invoices ----
export async function getNextInvoiceNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT invoice_no FROM invoices WHERE invoice_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`INV-${year}-%`]
  );
  if (!row) return `INV-${year}-00001`;
  const num = parseInt(row.invoice_no.split('-')[2], 10) + 1;
  return `INV-${year}-${String(num).padStart(5, '0')}`;
}

export async function createInvoice(orderId, data, createdBy = null) {
  const invoice_no = data.invoice_no || await getNextInvoiceNo();
  const [result] = await pool.query(
    `INSERT INTO invoices (invoice_no, sales_order_id, invoice_date, invoice_amount, paid_amount, balance, status, due_date, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      invoice_no, orderId, data.invoice_date || null,
      data.invoice_amount || 0, data.paid_amount || 0,
      (data.invoice_amount || 0) - (data.paid_amount || 0),
      data.status || 'Pending', data.due_date || null, createdBy,
    ]
  );
  return { id: result.insertId, invoice_no };
}

export async function updateInvoice(invoiceId, data) {
  const updates = [];
  const values = [];
  if (data.invoice_date !== undefined) { updates.push('invoice_date = ?'); values.push(data.invoice_date); }
  if (data.invoice_amount !== undefined) { updates.push('invoice_amount = ?'); values.push(data.invoice_amount); }
  if (data.paid_amount !== undefined) { updates.push('paid_amount = ?'); values.push(data.paid_amount); }
  if (data.balance !== undefined) { updates.push('balance = ?'); values.push(data.balance); }
  if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
  if (data.due_date !== undefined) { updates.push('due_date = ?'); values.push(data.due_date); }
  if (updates.length === 0) return true;
  values.push(invoiceId);
  const [result] = await pool.query(`UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`, values);
  return result.affectedRows > 0;
}

export async function deleteInvoice(invoiceId) {
  const [result] = await pool.query('DELETE FROM invoices WHERE id = ?', [invoiceId]);
  return result.affectedRows > 0;
}
