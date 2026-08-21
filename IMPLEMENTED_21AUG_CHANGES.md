# 21 Aug Material / Costing Changes Implemented

## Database
- Added `material_transactions` running inventory ledger from the supplied **Transaction table** Excel specification.
- Added running fields: receipt quantity/value, issue quantity/value, balance quantity/value and average rate.
- Added material issue fields: `article`, `color`, `planned_date`.
- Migration: `server/sql/migrations/028_material_transactions_and_issue_updates.sql`.

## Material Receipts
- Receipt create/update/delete now synchronizes rows to `material_transactions` in addition to the existing receipt, warehouse stock and stock ledger tables.
- Running weighted average and balance are recalculated after reference changes.

## Material Issues to Production
- Issue create/update/delete now synchronizes rows to `material_transactions`.
- Item selection uses Material Master data.
- Item code and UOM are auto-populated from the selected item.
- Unit cost is fetched from the latest transaction average rate on or before the selected issue date.
- Amount is calculated as Issue Qty × Unit Cost.
- Server validates issue quantity against the transaction running balance and returns available/current balance in the insufficient-stock error.
- Added Article, Color and Planned Date support.
- Removed Job Order, Issued By and Batch Description from the edited UI flow.
- Added **Import from Previous Issue** for the same article.
- Replaced malformed rupee symbols with `₹` in the issue summary labels.

## General Cost / Machine Cost
- Selected process stage from the Production Status order is used as the initial stage.
- Added date-summary API so planned/output quantities can be refreshed from Production Status transactions for the selected production date.
- Added server-side validation to prevent production/output quantity from exceeding the remaining planned quantity.

## API additions
- `GET /api/material-issues/item-info/:itemId?warehouse_id=&date=`
- `GET /api/material-issues/previous-issue?article=&exclude_id=`
- `GET /api/production-status/orders/:id/date-summary?date=`

## Important before deployment
Run migration 028 on the target database before deploying the updated backend:

```text
server/sql/migrations/028_material_transactions_and_issue_updates.sql
```

Then install dependencies and build normally:

```bash
npm install
npm run build
cd server
npm install
```
