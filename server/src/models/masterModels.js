import { createMasterModel } from './masterBaseModel.js';

export const productCategoryModel = createMasterModel(
  'product_categories',
  'CAT',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const leatherTypeModel = createMasterModel(
  'leather_types',
  'LT',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const uomModel = createMasterModel(
  'uom',
  'UOM',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const thicknessModel = createMasterModel(
  'thickness',
  'TH',
  ['id', 'code', 'name', 'value_mm', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const standardSizeModel = createMasterModel(
  'standard_sizes',
  'SZ',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const colorModel = createMasterModel(
  'colors',
  'CLR',
  ['id', 'code', 'name', 'hex_code', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const finishTypeModel = createMasterModel(
  'finish_types',
  'FT',
  ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const gradeModel = createMasterModel(
  'grades',
  'GR',
  ['id', 'code', 'name', 'rank', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const hsnCodeModel = createMasterModel(
  'hsn_codes',
  'HSN',
  ['id', 'code', 'name', 'description', 'gst_rate', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['code'] }] }
);

export const taxMasterModel = createMasterModel(
  'tax_master',
  'TAX',
  ['id', 'code', 'name', 'tax_category', 'hsn_code_id', 'description', 'gst_percent', 'cess_percent', 'effective_from', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  {
    uniqueFields: [{ fields: ['name'] }],
    extraColumns: {
      tax_category: 'string',
      hsn_code_id: 'number',
      gst_percent: 'number',
      cess_percent: 'number',
      effective_from: 'date',
    },
  }
);

export const processStageModel = createMasterModel(
  'process_stages',
  'PS',
  ['id', 'code', 'name', 'description', 'seq', 'uom', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const groupMasterModel = createMasterModel(
  'group_master',
  'GRP',
  ['id', 'code', 'name', 'category_id', 'hsn_code', 'gst_rate', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code', 'hsn_code'],
  {
    uniqueFields: [{ fields: ['name'] }],
    extraColumns: {
      category_id: 'number',
      hsn_code: 'string',
      gst_rate: 'number',
    },
    filterableFields: ['category_id'],
  }
);

export const machineModel = createMasterModel(
  'machines',
  'MAC',
  ['id', 'code', 'name', 'machine_type', 'uom_type', 'rate_indian', 'rate_imported', 'supplier_id', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  {
    uniqueFields: [{ fields: ['name'] }],
    extraColumns: {
      uom_type: 'string',
      rate_indian: 'number',
      rate_imported: 'number',
      supplier_id: 'number',
    },
  }
);

export const roleModel = createMasterModel(
  'roles',
  'ROLE',
  ['id', 'code', 'name', 'description', 'access_level', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  { uniqueFields: [{ fields: ['name'] }] }
);

export const rateMasterModel = createMasterModel(
  'rate_master',
  'RATE',
  ['id', 'code', 'name', 'rate_type', 'component_ref_id', 'uom', 'rate_indian', 'rate_imported', 'effective_from', 'effective_to', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code', 'rate_type'],
  {
    uniqueFields: [{ fields: ['name'] }],
    extraColumns: {
      rate_type: 'string',
      component_ref_id: 'number',
      uom: 'string',
      rate_indian: 'number',
      rate_imported: 'number',
      effective_from: 'date',
      effective_to: 'date',
    },
    filterableFields: ['rate_type'],
  }
);

export const companyModel = createMasterModel(
  'companies',
  'COMP',
  ['id', 'code', 'name', 'address', 'city', 'state', 'country', 'phone', 'email', 'gstin', 'status', 'created_at', 'updated_at'],
  ['name', 'code', 'city', 'gstin'],
  {
    uniqueFields: [{ fields: ['name'] }, { fields: ['gstin'] }],
    filterableFields: ['city', 'state', 'country'],
  }
);

export const businessUnitModel = createMasterModel(
  'business_units',
  'BU',
  ['id', 'code', 'name', 'company_id', 'address', 'city', 'state', 'phone', 'email', 'status', 'created_at', 'updated_at'],
  ['name', 'code', 'city'],
  {
    uniqueFields: [{ fields: ['name'] }],
    filterableFields: ['city', 'state', 'company_id'],
  }
);

export const locationRackModel = createMasterModel(
  'location_racks',
  'LOC',
  ['id', 'code', 'name', 'warehouse_id', 'description', 'status', 'created_at', 'updated_at'],
  ['name', 'code'],
  {
    uniqueFields: [{ fields: ['name'] }],
    filterableFields: ['warehouse_id'],
  }
);
