import { Router } from 'express';
import customerRoutes from './customerRoutes.js';
import productRoutes from './productRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import materialRoutes from './materialRoutes.js';
import recipeRoutes from './recipeRoutes.js';
import bomRoutes from './bomRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import authRoutes from './authRoutes.js';
import locationRoutes from './locationRoutes.js';
import salesOrderRoutes from './salesOrderRoutes.js';
import warehouseRoutes from './warehouseRoutes.js';
import stockOpeningRoutes from './stockOpeningRoutes.js';
import materialReceiptRoutes from './materialReceiptRoutes.js';
import stockTransferRoutes from './stockTransferRoutes.js';
import materialIssueRoutes from './materialIssueRoutes.js';
import productionPlanRoutes from './productionPlanRoutes.js';
import {
  productCategoryRoutes,
  leatherTypeRoutes,
  uomRoutes,
  thicknessRoutes,
  standardSizeRoutes,
  colorRoutes,
  finishTypeRoutes,
  gradeRoutes,
  hsnCodeRoutes,
  processStageRoutes,
  machineRoutes,
  roleRoutes,
  companyRoutes,
  businessUnitRoutes,
} from './masterRoutes.js';
import settingsRoutes from './settingsRoutes.js';
// New module routes
import batchRoutes from './batchRoutes.js';
import supplierPricingRoutes from './supplierPricingRoutes.js';
import priceApprovalRoutes from './priceApprovalRoutes.js';
import physicalStockEntryRoutes from './physicalStockEntryRoutes.js';
import backupRoutes from './backupRoutes.js';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Users routes
router.use(settingsRoutes.usersRouter);

// Master data routes
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/materials', materialRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/recipes', recipeRoutes);
router.use('/boms', bomRoutes);

// Inventory routes
router.use('/warehouses', warehouseRoutes);
router.use('/stock-opening', stockOpeningRoutes);
router.use('/material-receipts', materialReceiptRoutes);
router.use('/stock-transfers', stockTransferRoutes);
router.use('/material-issues', materialIssueRoutes);

// Production routes
router.use('/production-plans', productionPlanRoutes);

// Location routes (countries, states, cities)
router.use('/locations', locationRoutes);

// Master tables routes
router.use('/product-categories', productCategoryRoutes);
router.use('/leather-types', leatherTypeRoutes);
router.use('/uom', uomRoutes);
router.use('/thickness', thicknessRoutes);
router.use('/standard-sizes', standardSizeRoutes);
router.use('/colors', colorRoutes);
router.use('/finish-types', finishTypeRoutes);
router.use('/grades', gradeRoutes);
router.use('/hsn-codes', hsnCodeRoutes);
router.use('/process-stages', processStageRoutes);
router.use('/machines', machineRoutes);

// Settings routes
router.use('/roles', roleRoutes);
router.use('/companies', companyRoutes);
router.use('/business-units', businessUnitRoutes);

// New Module Routes
// Batch / Lot Tracking routes
router.use('/batches', batchRoutes);

// Supplier Pricing routes
router.use('/supplier-pricing', supplierPricingRoutes);

// Price Approval routes
router.use('/price-approvals', priceApprovalRoutes);

// Physical Stock Entry routes
router.use('/physical-stock-entries', physicalStockEntryRoutes);

// Database Backup routes
router.use('/backups', backupRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

export default router;
