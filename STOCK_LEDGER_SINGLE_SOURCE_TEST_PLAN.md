# Stock Ledger Single-Source — Test Plan (UI only)

This plan is **UI-only**. You test everything through the app screens, and the
only time you touch the database is to **look at the `stock_ledger` table in
DBeaver** — just open the table and view the rows, no SQL queries needed.

## What changed (so you know what you're testing)

`stock_ledger` is now the **single source of truth** for stock. The old
`warehouse_stock` and `material_transactions` tables are **gone**. Live stock,
average rate, and the opening → in → out → balance picture all come from the
ledger.

- Live stock for an item in a warehouse = its **latest ledger row's balance**.
- Average rate = balance value ÷ balance qty.
- Each movement's closing balance carries forward as the next movement's opening
  (same item) — the day-to-day carry forward.

---

## How to view the ledger in DBeaver (no queries)

1. Open DBeaver and connect to the `tannery_mini_erp` database.
2. In the left tree: **tannery_mini_erp → Tables**.
3. Confirm these two tables are **no longer listed**:
   - `warehouse_stock`
   - `material_transactions`
4. Double-click **`stock_ledger`** → open the **Data** tab.
5. Use the grid's built-in column **filter/sort** (click a column header, or the
   funnel icon) to narrow down — e.g. sort by `material_id` then
   `transaction_date`, or filter `material_id` to the item you're testing. This
   is all point-and-click in DBeaver; you don't type SQL.

Columns to watch in `stock_ledger`:
`transaction_date`, `transaction_type`, `reference_no`, `material_id`,
`warehouse_id`, `opening_qty`, `opening_value`, `in_qty`, `in_value`,
`out_qty`, `out_value`, `balance_qty`, `balance_value`, `unit_cost`.

> Tip: after each app action below, click **Refresh** (F5) on the `stock_ledger`
> Data tab to see the new/changed rows.

You can also view the same data **inside the app** (no DB needed) at:
**Reports → Inventory Reports → "Stock Ledger"** tab (filter by warehouse,
transaction type, date).

---

## Pre-flight (UI)

- App loads and you can log in.
- Open **Reports → Inventory Reports → Stock Ledger** — it loads rows.
- Open **Reports → Inventory Reports → Closing Stock (Stock Valuation)** — it
  loads with quantities and values.
- In DBeaver, confirm `warehouse_stock` and `material_transactions` are gone and
  `stock_ledger` is present (steps above).

## Known pending item (not a bug)

- The **"Sale Orders" → "Material Requirement"** heading rename on the Material
  Requirement page is **not done yet**. Ignore it during this round.

---

## 1. Live stock shows correctly (read path)

| # | Screen | Do this | Expect |
|---|--------|---------|--------|
| 1.1 | Reports → Closing Stock | Open, no filters | Each item shows closing qty, average rate, stock value. |
| 1.2 | Reports → Closing Stock | Filter by a warehouse | Only that warehouse's stock shows. |
| 1.3 | Reports → Stock Ledger | Filter by a warehouse + item | Rows show opening → receipt/issue/transfer/outbound → closing. Last row's closing = current stock. |
| 1.4 | Material Issue (new) | Pick a warehouse + material | "Available stock" matches that item's latest closing in the Stock Ledger report. |
| 1.5 | Dashboard | Open dashboard | Low-stock alerts, low-stock count, and inventory value look right (driven by the ledger now). |

**DBeaver check:** open `stock_ledger`, sort by `material_id` + `transaction_date`,
and confirm the last row's `balance_qty` for an item equals what the app shows as
its current stock.

---

## 2. Material Receipt (inbound)

| # | Action (UI) | Expect in app | Expect in `stock_ledger` (DBeaver) |
|---|-------------|---------------|-------------------------------------|
| 2.1 | Create a receipt, save as **Draft** | Saved as Draft | **No** new rows for it. |
| 2.2 | **Post** the receipt | Stock goes up | New `Receipt` row(s). `in_qty` = received qty, `in_value` = qty × rate, `balance_qty`/`balance_value` increase, `opening_qty` = previous balance. |
| 2.3 | Edit a posted receipt (change qty or rate) | Stock + average rate update | Row values update; balances recompute with no double count. |
| 2.4 | Create a receipt with an **earlier date** than existing rows | Later balances shift | After refresh, every later row for that item has recomputed `balance_qty`/`balance_value`. |
| 2.5 | Delete a **posted** receipt | Stock returns to before | Its rows disappear; later balances rebuild. Deleting a **Draft** = no change. |

---

## 3. Material Issue (outbound)

| # | Action (UI) | Expect in app | Expect in `stock_ledger` (DBeaver) |
|---|-------------|---------------|-------------------------------------|
| 3.1 | Try to issue **more than available** (normal warehouse) | Rejected: "Insufficient stock. Available stock: X". Nothing saved. | No new rows. |
| 3.2 | Issue **within** available | Stock drops; line cost = average rate | `Issue` row: `out_qty` set, `out_value` = qty × running average, balances drop. |
| 3.3 | Issue with an **earlier date** | Later balances shift | Later rows recompute after refresh. |
| 3.4 | Edit a posted issue | Balances stay consistent | Old effect reversed, new applied. |
| 3.5 | Delete a **posted** issue | Stock goes back up | Its rows removed; balances rebuild. Draft delete = no change. |
| 3.6 | Issue from a warehouse that **allows negative stock** | Allowed to go negative | `balance_qty` can go below 0. |

---

## 4. Stock Transfer

| # | Action (UI) | Expect in app | Expect in `stock_ledger` (DBeaver) |
|---|-------------|---------------|-------------------------------------|
| 4.1 | Transfer more than source has | Rejected: "Insufficient stock…" | No rows. |
| 4.2 | Valid transfer A → B | Source drops, destination rises | A `Transfer Out` row (source) and a `Transfer In` row (destination). |
| 4.3 | Re-check both warehouses in Closing Stock | Total across both unchanged | Per-warehouse balances correct. |

---

## 5. Outbound Delivery

| # | Action (UI) | Expect in app | Expect in `stock_ledger` (DBeaver) |
|---|-------------|---------------|-------------------------------------|
| 5.1 | Outbound qty more than available | Rejected: "Insufficient stock for …" | No rows. |
| 5.2 | Valid outbound delivery | Source stock drops | `Outbound Delivery` row with `out_qty`; balance drops. |

---

## 6. Physical Stock (adjustment)

| # | Action (UI) | Expect in app | Expect in `stock_ledger` (DBeaver) |
|---|-------------|---------------|-------------------------------------|
| 6.1 | Complete an entry with a **positive** qty | Stock increases | `Stock Adjustment` row with `in_qty`. |
| 6.2 | Complete one with a **negative** qty | Stock decreases | `Stock Adjustment` row with `out_qty`. |
| 6.3 | Delete / cancel a completed entry | Stock reverts | Its rows reverse; no errors. |

---

## 7. Opening stock & carry-forward (the core requirement)

| # | Where | Expect |
|---|-------|--------|
| 7.1 | `stock_ledger` in DBeaver, filter an item that has opening stock | There is an `Opening` row (transaction_type = `Opening`) carrying the opening qty/value. |
| 7.2 | Same item, sort by `transaction_date` | Each row's `opening_qty` / `opening_value` equals the **previous** row's `balance_qty` / `balance_value`. |
| 7.3 | Reports → Stock Ledger for that item | Opening → movements → Closing read continuously; last closing = current stock. |
| 7.4 | Any row | `balance_value ÷ balance_qty` ≈ the average rate shown in the app. |

---

## 8. Regression checks (UI)

| # | Area | Expect |
|---|------|--------|
| 8.1 | Costing reports (WIP / standard cost) | Issue costs stay consistent after a back-dated receipt. |
| 8.2 | BOM screen | Material unit cost auto-fills from the latest ledger cost (else master rate). |
| 8.3 | Material master | A material that has ledger movement can't be deleted (locked). |
| 8.4 | Warehouse master | Deleting an empty warehouse still works, no error. |
| 8.5 | Throughout | No error toasts/pages; nothing mentions `warehouse_stock` or `material_transactions`. |

---

## Rollback (if something is seriously wrong)

Backups taken before the change:
- `tannery_mini_erp_pre-restore-backup.sql` — your local DB before the restore.
- `tannery_mini_erp_2026-10-23-04-53-09.sql` — the server dump that was restored.

Restoring either (into a fresh `tannery_mini_erp`) brings back the old schema.
A DB rollback should be paired with a code rollback (the ledger-only changes),
since the current code expects the new ledger-only schema.
