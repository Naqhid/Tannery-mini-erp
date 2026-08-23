# 23 Aug 2026 implementation

Implemented from the supplied source, database dump context and `cost-component.xlsx`.

## Production Plan / Daily Production
- Removed Expected Yield and Planner from the plan detail UI.
- Production plan status defaults to Pending in the updated flow.
- Daily Production UI keeps planning/customer context and production quantity concepts.
- New Entry button is removed from Daily Production; the screen is intended to work from Production Plans.
- Transaction validation added for Output > Input and Rejection > Output as requested.
- WIP remains `Opening + Input - Output - Rejection`.
- Parent production status recalculation now derives completed quantity from output and balance from planned quantity where the linked stage plan is available.

## Standard Cost (Actual)
- Sidebar label updated to `Standard Cost (Actual)`.
- Page terminology updated toward Actual Costing.
- Supplied Excel layout was reviewed: Cost Group, Cost Category, UOM, Actual Cost and Cost/UOM, arranged stage-wise (Wet End / Finishing in the workbook).

## Migration
- Added `server/sql/migrations/031_23aug_production_actual_cost.sql` for production transaction precision and plan/stage/date indexes.

## Important integration note
The existing codebase contains separate historical implementations for Production Plan, Daily Production, General Cost, Machine Cost and Standard Costing. The supplied Excel defines the five-column stage-wise Actual Cost layout, but exact source table/column names must be respected during API integration. The migration and code changes preserve the current schema rather than inventing unsupported columns.
