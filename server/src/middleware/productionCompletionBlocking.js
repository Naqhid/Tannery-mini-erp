/**
 * Production Completion Blocking Middleware
 * ==========================================
 * 
 * Prevents creating/updating transactions for production plans that are completed.
 * A production plan is considered completed when:
 *   - Measurement stage output_qty >= planned_qty (or order_qty from sales order)
 * 
 * Applies to:
 *   - Production plan creation/update
 *   - Production status order creation/update
 *   - Production status transaction creation/update
 *   - Material issue creation (when linked to production plan)
 *   - Daily production transactions
 * 
 * Usage:
 *   Add to routes that create transactions linked to production plans:
 *   router.post('/production-plans', productionCompletionBlocking, createProductionPlan);
 */

const db = require('../config/database');

/**
 * Check if a production plan is completed
 * A plan is completed when measurement stage output >= planned/sales order qty
 * @param {number} productionPlanId - The production plan ID
 * @returns {Promise<{completed: boolean, message: string | null, plan?: object}>}
 */
async function isProductionPlanCompleted(productionPlanId) {
  try {
    if (!productionPlanId) return { completed: false, message: null };
    
    productionPlanId = parseInt(productionPlanId);
    if (isNaN(productionPlanId)) return { completed: false, message: null };

    // Get the production plan details and calculate measurement stage output
    const [rows] = await db.query(`
      SELECT 
        pp.id,
        pp.plan_no,
        pp.planned_qty,
        pp.order_qty,
        pp.sales_order_id,
        so.order_no AS sales_order_no,
        so.quantity AS sales_order_qty
      FROM production_plans pp
      LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
      WHERE pp.id = ? AND pp.deleted_at IS NULL
    `, [productionPlanId]);

    if (!rows || rows.length === 0) {
      return { completed: false, message: null };
    }

    const plan = rows[0];
    
    // Get measurement stage output qty
    // Measurement stage is the last stage by sequence for the plan
    const [stageRows] = await db.query(`
      SELECT pps.stage_name
      FROM production_plan_stages pps
      WHERE pps.plan_id = ?
      ORDER BY pps.seq DESC, pps.id DESC
      LIMIT 1
    `, [productionPlanId]);

    if (!stageRows || stageRows.length === 0) {
      return { completed: false, message: null, plan };
    }

    const measurementStage = stageRows[0].stage_name;

    // Get cumulative output for measurement stage
    const [outputRows] = await db.query(`
      SELECT COALESCE(SUM(t.output_qty), 0) AS total_output
      FROM production_status_orders pso
      JOIN production_status_transactions t 
        ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = ? AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = ?
    `, [productionPlanId, measurementStage]);

    const measurementOutputQty = parseFloat(outputRows[0]?.total_output || 0);
    
    // Determine the target quantity
    // Priority: planned_qty > order_qty > sales_order.qty
    let targetQty = parseFloat(plan.planned_qty || 0);
    if (targetQty <= 0) {
      targetQty = parseFloat(plan.order_qty || 0);
    }
    if (targetQty <= 0 && plan.sales_order_qty) {
      targetQty = parseFloat(plan.sales_order_qty);
    }
    
    // If no target quantity found, don't block
    if (targetQty <= 0) {
      return { completed: false, message: null, plan };
    }
    
    // Check if completed
    const completed = measurementOutputQty >= targetQty;
    
    return {
      completed,
      message: completed 
        ? `Production Plan ${plan.plan_no} is completed (${measurementOutputQty} >= ${targetQty})`
        : null,
      plan
    };
  } catch (error) {
    console.error('Error checking production plan completion:', error);
    return { completed: false, message: null };
  }
}

/**
 * Middleware to block transactions for completed production plans
 * Checks if the request references a production plan that is completed
 */
async function productionCompletionBlocking(req, res, next) {
  try {
    // Skip for GET requests
    if (req.method === 'GET') {
      return next();
    }

    // Extract production_plan_id from request
    const possibleFields = [
      'production_plan_id',
      'plan_id',
      'pp_id',
      'id'  // For routes like /production-plans/:id
    ];

    let productionPlanId = null;
    
    // Check route parameters first
    if (req.params) {
      for (const field of possibleFields) {
        if (req.params[field] !== undefined) {
          productionPlanId = req.params[field];
          break;
        }
      }
    }
    
    // Check request body
    if (!productionPlanId && req.body) {
      for (const field of possibleFields) {
        if (req.body[field] !== undefined) {
          productionPlanId = req.body[field];
          break;
        }
      }
    }

    // If no production plan reference, check for nested references
    // For example, production_status_order might have production_plan_id in body
    if (!productionPlanId && req.body) {
      // Check if creating a production status order with production_plan_id
      if (req.body.production_plan_id) {
        productionPlanId = req.body.production_plan_id;
      }
      // Check if creating a transaction with production_status_order_id
      // We need to get the production_plan_id from the order
      else if (req.body.production_status_order_id) {
        const orderId = parseInt(req.body.production_status_order_id);
        if (!isNaN(orderId)) {
          const [orderRows] = await db.query(
            'SELECT production_plan_id FROM production_status_orders WHERE id = ?',
            [orderId]
          );
          if (orderRows && orderRows.length > 0) {
            productionPlanId = orderRows[0].production_plan_id;
          }
        }
      }
    }

    // If still no production plan, allow the request
    if (!productionPlanId) {
      return next();
    }

    // Check if the production plan is completed
    const { completed, message, plan } = await isProductionPlanCompleted(productionPlanId);

    if (completed) {
      return res.status(400).json({
        success: false,
        error: 'PRODUCTION_PLAN_COMPLETED',
        message: message || 'This order is completed',
        details: {
          production_plan_id: plan?.id,
          plan_no: plan?.plan_no,
          sales_order_no: plan?.sales_order_no,
          target_qty: plan?.planned_qty || plan?.order_qty
        }
      });
    }

    // Allow the request if not completed
    next();

  } catch (error) {
    console.error('Production Completion Blocking Middleware Error:', error);
    // Don't block on error - just log and allow
    next();
  }
}

/**
 * Check if a production plan is completed (standalone function)
 */
async function checkProductionPlanCompletion(productionPlanId) {
  const result = await isProductionPlanCompleted(productionPlanId);
  return result.completed;
}

/**
 * Get completion info for a production plan
 */
async function getProductionPlanCompletionInfo(productionPlanId) {
  const result = await isProductionPlanCompleted(productionPlanId);
  return {
    completed: result.completed,
    message: result.message,
    plan: result.plan
  };
}

module.exports = {
  productionCompletionBlocking,
  isProductionPlanCompleted,
  checkProductionPlanCompletion,
  getProductionPlanCompletionInfo
};
