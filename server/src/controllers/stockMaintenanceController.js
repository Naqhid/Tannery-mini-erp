import { rebuildAllStock } from '../models/stockLedgerModel.js';

/**
 * POST /stock-maintenance/rebuild
 * Recomputes running balances, moving-average rates, and re-prices posted
 * material issues for every (warehouse, material) in the stock ledger.
 *
 * Use this once after deploying the backdated-transaction fix to correct any
 * historical data that was built incrementally, or any time stock values look
 * inconsistent.
 */
export async function rebuild(_req, res, next) {
  try {
    const result = await rebuildAllStock();
    res.json({ data: result, message: `Rebuilt valuation for ${result.pairs} item/warehouse combinations` });
  } catch (err) { next(err); }
}
