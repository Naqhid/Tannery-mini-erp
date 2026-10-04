import { useMemo, useState } from 'react';

export interface DonutSlice { label: string; value: number; }

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  formatValue?: (n: number) => string;
}

const PALETTE = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#dc2626', '#0891b2', '#64748b'];

/**
 * Lightweight dependency-free SVG donut chart with a legend. Data is live.
 */
export default function DonutChart({
  data,
  size = 180,
  thickness = 34,
  formatValue = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n)),
}: DonutChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { slices, total } = useMemo(() => {
    const t = data.reduce((s, d) => s + Math.max(0, d.value), 0);
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circ = 2 * Math.PI * r;
    let acc = 0;
    const sl = data.map((d, i) => {
      const frac = t > 0 ? Math.max(0, d.value) / t : 0;
      const dash = frac * circ;
      const offset = acc * circ;
      acc += frac;
      return { ...d, i, frac, dash, gap: circ - dash, offset, r, cx, cy, circ, color: PALETTE[i % PALETTE.length] };
    });
    return { slices: sl, total: t };
  }, [data, size, thickness]);

  if (data.length === 0 || total === 0) {
    return <div className="flex items-center justify-center text-xs text-gray-400" style={{ height: size }}>No data available</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full min-w-0 overflow-hidden">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {slices.map((s) => (
              <circle
                key={s.i}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill="none"
                stroke={s.color}
                strokeWidth={hover === s.i ? thickness + 4 : thickness}
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={-s.offset}
                onMouseEnter={() => setHover(s.i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: 'stroke-width 0.15s' }}
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hover !== null ? (
            <>
              <span className="text-[10px] text-gray-500">{slices[hover].label}</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(slices[hover].frac * 100)}%</span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-900">{formatValue(total)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 w-full space-y-1.5">
        {slices.map((s) => (
          <div
            key={s.i}
            className="flex items-start gap-2 text-xs rounded-md px-1.5 py-1 hover:bg-gray-50"
            onMouseEnter={() => setHover(s.i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0 mt-1" style={{ backgroundColor: s.color }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-gray-700">{s.label}</span>
              <span className="block text-gray-500">
                <span className="font-semibold text-gray-900">{formatValue(s.value)}</span>
                <span className="text-gray-400"> ({Math.round(s.frac * 100)}%)</span>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
