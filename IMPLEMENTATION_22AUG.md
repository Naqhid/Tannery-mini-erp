# 22 Aug 2026 Implementation Notes

Implemented core database/backend changes requested from the uploaded codebase and database dump:

- Added migration `030_22aug_chemical_daily_production.sql`.
- Adds `materials.rate` and `materials.opening_stock_value`.
- Promotes existing Corix imported `current_stock`/`last_purchase_price` values into opening stock/rate/value when opening values are empty.
- Adds `material_transactions.opening_value`.
- First material transaction initialization now reads opening quantity/value from `materials`; later transactions do not repeat opening stock.
- Running material transaction recalculation now includes `opening_value`.
- Adds `process_stages.uom`.
- Adds `production_status_transactions.rejection_qty`.
- Daily production WIP calculation is enforced in create/update model code as:
  `opening_qty + input_qty - output_qty - rejection_qty`.
- Adds production-status support columns for production plan linkage and posting metadata.

## Important
Run migration 030 after the existing migrations. The frontend package dependencies were not present in the uploaded ZIP, so `npm run build` could not be executed in this workspace (`vite: not found`).
