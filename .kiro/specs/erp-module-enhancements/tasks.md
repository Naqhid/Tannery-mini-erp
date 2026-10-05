# Implementation Tasks

## Task 1: Database Migration - Add columns to materials table for dual-UOM and currency
- [x] Create migration file `server/sql/migrations/016_material_uom_currency.sql`
- [x] Add `primary_uom_id INT NULL` column to `materials` table with FK to `uom(id)`
- [x] Add `secondary_uom_id INT NULL` column to `materials` table with FK to `uom(id)`
- [x] Add `currency VARCHAR(10) DEFAULT 'INR'` column to `materials` table
- [x] Update material_receipt_items table: add `primary_uom_qty DECIMAL(12,4)`, `secondary_uom_qty DECIMAL(12,4)`, `currency VARCHAR(10)`, `exchange_rate DECIMAL(12,6) DEFAULT 1.00`, `rate_fc DECIMAL(12,4)`, `rate_inr DECIMAL(12,4)`, `amount_fc DECIMAL(14,4)`, `amount_inr DECIMAL(14,4)`, `primary_uom VARCHAR(50)`, `secondary_uom VARCHAR(50)`
- [x] Update material_receipts table: add `gst_percent DECIMAL(5,2) DEFAULT 0`, `cgst_amount DECIMAL(14,4) DEFAULT 0`, `sgst_amount DECIMAL(14,4) DEFAULT 0`, `total_gst_amount DECIMAL(14,4) DEFAULT 0`, `total_other_charges DECIMAL(14,4) DEFAULT 0`

> Requirements: 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25

## Task 2: Backend - Update Material Model for dual-UOM and currency
- [x] Update `server/src/models/materialModel.js` `create()` to include `primary_uom_id`, `secondary_uom_id`, and `currency` fields
- [x] Update `server/src/models/materialModel.js` `update()` to include `primary_uom_id`, `secondary_uom_id`, and `currency` fields
- [x] Update `server/src/models/materialModel.js` `getById()` query to join UOM table and return primary_uom_name and secondary_uom_name
- [x] Update `server/src/models/materialModel.js` `getDropdown()` to return `primary_uom_id`, `secondary_uom_id`, `currency` fields along with UOM names

> Requirements: 10, 12, 13, 16

## Task 3: Frontend - Update Material Master Form for dual-UOM, restricted type, and currency
- [x] Update `src/pages/MaterialMasterForm.tsx` to add Primary UOM dropdown using `useDropdowns(['uom'])` (same pattern as ProductMasterForm)
- [x] Update `src/pages/MaterialMasterForm.tsx` to add Secondary UOM dropdown with "NA" option using `useDropdowns(['uom'])`
- [x] Change `MATERIAL_TYPES` constant to only include `['Wet-end', 'Finishing']`
- [x] Add Currency dropdown in material information section with options: INR, USD, EUR, GBP
- [x] Update form state interface `MaterialData` to include `primary_uom_id`, `secondary_uom_id`, `currency`
- [x] Update save payload to include new fields
- [x] Update `fetchMaterial` to load new fields from API response

> Requirements: 10, 11, 12

## Task 4: Frontend - Update Material Master List page for new type filters
- [x] Update `src/pages/MaterialMaster.tsx` filter options for Type to only show "Wet-end" and "Finishing"
- [x] Update `TYPE_COLORS` map to use "Wet-end" and "Finishing" keys instead of old values

> Requirements: 11

## Task 5: Backend - Update Material Receipt Model for new fields
- [x] Update `server/src/models/materialReceiptModel.js` `create()` to accept and persist new item fields: `primary_uom_qty`, `secondary_uom_qty`, `currency`, `exchange_rate`, `rate_fc`, `rate_inr`, `amount_fc`, `amount_inr`, `primary_uom`, `secondary_uom`
- [x] Update `create()` to accept and persist receipt-level fields: `gst_percent`, `cgst_amount`, `sgst_amount`, `total_gst_amount`, `total_other_charges`
- [x] Update `create()` grand total calculation: `total_amount_inr + total_gst_amount + total_other_charges`
- [x] Update `update()` with same new item and receipt-level fields
- [x] Update `getById()` to return new fields from material_receipt_items including UOM names from materials join
- [x] Remove dependency on `received_qty` and `batch_no` for stock ledger (use `primary_uom_qty` instead for stock updates)

> Requirements: 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25

## Task 6: Frontend - Redesign Material Receipt Item Grid
- [x] Update `src/pages/MaterialReceiptEntryDetail.tsx` `Item` interface to add: `primary_uom`, `secondary_uom`, `primary_uom_qty`, `secondary_uom_qty`, `currency`, `exchange_rate`, `rate_fc`, `rate_inr`, `amount_fc`, `amount_inr`
- [x] Remove `received_qty` and `batch_no` fields from the Item interface and emptyItem
- [x] Update `updateItem()` function: when material is selected, auto-populate `primary_uom`, `secondary_uom`, `currency` from material dropdown data
- [x] Add logic to disable `secondary_uom_qty` input when `secondary_uom` is "NA" or empty
- [x] Add logic: when currency is "INR", set exchange_rate to 1.00 and make it read-only
- [x] Add computed fields: `rate_inr = rate_fc * exchange_rate`, `amount_fc = primary_uom_qty * rate_fc`, `amount_inr = amount_fc * exchange_rate`
- [x] Update grid column headers: remove "Received Qty", "Batch No"; rename "Rate (₹)" to "Rate(FC)"; add "Rate(INR)", "Amount(FC)", "Amount(INR)", "Currency", "Exchange Rate", "Primary UOM", "Secondary UOM", "Primary UOM Qty", "Secondary UOM Qty"
- [x] Update `emptyItem` default values and `genKey` usage

> Requirements: 13, 14, 15, 16, 17, 18, 19, 20, 21, 22

## Task 7: Frontend - Redesign Material Receipt Summary Section
- [x] Remove "Total Qty" display from summary section
- [x] Change total amount label to "Total Amount (INR)" summing all item `amount_inr` values
- [x] Add GST % input field below Total Amount(INR)
- [x] Add CGST % display and calculated CGST amount (Total Amount INR × GST%/2)
- [x] Add SGST % display and calculated SGST amount (Total Amount INR × GST%/2)
- [x] Add Total GST Amount display (CGST + SGST)
- [x] Add Freight, Loading/Unloading, Other Charges input fields (these already exist in receipt header - move/replicate to summary)
- [x] Add Total Other Charges = Freight + Loading/Unloading + Other Charges
- [x] Add Grand Total = Total Amount(INR) + Total GST Amount + Total Other Charges
- [x] Ensure all computed values recalculate on input change

> Requirements: 23, 24, 25

## Task 8: Backend - Update Sales Order Model for auto-increment
- [x] Verify `server/src/models/salesOrderModel.js` `getNextOrderNo()` already auto-generates SO numbers (it does: `SO-YYYY-XXXXX` format)
- [x] Ensure the `create()` function always uses auto-generated order_no (already does via `data.order_no || await getNextOrderNo()`)
- [x] No backend changes needed for requirements 2, 3 (removing fields) - these are frontend-only since backend already uses `|| null` for optional fields

> Requirements: 1, 2, 3

## Task 9: Frontend - Simplify Sales Order Header
- [x] Update `src/pages/SalesOrderDetail.tsx` to remove Delivery Date field from header
- [x] Remove Price List dropdown from header
- [x] Remove Sales Person input from header
- [x] Ensure the order_no field is displayed as read-only (auto-generated)
- [x] Add Currency dropdown that affects column header labels (already has currency field, just need to wire up header labels)

> Requirements: 1, 2, 3, 7

## Task 10: Frontend - Sales Order Inline Grid Editing
- [x] Update `src/pages/SalesOrderDetail.tsx` to remove the item add/edit popup modal
- [x] Implement inline editable row in items grid table when "Add New" is clicked
- [x] Allow inline editing of all fields: article code, article (description), leather type, finish color, thickness, UOM, quantity, unit price, discount %
- [x] Rename column header "Item Code" → "Article Code"
- [x] Rename column header "Description" → "Article"
- [x] Update Rate and Amount column headers to include selected currency code (e.g., "Rate (USD)", "Amount (USD)")

> Requirements: 4, 5, 6, 7, 8

## Task 11: Frontend - Tax Auto-Population from Group Master in Sales Order
- [x] When a line item's article code/article is selected (product selected), look up the product's `group_id`
- [x] Fetch the group's `gst_rate` from the Group Master data (available via `useDropdowns(['group-master'])`)
- [x] Auto-populate the tax_percent field in the order summary with the GST rate from the group
- [x] If no group is associated, default tax to 0 and allow manual entry

> Requirements: 9
