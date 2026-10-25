import { useMemo, useState } from 'react';

export interface LinePoint { label: string; value: number; }

interface LineChartProps {
  data: LinePoint[];
  height?: number;
  color?: string;
  /** Formats the Y-axis / tooltip value. */
  formatValue?: (n: number) => string;
  /** When true, draws the value above each data point. */
  showValueLabels?: boolean;
  /** When true, renders the x-axis (month) labels larger, bolder and darker. */
  xLabelProminent?: boolean;
}

/**
 * Lightweight dependency-free SVG line chart. Renders a responsive line with
 * area fill, dot markers and a hover tooltip. All data is live (passed in).
 */
export default function LineChart({
  data,
  height = 220,
  color = '#1e3a8a',
  formatValue = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n)),
  showValueLabels = false,
  xLabelProminent = false,
}: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  // Y-axis labels reuse the caller's value formatter (so currency charts show
  // ₹ amounts, not bare quantities), but shortened for compact tick spacing.
  const axisLabel = (v: number) => {
    const formatted = formatValue(v);
    const prefix = /^[^\d\s]/.test(formatted) ? formatted[0] : '';
    return prefix + shortNum(v);
  };

  const width = 560;
  const padX = 44;
  const padY = 20;
  // Reserve extra room at the bottom for the larger, bolder month labels so
  // they are never clipped by the chart edge.
  const bottomPad = xLabelProminent ? 24 : 0;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2 - bottomPad;

  const { points, maxV, path, area, ticks } = useMemo(() => {
    const values = data.map((d) => d.value);
    const maxVal = Math.max(1, ...values);
    // Round the axis max up to a "nice" number.
    const niceMax = niceCeil(maxVal);
    const n = data.length;
    const step = n > 1 ? innerW / (n - 1) : 0;
    const pts = data.map((d, i) => {
      const x = padX + (n > 1 ? i * step : innerW / 2);
      const y = padY + innerH - (d.value / niceMax) * innerH;
      return { x, y, ...d };
    });
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = pts.length
      ? `${line} L ${pts[pts.length - 1].x} ${padY + innerH} L ${pts[0].x} ${padY + innerH} Z`
      : '';
    const tickVals = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f);
    return { points: pts, maxV: niceMax, path: line, area: areaPath, ticks: tickVals };
  }, [data, innerW, innerH, padX, padY]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center text-xs text-gray-400" style={{ height }}>No data available</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="xMidYMid meet" role="img">
        {/* Gridlines + Y labels */}
        {ticks.map((t, i) => {
          const y = padY + innerH - (t / maxV) * innerH;
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#eef2f7" strokeWidth={1} />
              <text x={padX - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#94a3b8">{axisLabel(t)}</text>
            </g>
          );
        })}
        {/* Area fill */}
        <defs>
          <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {area && <path d={area} fill="url(#lc-grad)" />}
        {/* Line */}
        {path && <path d={path} fill="none" stroke={color} strokeWidth={2.75} strokeLinejoin="round" strokeLinecap="round" />}
        {/* Dots + X labels + hover targets */}
        {points.map((p, i) => (
          <g key={i}>
            <text
              x={p.x}
              y={height - (xLabelProminent ? 8 : 4)}
              textAnchor="middle"
              fontSize={xLabelProminent ? 13 : 9}
              fontWeight={xLabelProminent ? 700 : 400}
              fill={xLabelProminent ? '#1e293b' : '#94a3b8'}
            >
              {p.label}
            </text>
            {showValueLabels && p.value > 0 && (() => {
              // Draw the value in a small pill above the point so it stays
              // legible even when points sit close together or the line is flat.
              const text = formatValue(p.value);
              const labelY = Math.max(padY + 14, p.y - 12);
              const w = Math.max(28, text.length * 7 + 10);
              const bx = Math.min(Math.max(p.x - w / 2, 2), width - w - 2);
              return (
                <g>
                  <rect x={bx} y={labelY - 12} width={w} height={16} rx={8} fill={color} opacity={0.1} />
                  <text
                    x={bx + w / 2}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill={color}
                  >
                    {text}
                  </text>
                </g>
              );
            })()}
            <circle cx={p.x} cy={p.y} r={hover === i ? 6 : 4.5} fill="#fff" stroke={color} strokeWidth={2.5} />
            <rect
              x={p.x - (innerW / Math.max(1, points.length)) / 2}
              y={padY}
              width={innerW / Math.max(1, points.length)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
        {/* Tooltip */}
        {hover !== null && points[hover] && (
          <g>
            <rect x={Math.min(points[hover].x - 40, width - 86)} y={Math.max(padY, points[hover].y - 34)} width={80} height={24} rx={4} fill="#0f172a" opacity={0.92} />
            <text x={Math.min(points[hover].x, width - 46)} y={Math.max(padY + 16, points[hover].y - 18)} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="bold">
              {formatValue(points[hover].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function shortNum(v: number): string {
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(Math.round(v));
}
