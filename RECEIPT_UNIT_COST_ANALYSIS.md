# Receipt Unit Cost Calculation Analysis

## Question: Does the same formula apply when creating receipts?

### **Answer: YES, but with an important distinction**

The average rate formula **IS applied** to receipts, but through a two-step process:

## How It Works

### Step 1: Receipt Creation (Initial Unit Cost)
When a material receipt is created and posted, the **initial** unit_cost is set to the **purchase rate** from the receipt:

```javascript
// From materialReceiptModel.js - postReceiptTransactions()
unit_cost: item.rate_inr || 0,  // This is the purchase rate from the receipt
```

This is CORRECT because:
- Receipts should use their own purchase rate as the initial cost
- Each receipt can have a different purchase rate based on supplier, negotiation, etc.

### Step 2: Ledger Rebuild (Running Average Calculation)
After posting, the system calls `rebuildStockValuation()` which implements the **exact formula you specified**:

```javascript
// From stockLedgerModel.js - rebuildStockValuation()

// For INBOUND (receipts):
const inCost = _n(row.unit_cost);  // Receipt's rate_inr
const inValue = inQty * inCost;
qty += inQty;
value += inValue;

// For OUTBOUND (issues):
const avg = qty > 0 ? value / qty : 0;  // This is: (opening_value + in_value) / (opening_qty + in_qty)
const outValue = outQty * avg;
qty -= outQty;
value -= outValue;

// After each entry:
opening_qty = qty (for next row);
opening_value = value (for next row);
balance_qty = qty;
balance_value = value;
```

## Formula Verification

The running average formula implemented in `rebuildStockValuation` is **EXACTLY** what you requested:

```
unit_cost = (opening_value + in_value) / (opening_qty + in_qty)
out_value = out_qty * unit_cost
balance_qty = opening_qty + in_qty - out_qty
balance_value = balance_qty * unit_cost
```

**Proof:** 
- `opening_value` = running total value before this entry
- `in_value` = value of this receipt (in_qty * receipt's rate_inr)
- `opening_qty` = running total quantity before this entry
- `in_qty` = quantity of this receipt
- Therefore: `avg = value / qty = (opening_value + in_value) / (opening_qty + in_qty)`

## Example

Let's say we have:
- **Opening stock:** 100 units @ ₹10 = ₹1,000 value
- **Receipt 1:** 50 units @ ₹12 = ₹600 value
- **Receipt 2:** 30 units @ ₹11 = ₹330 value

**After Receipt 1:**
```
opening_value = 1000
in_value = 600
opening_qty = 100
in_qty = 50

unit_cost = (1000 + 600) / (100 + 50) = 1600 / 150 = ₹10.67
balance_qty = 150
balance_value = 1600
```

**After Receipt 2:**
```
opening_value = 1600
in_value = 330
opening_qty = 150
in_qty = 30

unit_cost = (1600 + 330) / (150 + 30) = 1930 / 180 = ₹10.72
balance_qty = 180
balance_value = 1930
```

This is **exactly** the weighted average cost method you requested.

## Conclusion

✅ **The same formula IS applied to receipts** - through the `rebuildStockValuation()` function which:
1. Takes each receipt's individual purchase rate (rate_inr) as the initial unit_cost
2. Calculates the running weighted average for the (warehouse, material) pair
3. Uses the formula: `unit_cost = (opening_value + in_value) / (opening_qty + in_qty)`
4. Updates all ledger entries with the correct opening/closing balances and average rates

The receipt's own rate is preserved in the ledger entry, but the running average is calculated correctly using your formula.

## Where to Verify

Check these files for the implementation:
- `server/src/models/stockLedgerModel.js` - `rebuildStockValuation()` function (lines 73-163)
- `server/src/models/materialReceiptModel.js` - `postReceiptTransactions()` function (lines 173-220)
- `server/src/controllers/batchProcessController_v2.js` - Uses `rebuildStockValuation()` for batch processing

## Why This Approach is Correct

This is the standard **Weighted Average Cost** method:
1. Each receipt has its own purchase cost
2. The average is recalculated whenever stock changes
3. Issues/outbound transactions use the current running average
4. The batch process rebuilds all averages to ensure consistency

This matches accounting standards and your requirements.
