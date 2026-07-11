import { createMasterModel } from './masterBaseModel.js';

export const productCategoryModel = createMasterModel(
  'product_categories',
  'CAT',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const leatherTypeModel = createMasterModel(
  'leather_types',
  'LT',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const uomModel = createMasterModel(
  'uom',
  'UOM',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const thicknessModel = createMasterModel(
  'thickness',
  'TH',
  ['id', 'code', 'name', 'value_mm', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const standardSizeModel = createMasterModel(
  'standard_sizes',
  'SZ',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const colorModel = createMasterModel(
  'colors',
  'CLR',
  ['id', 'code', 'name', 'hex_code', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const finishTypeModel = createMasterModel(
  'finish_types',
  'FT',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const gradeModel = createMasterModel(
  'grades',
  'GR',
  ['id', 'code', 'name', 'rank', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const hsnCodeModel = createMasterModel(
  'hsn_codes',
  'HSN',
  ['id', 'code', 'name', 'description', 'gst_rate', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const processStageModel = createMasterModel(
  'process_stages',
  'PS',
  ['id', 'code', 'name', 'description', 'seq', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const machineModel = createMasterModel(
  'machines',
  'MAC',
  ['id', 'code', 'name', 'machine_type', 'capacity', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const roleModel = createMasterModel(
  'roles',
  'ROLE',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const companyModel = createMasterModel(
  'companies',
  'COMP',
  ['id', 'code', 'name', 'address', 'city', 'state', 'country', 'phone', 'email', 'gstin', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);

export const businessUnitModel = createMasterModel(
  'business_units',
  'BU',
  ['id', 'code', 'name', 'company_id', 'address', 'city', 'state', 'phone', 'email', 'status', 'created_at', 'updated_at'],
  ['name', 'code']
);
