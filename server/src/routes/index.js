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

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Master data routes
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/materials', materialRoutes);
router.use('/recipes', recipeRoutes);
router.use('/boms', bomRoutes);

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

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

export default router;
