import { Router } from 'express';
import { validatePagination } from '../middleware/validators.js';
import * as inv from '../controllers/reports/inventoryReportController.js';
import * as prod from '../controllers/reports/productionReportController.js';
import * as sales from '../controllers/reports/salesReportController.js';
import * as cost from '../controllers/reports/costingReportController.js';

const router = Router();

// ─── Inventory Reports ───────────────────────────────────────────────────────
router.get('/inventory/filters', inv.filters);
router.get('/inventory/stock-summary', validatePagination, inv.stockSummary);
router.get('/inventory/stock-valuation', validatePagination, inv.stockValuation);
router.get('/inventory/receipt-register', validatePagination, inv.receiptRegister);
router.get('/inventory/issue-register', validatePagination, inv.issueRegister);
router.get('/inventory/stock-movement', validatePagination, inv.stockMovement);

// ─── Production Reports (Plan + Actual) ──────────────────────────────────────
router.get('/production/filters', prod.filters);
router.get('/production/plan-summary', validatePagination, prod.planSummary);
router.get('/production/plan-vs-actual', validatePagination, prod.planVsActual);
router.get('/production/plan-status', validatePagination, prod.planStatus);
router.get('/production/order-plan', validatePagination, prod.orderProductionPlan);
router.get('/production/daily-output', validatePagination, prod.dailyProductionOutput);
router.get('/production/stage-wise', validatePagination, prod.stageWiseProduction);
router.get('/production/wip', validatePagination, prod.productionWip);

// ─── Sales Order Reports ─────────────────────────────────────────────────────
router.get('/sales/filters', sales.filters);
router.get('/sales/summary', validatePagination, sales.summary);
router.get('/sales/fulfillment', validatePagination, sales.fulfillment);
router.get('/sales/open', validatePagination, sales.open);
router.get('/sales/production-tracking', validatePagination, sales.productionTracking);

// ─── Stage Costing Reports ───────────────────────────────────────────────────
router.get('/costing/filters', cost.filters);
router.get('/costing/wip-cost-sheet', validatePagination, cost.wipCostSheet);
router.get('/costing/full-order-cost-sheet', validatePagination, cost.fullOrderCostSheet);
router.get('/costing/stage-cost-summary', validatePagination, cost.stageCostSummary);
router.get('/costing/standard-vs-actual', validatePagination, cost.standardVsActual);

export default router;
