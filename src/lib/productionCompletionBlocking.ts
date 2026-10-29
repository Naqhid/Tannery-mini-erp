/**
 * Production Completion Blocking Utilities
 * ==========================================
 * 
 * Frontend utilities to check if a production plan is completed
 * and prevent creating new transactions for it.
 * 
 * A production plan is considered completed when:
 *   - Measurement stage output_qty >= planned_qty (or sales_order_qty)
 */

import { api } from './api';

/**
 * Check if a production plan is completed
 * @param productionPlanId - The production plan ID to check
 * @returns Promise<boolean> - True if completed, false otherwise
 */
export async function isProductionPlanCompleted(productionPlanId: number): Promise<boolean> {
  try {
    if (!productionPlanId) return false;
    
    const response = await api.get(`/production-plans/${productionPlanId}`);
    const plan = response.data?.data;
    
    if (!plan) return false;
    
    // Check if the plan has a status field that indicates completion
    if (plan.status === 'Completed') return true;
    
    // Check if output_qty >= planned_qty or order_qty
    const outputQty = parseFloat(plan.output_qty || plan.completed_qty || 0);
    const targetQty = parseFloat(plan.planned_qty || plan.order_qty || 0);
    
    if (targetQty > 0 && outputQty >= targetQty) {
      return true;
    }
    
    // If we have a sales_order_id, check the sales order quantity
    if (plan.sales_order_id && targetQty <= 0) {
      const soResponse = await api.get(`/sales-orders/${plan.sales_order_id}`);
      const salesOrder = soResponse.data?.data;
      if (salesOrder) {
        const soQty = parseFloat(salesOrder.quantity || 0);
        if (soQty > 0 && outputQty >= soQty) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking production plan completion:', error);
    return false; // Fail safe - don't block on error
  }
}

/**
 * Get completion info for a production plan
 * @param productionPlanId - The production plan ID
 * @returns Promise object with completion details
 */
export async function getProductionPlanCompletionInfo(productionPlanId: number) {
  try {
    if (!productionPlanId) {
      return { 
        completed: false, 
        message: null, 
        planNo: null,
        outputQty: 0,
        targetQty: 0
      };
    }
    
    const response = await api.get(`/production-plans/${productionPlanId}`);
    const plan = response.data?.data;
    
    if (!plan) {
      return { 
        completed: false, 
        message: null, 
        planNo: null,
        outputQty: 0,
        targetQty: 0
      };
    }
    
    const outputQty = parseFloat(plan.output_qty || plan.completed_qty || 0);
    let targetQty = parseFloat(plan.planned_qty || plan.order_qty || 0);
    
    // If no target from plan, try sales order
    if (targetQty <= 0 && plan.sales_order_id) {
      const soResponse = await api.get(`/sales-orders/${plan.sales_order_id}`);
      const salesOrder = soResponse.data?.data;
      if (salesOrder) {
        targetQty = parseFloat(salesOrder.quantity || 0);
      }
    }
    
    const completed = targetQty > 0 && outputQty >= targetQty;
    
    return {
      completed,
      message: completed ? 'This order is completed' : null,
      planNo: plan.plan_no || null,
      outputQty,
      targetQty
    };
  } catch (error) {
    console.error('Error getting production plan completion info:', error);
    return { 
      completed: false, 
      message: null, 
      planNo: null,
      outputQty: 0,
      targetQty: 0
    };
  }
}

/**
 * Check if a production plan is completed based on its status
 * @param productionPlan - The production plan object
 * @returns boolean - True if completed
 */
export function isPlanStatusCompleted(productionPlan: any): boolean {
  if (!productionPlan) return false;
  
  // Check status field
  if (productionPlan.status === 'Completed') return true;
  
  // Check output vs planned quantities
  const outputQty = parseFloat(productionPlan.output_qty || productionPlan.completed_qty || 0);
  const targetQty = parseFloat(productionPlan.planned_qty || productionPlan.order_qty || 0);
  
  return targetQty > 0 && outputQty >= targetQty;
}

/**
 * Check multiple production plans for completion status
 * @param productionPlanIds - Array of production plan IDs
 * @returns Promise<Record<number, boolean>> - Map of plan ID to completed status
 */
export async function checkMultipleProductionPlansCompleted(
  productionPlanIds: number[]
): Promise<Record<number, boolean>> {
  const result: Record<number, boolean> = {};
  
  for (const id of productionPlanIds) {
    result[id] = await isProductionPlanCompleted(id);
  }
  
  return result;
}

/**
 * Get toaster message for completed production plan
 * @param productionPlan - The production plan object
 * @returns string - Toaster message or null
 */
export function getCompletionToasterMessage(productionPlan: any): string | null {
  if (!productionPlan) return null;
  
  const outputQty = parseFloat(productionPlan.output_qty || productionPlan.completed_qty || 0);
  const targetQty = parseFloat(productionPlan.planned_qty || productionPlan.order_qty || 0);
  
  if (targetQty > 0 && outputQty >= targetQty) {
    return `This order is completed (${outputQty} >= ${targetQty})`;
  }
  
  if (productionPlan.status === 'Completed') {
    return 'This order is completed';
  }
  
  return null;
}
