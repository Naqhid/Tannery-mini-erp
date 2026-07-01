import { getDashboardStats } from '../services/dashboardService.js';

export async function stats(_req, res, next) {
  try {
    const data = await getDashboardStats();
    res.json({ data });
  } catch (err) { next(err); }
}
