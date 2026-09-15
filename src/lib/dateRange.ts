// Shared date-range preset helpers used by all report pages.
// A preset resolves to a { from, to } pair of YYYY-MM-DD strings.

export type DatePreset =
  | 'custom'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'last_7_days'
  | 'last_30_days'
  | 'all';

export interface DateRange {
  from: string;
  to: string;
}

export const PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Resolve a preset into a concrete { from, to } range. For 'all' and 'custom'
// the caller keeps its own dates (returns empty strings so the API omits them).
export function resolvePreset(preset: DatePreset): DateRange {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  switch (preset) {
    case 'today': {
      const t = startOfDay(now);
      return { from: toISO(t), to: toISO(t) };
    }
    case 'yesterday': {
      const y = startOfDay(now);
      y.setDate(y.getDate() - 1);
      return { from: toISO(y), to: toISO(y) };
    }
    case 'this_week': {
      const d = startOfDay(now);
      const day = d.getDay(); // 0 = Sun
      const diff = day === 0 ? 6 : day - 1; // week starts Monday
      const monday = new Date(d);
      monday.setDate(d.getDate() - diff);
      return { from: toISO(monday), to: toISO(now) };
    }
    case 'last_week': {
      const d = startOfDay(now);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const thisMonday = new Date(d);
      thisMonday.setDate(d.getDate() - diff);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      return { from: toISO(lastMonday), to: toISO(lastSunday) };
    }
    case 'this_month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISO(first), to: toISO(now) };
    }
    case 'last_month': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toISO(first), to: toISO(last) };
    }
    case 'this_quarter': {
      const q = Math.floor(now.getMonth() / 3);
      const first = new Date(now.getFullYear(), q * 3, 1);
      return { from: toISO(first), to: toISO(now) };
    }
    case 'this_year': {
      const first = new Date(now.getFullYear(), 0, 1);
      return { from: toISO(first), to: toISO(now) };
    }
    case 'last_7_days': {
      const from = startOfDay(now);
      from.setDate(from.getDate() - 6);
      return { from: toISO(from), to: toISO(now) };
    }
    case 'last_30_days': {
      const from = startOfDay(now);
      from.setDate(from.getDate() - 29);
      return { from: toISO(from), to: toISO(now) };
    }
    case 'all':
    case 'custom':
    default:
      return { from: '', to: '' };
  }
}
