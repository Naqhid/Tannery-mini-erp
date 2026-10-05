export const fmtNum = (n: unknown) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

export const fmtQty = (n: unknown) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(n) || 0);

export const fmtDate = (d: unknown) =>
  d ? new Date(d as string).toLocaleDateString('en-IN') : '—';

export const fmtPct = (n: unknown) => `${(Number(n) || 0).toFixed(1)}%`;
