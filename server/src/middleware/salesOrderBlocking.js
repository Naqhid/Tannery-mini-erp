/**
 * Sales Order Blocking Middleware
 * ================================
 * 
 * Prevents creating new transactions for sale orders that have been shipped.
 * 
 * Applies to: material_issues, delivery_notes, invoices, stock_transfers, outbound_deliveries
 * 
 * Usage:
 *   Add to routes that create transactions linked to sales orders:
 *   router.post('/material-issues', salesOrderBlocking, createMaterialIssue);
 */

import db from '../config/db.js';

/**
 * Middleware to block transactions for shipped sale orders
 * Expects req.body to contain sales_order_id
 * If transaction references a sales order, checks if it's blocked
 */
export async function salesOrderBlocking(req, res, next) {
  try {
    // Skip if not creating a new record (e.g., GET, UPDATE on existing)
    if (req.method !== 'POST' && req.method !== 'PUT') {
      return next();
    }

    // Extract sales_order_id from request body and route params
    // Check various possible field names
    const possibleFields = [
      'sales_order_id',
      'sale_order_id', 
      'order_id',
      'so_id',
      'reference_id',
      'id'  // For routes like /sales-orders/:id/delivery
    ];

    let salesOrderId = null;
    
    // First check route parameters (for nested routes like /sales-orders/:id/delivery)
    if (req.params) {
      for (const field of possibleFields) {
        if (req.params[field] !== undefined) {
          salesOrderId = req.params[field];
          break;
        }
      }
    }
    
    // Then check request body
    if (!salesOrderId && req.body) {
      for (const field of possibleFields) {
        if (req.body[field] !== undefined) {
          salesOrderId = req.body[field];
          break;
        }
      }
    }

    // If no sales order reference, allow the request
    if (!salesOrderId) {
      return next();
    }

    // Convert to integer
    salesOrderId = parseInt(salesOrderId);
    if (isNaN(salesOrderId)) {
      return next();
    }

    // Check if the sales order is blocked
    const [rows] = await db.query(
      'SELECT id, order_no, status, is_blocked, blocked_reason FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (rows && rows.length > 0) {
      const order = rows[0];
      
      if (order.is_blocked === 1) {
        return res.status(400).json({
          success: false,
          error: 'SALE_ORDER_BLOCKED',
          message: `Cannot create transaction for Sale Order ${order.order_no}. This order has been shipped and is blocked.`,
          details: {
            sales_order_id: order.id,
            order_no: order.order_no,
            status: order.status,
            blocked_reason: order.blocked_reason
          }
        });
      }

      // Also check if status is Shipped or Delivered (belt and suspenders)
      if (['Shipped', 'Delivered'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: 'SALE_ORDER_SHIPPED',
          message: `Cannot create transaction for Sale Order ${order.order_no}. This order has already been shipped.`,
          details: {
            sales_order_id: order.id,
            order_no: order.order_no,
            status: order.status
          }
        });
      }
    }

    // Allow the request if order exists and is not blocked
    next();

  } catch (error) {
    console.error('Sales Order Blocking Middleware Error:', error);
    // Don't block on error - just log and allow
    next();
  }
}

/**
 * Helper function to check if a sales order is blocked
 * Can be used in services/controllers directly
 */
export async function isSaleOrderBlocked(salesOrderId) {
  try {
    if (!salesOrderId) return false;
    
    salesOrderId = parseInt(salesOrderId);
    if (isNaN(salesOrderId)) return false;

    const [rows] = await db.query(
      'SELECT is_blocked, status FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (rows && rows.length > 0) {
      const order = rows[0];
      return order.is_blocked === 1 || ['Shipped', 'Delivered'].includes(order.status);
    }

    return false;
  } catch (error) {
    console.error('Error checking sales order block status:', error);
    return false; // Fail safe - don't block on error
  }
}

/**
 * Get block reason for a sales order
 */
export async function getSaleOrderBlockReason(salesOrderId) {
  try {
    if (!salesOrderId) return null;
    
    salesOrderId = parseInt(salesOrderId);
    if (isNaN(salesOrderId)) return null;

    const [rows] = await db.query(
      'SELECT is_blocked, status, blocked_reason, order_no FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (rows && rows.length > 0) {
      const order = rows[0];
      if (order.is_blocked === 1) {
        return order.blocked_reason || `Order ${order.order_no} is blocked`;
      }
      if (['Shipped', 'Delivered'].includes(order.status)) {
        return `Order ${order.order_no} has been ${order.status}`;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting sales order block reason:', error);
    return null;
  }
}

