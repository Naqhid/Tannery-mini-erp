import { createMasterController } from './masterBaseController.js';
import {
  productCategoryModel,
  leatherTypeModel,
  uomModel,
  thicknessModel,
  standardSizeModel,
  colorModel,
  finishTypeModel,
  gradeModel,
  hsnCodeModel,
  taxMasterModel,
  processStageModel,
  machineModel,
  roleModel,
  companyModel,
  businessUnitModel,
} from '../models/masterModels.js';

export const productCategoryController = createMasterController(productCategoryModel, 'Product Category', [
  { table: 'products', field: 'category_id', entityName: 'Products' },
]);

export const leatherTypeController = createMasterController(leatherTypeModel, 'Leather Type', [
  { table: 'products', field: 'leather_type_id', entityName: 'Products' },
]);

export const uomController = createMasterController(uomModel, 'UOM', [
  { table: 'products', field: 'uom_id', entityName: 'Products' },
]);

export const thicknessController = createMasterController(thicknessModel, 'Thickness', [
  { table: 'products', field: 'thickness_id', entityName: 'Products' },
]);

export const standardSizeController = createMasterController(standardSizeModel, 'Standard Size', []);

export const colorController = createMasterController(colorModel, 'Color', [
  { table: 'products', field: 'color_id', entityName: 'Products' },
]);

export const finishTypeController = createMasterController(finishTypeModel, 'Finish Type', [
  { table: 'products', field: 'finish_type_id', entityName: 'Products' },
]);

export const gradeController = createMasterController(gradeModel, 'Grade', [
  { table: 'products', field: 'grade_id', entityName: 'Products' },
]);

export const hsnCodeController = createMasterController(hsnCodeModel, 'HSN Code', [
  { table: 'products', field: 'hsn_code_id', entityName: 'Products' },
]);

export const taxMasterController = createMasterController(taxMasterModel, 'Tax', []);

export const processStageController = createMasterController(processStageModel, 'Process Stage', [
  { table: 'recipe_process_stages', field: 'process_stage_id', entityName: 'Recipe Process Stages' },
]);

export const machineController = createMasterController(machineModel, 'Machine/Equipment', [
  { table: 'recipe_process_stages', field: 'machine_id', entityName: 'Recipe Process Stages' },
]);

export const roleController = createMasterController(roleModel, 'Role', [
  { table: 'users', field: 'role_id', entityName: 'Users' },
]);

export const companyController = createMasterController(companyModel, 'Company', [
  { table: 'business_units', field: 'company_id', entityName: 'Business Units' },
]);

export const businessUnitController = createMasterController(businessUnitModel, 'Business Unit', [
  { table: 'users', field: 'business_unit_id', entityName: 'Users' },
]);
