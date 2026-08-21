# TESTING_CHECKLIST.md

# Tannery ERP – 21 Aug Changes Testing Checklist

Use this checklist to test the implemented Material Master, Material Receipt, Material Issue to Production, Transaction Table, General Cost and Machine Cost changes.

---

## 1. Pre-Testing Setup

Before testing:

- [ ] Take a database backup.
- [ ] Confirm the latest backend code is running.
- [ ] Confirm the latest frontend build is deployed.
- [ ] Run the required MySQL migration(s).
- [ ] Confirm the new transaction table exists.
- [ ] Keep a database tool ready to inspect records.
- [ ] Use test data where possible before production testing.

---

# 2. Database Migration Test

## Steps

1. Run the new MySQL migration.
2. Refresh the database schema.
3. Check the transaction table and related new/updated columns.

## Expected Result

- [ ] Migration completes without errors.
- [ ] New transaction table exists.
- [ ] Required columns exist.
- [ ] Required indexes exist.
- [ ] Existing data is not deleted.
- [ ] Existing application pages still load.

**Result:** [ ] Pass  [ ] Fail

---

# 3. Material Master – Average Rate and Opening Stock Value

## Steps

1. Open Material Master.
2. Create or edit a material.
3. Enter Opening Stock Quantity.
4. Enter Average Rate.
5. Save the material.

### Sample Data

- Opening Stock: `100`
- Average Rate: `150`

## Expected Result

Opening Stock Value should be:

`100 × 150 = 15,000`

Check:

- [ ] Average Rate is displayed correctly.
- [ ] Opening Stock Value is calculated correctly.
- [ ] Value is saved correctly after refresh.
- [ ] Existing Material Master functionality still works.

**Result:** [ ] Pass  [ ] Fail

---

# 4. Opening Stock Transaction Test

## Steps

1. Create a material with opening stock.
2. Check the transaction table.

### Sample Data

- Opening Qty: `100`
- Average Rate: `150`
- Opening Value: `15,000`

## Expected Result

Transaction record should contain:

- [ ] Opening Quantity = `100`
- [ ] Opening Value = `15,000`
- [ ] Balance Quantity = `100`
- [ ] Balance Value = `15,000`
- [ ] Average Rate = `150`

**Result:** [ ] Pass  [ ] Fail

---

# 5. Material Receipt Test

## Steps

1. Create a Material Receipt.
2. Select an existing material.
3. Enter receipt quantity and rate.
4. Save.
5. Check the original Material Receipt record.
6. Check the Transaction Table.

### Sample Data

Previous Stock:

- Qty: `100`
- Value: `15,000`
- Average Rate: `150`

New Receipt:

- Qty: `100`
- Rate: `50`

## Expected Result

Receipt Value:

`100 × 50 = 5,000`

New Balance:

- [ ] Balance Qty = `200`
- [ ] Balance Value = `20,000`
- [ ] Average Rate = `100`

Also verify:

- [ ] Record exists in Material Receipt tables.
- [ ] Corresponding record exists in Transaction Table.
- [ ] Reference number is linked correctly.

**Result:** [ ] Pass  [ ] Fail

---

# 6. Weighted Average Rate Test

## Steps

Create multiple receipts for the same material at different rates.

Example:

Opening:

- Qty: `100`
- Rate: `150`

Receipt 1:

- Qty: `100`
- Rate: `50`

Receipt 2:

- Qty: `100`
- Rate: `200`

## Expected Result

Confirm each new transaction uses the previous running balance.

Check:

- [ ] Balance Quantity is correct after every transaction.
- [ ] Balance Value is correct.
- [ ] Average Rate is recalculated correctly.
- [ ] Original Material Master opening stock is not repeatedly used.

**Result:** [ ] Pass  [ ] Fail

---

# 7. Material Issue to Production – Item Dropdown

## Steps

1. Open Material Issue to Production.
2. Add an item row.
3. Open Item Name dropdown.
4. Select an item.

## Expected Result

After selecting Item Name:

- [ ] Item Code auto-populates.
- [ ] UOM auto-populates.
- [ ] Values come from Material Master.
- [ ] User does not need to manually enter Item Code/UOM.

**Result:** [ ] Pass  [ ] Fail

---

# 8. Unit Cost Based on Transaction Date

## Test A – Record Exists on Selected Date

1. Select a production/issue date.
2. Select a material.
3. Confirm a transaction exists for that material on the same date.

Expected:

- [ ] Unit Cost uses the applicable Average Rate for that date.

## Test B – No Record on Selected Date

1. Select a date with no transaction for the material.
2. Ensure an earlier transaction exists.

Expected:

- [ ] Latest valid Average Rate before the selected date is used.
- [ ] Future transaction rate is not used.

**Result:** [ ] Pass  [ ] Fail

---

# 9. Amount Calculation

## Steps

1. Enter Issue Quantity.
2. Check Unit Cost.
3. Verify Amount.

### Sample Data

- Issue Qty: `50`
- Unit Cost: `100`

## Expected Result

`Amount = 50 × 100 = 5,000`

Check:

- [ ] Amount updates automatically.
- [ ] Changing Issue Qty recalculates Amount.
- [ ] Changing Unit Cost recalculates Amount.

**Result:** [ ] Pass  [ ] Fail

---

# 10. Material Issue Totals

Add multiple item rows.

## Expected Result

Verify:

- [ ] Total Items is correct.
- [ ] Total Required Quantity is the sum of all Required Qty.
- [ ] Total Issue Quantity is the sum of all Issue Qty.
- [ ] Total Material Cost is the sum of all Amount values.
- [ ] Other Charges is calculated correctly.
- [ ] Totals update after adding/removing/editing rows.

**Result:** [ ] Pass  [ ] Fail

---

# 11. Stock Availability Validation

## Steps

1. Select an item with known available stock.
2. Enter Issue Quantity greater than available stock.
3. Attempt to save.

### Example

Available Stock: `100 Kg`

Issue Qty: `120 Kg`

## Expected Result

- [ ] Save is blocked.
- [ ] Error shows `Insufficient Stock`.
- [ ] Available stock quantity is displayed.
- [ ] Backend also rejects the request if frontend validation is bypassed.

**Result:** [ ] Pass  [ ] Fail

---

# 12. Valid Material Issue Test

## Steps

1. Select an item with sufficient stock.
2. Enter Issue Qty less than available Balance Qty.
3. Save.
4. Check Material Issue record.
5. Check Transaction Table.

### Example

Previous Balance:

- Qty: `200`
- Value: `20,000`
- Average Rate: `100`

Issue:

- Qty: `50`

## Expected Result

Issue Value:

`50 × 100 = 5,000`

New Balance:

- [ ] Balance Qty = `150`
- [ ] Balance Value = `15,000`
- [ ] Average Rate remains `100`

Also verify:

- [ ] Original Material Issue record is saved.
- [ ] Transaction Table record is saved.

**Result:** [ ] Pass  [ ] Fail

---

# 13. Article, Color and Planned Date Changes

## Steps

Open Material Issue to Production Add/Edit.

## Expected Result

- [ ] Product is renamed to Article.
- [ ] Required Date is renamed to Planned Date.
- [ ] Color field is present after Article.
- [ ] Batch Description is removed from active form.
- [ ] Issued By is removed from active form.
- [ ] Job is removed from active form.
- [ ] Order is removed from active form.

**Result:** [ ] Pass  [ ] Fail

---

# 14. Import from Previous Issue

## Steps

1. Select an Article that already has a previous Material Issue.
2. Click `Import from Previous Issue`.

## Expected Result

- [ ] Previous issue item details are imported.
- [ ] Imported values remain editable.
- [ ] Imported data is not automatically saved.
- [ ] User can review before saving.

## No Previous Issue Test

Select an Article without previous issues.

Expected:

- [ ] Message shows: `No previous material issue found for this article.`

**Result:** [ ] Pass  [ ] Fail

---

# 15. Edit Material Receipt

## Steps

1. Create multiple transactions for the same material.
2. Edit an earlier Material Receipt.
3. Change quantity or rate.
4. Save.

## Expected Result

- [ ] Original Material Receipt updates.
- [ ] Corresponding Transaction Table record updates.
- [ ] Subsequent Balance Quantities are recalculated.
- [ ] Subsequent Balance Values are recalculated.
- [ ] Subsequent Average Rates are recalculated where required.

**Result:** [ ] Pass  [ ] Fail

---

# 16. Edit Material Issue

## Steps

1. Create multiple transactions.
2. Edit an earlier Material Issue.
3. Change Issue Quantity.
4. Save.

## Expected Result

- [ ] Original Material Issue updates.
- [ ] Corresponding Transaction Table record updates.
- [ ] Subsequent balances are recalculated correctly.
- [ ] Stock does not become inconsistent.

**Result:** [ ] Pass  [ ] Fail

---

# 17. General Cost – Production Date

## Steps

1. Open General Cost.
2. Select Production Date.
3. Check Planned Quantity.
4. Change Production Date.

## Expected Result

- [ ] Planned Quantity comes from the selected date.
- [ ] Changing Production Date refreshes applicable data.
- [ ] Latest planned quantity is not always used incorrectly.

**Result:** [ ] Pass  [ ] Fail

---

# 18. General Cost – Stage Dropdown

## Steps

1. Open General Cost Add/Edit.
2. Select the relevant production context.
3. Open Stage dropdown.

## Expected Result

- [ ] Stage dropdown is present.
- [ ] Applicable stages are loaded dynamically.
- [ ] Unrelated stages are not shown.
- [ ] Stage values are not hardcoded.

**Result:** [ ] Pass  [ ] Fail

---

# 19. Machine Cost – Stage Dropdown

## Steps

1. Open Machine Cost Add/Edit.
2. Select the relevant production context.
3. Open Stage dropdown.

## Expected Result

- [ ] Stage dropdown is present.
- [ ] Correct stages are shown.
- [ ] Stages are loaded dynamically.

**Result:** [ ] Pass  [ ] Fail

---

# 20. Balance Quantity Showing 0

## Steps

1. Open Costing/Machine Cost workflow.
2. Select a record with valid inventory/production balance.

## Expected Result

- [ ] Balance Quantity does not incorrectly show `0`.
- [ ] Correct balance is displayed.

**Result:** [ ] Pass  [ ] Fail

---

# 21. Output Quantity Validation

## Steps

1. Note Planned Quantity.
2. Enter Output Quantity greater than Planned Quantity.
3. Attempt to save.

### Example

- Planned Qty: `100`
- Output Qty: `120`

## Expected Result

- [ ] Save is blocked.
- [ ] Error shows: `Output Quantity cannot be greater than Planned Quantity.`
- [ ] Backend also validates the rule.

**Result:** [ ] Pass  [ ] Fail

---

# 22. Warehouse-Wise Stock Test

## Steps

1. Use the same material in two warehouses.
2. Create transactions in each warehouse.
3. Check balances.

## Expected Result

- [ ] Warehouse A balance is calculated separately.
- [ ] Warehouse B balance is calculated separately.
- [ ] Stock is not mixed between warehouses.
- [ ] Average Rate is determined correctly for each warehouse.

**Result:** [ ] Pass  [ ] Fail

---

# 23. Stock Transfer Test

If stock transfer is connected to the Transaction Table:

## Steps

1. Transfer material from Warehouse A to Warehouse B.
2. Check both transaction records.

## Expected Result

Source:

- [ ] Transfer Out reduces source quantity/value.

Destination:

- [ ] Transfer In increases destination quantity/value.

Also verify:

- [ ] Same transfer reference links both sides.
- [ ] Total inventory value is preserved.
- [ ] No duplicate/unbalanced transaction occurs.

**Result:** [ ] Pass  [ ] Fail

---

# 24. Physical Stock Adjustment Test

If Physical Stock affects the Transaction Table:

## Steps

1. Enter physical quantity different from system quantity.
2. Save the physical stock record.

## Expected Result

- [ ] Variance Quantity is calculated.
- [ ] Adjustment transaction is created where applicable.
- [ ] Transaction history remains traceable.
- [ ] Balance updates correctly.

**Result:** [ ] Pass  [ ] Fail

---

# 25. Date-Based Historical Rate Regression Test

Create transactions on multiple dates.

Example:

| Date | Transaction | Average Rate |
|---|---|---:|
| Day 1 | Receipt | 100 |
| Day 5 | Receipt | 120 |
| Day 10 | Receipt | 150 |

Test Material Issue dated Day 6.

Expected:

- [ ] Use the latest valid rate available on/before Day 6.
- [ ] Do not use Day 10 future rate.

**Result:** [ ] Pass  [ ] Fail

---

# 26. Refresh and Persistence Test

## Steps

1. Create Material Receipt.
2. Create Material Issue.
3. Refresh the browser.
4. Log out and log in.
5. Recheck records.

## Expected Result

- [ ] Data remains saved.
- [ ] Transaction balances remain correct.
- [ ] Average Rates remain correct.
- [ ] No frontend-only calculation is lost.

**Result:** [ ] Pass  [ ] Fail

---

# 27. Backend API Validation Test

For important operations, test backend APIs directly or through browser/network tools.

Verify:

- [ ] Invalid issue quantity is rejected.
- [ ] Incorrect output quantity is rejected.
- [ ] Future Average Rate is not used.
- [ ] Required transaction data is created.
- [ ] Related operations fail together if database transaction fails.

**Result:** [ ] Pass  [ ] Fail

---

# 28. Final Regression Test

Test existing workflows that should not be broken:

- [ ] Material Master
- [ ] Material Receipts
- [ ] Material Issues to Production
- [ ] Warehouse Stock
- [ ] Production Planning
- [ ] General Cost
- [ ] Machine Cost
- [ ] Physical Stock
- [ ] Existing reports/pages related to stock

**Result:** [ ] Pass  [ ] Fail

---

# 29. Final Sign-Off

Before deploying to production:

- [ ] Database backup taken.
- [ ] Migration completed successfully.
- [ ] All critical tests passed.
- [ ] No console errors.
- [ ] No backend errors.
- [ ] Material Receipt tested.
- [ ] Material Issue tested.
- [ ] Weighted Average Rate tested.
- [ ] Insufficient Stock tested.
- [ ] General Cost tested.
- [ ] Machine Cost tested.
- [ ] Existing workflows regression tested.

## Overall Status

- [ ] READY FOR DEPLOYMENT
- [ ] NEEDS FIXES

### Notes

Add any failed test details here:

---

---

---
