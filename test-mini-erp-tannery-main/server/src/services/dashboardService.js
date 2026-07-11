import * as customerModel from '../models/customerModel.js';
import * as productModel from '../models/productModel.js';
import * as supplierModel from '../models/supplierModel.js';
import * as recipeModel from '../models/recipeModel.js';
import * as bomModel from '../models/bomModel.js';

export async function getDashboardStats() {
  const [customerStats, productStats, supplierStats, recipeStats, bomStats] = await Promise.all([
    customerModel.getStats(),
    productModel.getStats(),
    supplierModel.getStats(),
    recipeModel.getStats(),
    bomModel.getStats(),
  ]);

  return {
    stats: [
      { label: 'Total Customers', value: String(customerStats.total), change: '+12%', up: true },
      { label: 'Active Products', value: String(productStats.active), change: '+5%', up: true },
      { label: 'Total Suppliers', value: String(supplierStats.total), change: '+3%', up: true },
      { label: 'Active Recipes', value: String(recipeStats.active), change: '+8%', up: true },
    ],
    counts: {
      customers: customerStats,
      products: productStats,
      suppliers: supplierStats,
      recipes: recipeStats,
      boms: bomStats,
    },
  };
}
