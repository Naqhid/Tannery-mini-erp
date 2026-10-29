/**
 * Sales Order Blocking Utilities
 * ================================
 * 
 * Frontend utilities to check if a sales order is blocked (shipped)
 * and prevent creating new transactions for it.
 */

import { api } from './api';

/**
 * Check if a sales order is blocked (shipped or delivered)
 * @param salesOrderId - The sales order ID to check
 * @returns Promise<boolean> - True if blocked, false otherwise
 */
export async function isSaleOrderBlocked(salesOrderId: number): Promise<boolean> {
  try {
    const response = await api.get(`/sales-orders/${salesOrderId}`);
    const order = response.data?.data;
    
    if (!order) return false;
    
    // Check if explicitly blocked
    if (order.is_blocked === 1) return true;
    
    // Check if shipped or delivered
    if (['Shipped', 'Delivered'].includes(order.status)) return true;
    
    return false;
  } catch (error) {
    console.error('Error checking sales order block status:', error);
    return false; // Fail safe - don't block on error
  }
}

/**
 * Get the block reason for a sales order
 * @param salesOrderId - The sales order ID
 * @returns Promise<string | null> - Block reason or null if not blocked
 */
export async function getSaleOrderBlockReason(salesOrderId: number): Promise<string | null> {
  try {
    const response = await api.get(`/sales-orders/${salesOrderId}`);
    const order = response.data?.data;
    
    if (!order) return null;
    
    // If explicitly blocked, use the blocked_reason
    if (order.is_blocked === 1 && order.blocked_reason) {
      return order.blocked_reason;
    }
    
    // If shipped or delivered, return status-based reason
    if (['Shipped', 'Delivered'].includes(order.status)) {
      return `Sale Order ${order.order_no} has already been ${order.status}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting sales order block reason:', error);
    return null;
  }
}

/**
 * Check multiple sales orders for blocking status
 * @param salesOrderIds - Array of sales order IDs
 * @returns Promise<Record<number, boolean>> - Map of order ID to blocked status
 */
export async function checkMultipleSaleOrdersBlocked(
  salesOrderIds: number[]
): Promise<Record<number, boolean>> {
  const result: Record<number, boolean> = {};
  
  for (const id of salesOrderIds) {
    result[id] = await isSaleOrderBlocked(id);
  }
  
  return result;
}

/**
 * Helper to get blocked order info for display
 * @param salesOrderId - The sales order ID
 * @returns Promise<{blocked: boolean, reason: string | null, orderNo: string | null}> 
 */
export async function getSaleOrderBlockInfo(salesOrderId: number) {
  try {
    const response = await api.get(`/sales-orders/${salesOrderId}`);
    const order = response.data?.data;
    
    if (!order) {
      return { blocked: false, reason: null, orderNo: null };
    }
    
    const blocked = order.is_blocked === 1 || ['Shipped', 'Delivered'].includes(order.status);
    const reason = order.is_blocked === 1 
      ? order.blocked_reason 
      : (['Shipped', 'Delivered'].includes(order.status) 
          ? `Sale Order ${order.order_no} has already been ${order.status}`
          : null);
    
    return { 
      blocked, 
      reason, 
      orderNo: order.order_no || null 
    };
  } catch (error) {
    console.error('Error getting sales order block info:', error);
    return { blocked: false, reason: null, orderNo: null };
  }
}
