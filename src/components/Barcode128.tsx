import { useMemo } from 'react';

/**
 * Dependency-free Code 128 (subset B/C auto) barcode renderer that outputs an
 * inline SVG. Used by the Route Card print report to encode the Plan No.
 */

// Code 128 bar/space width patterns for each symbol value (0..106).
const PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '1100011101011',
];

const START_B = 104;
const STOP = 106;

function encodeCode128B(value: string) {
  const codes: number[] = [START_B];
  for (const ch of value) {
    const code = ch.charCodeAt(0) - 32; // subset B: ASCII 32..126 -> 0..94
    codes.push(code < 0 || code > 94 ? 0 : code);
  }
  // Checksum = (start + sum(code_i * position)) mod 103
  let sum = START_B;
  for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
  codes.push(sum % 103);
  codes.push(STOP);
  return codes.map((c) => PATTERNS[c]).join('');
}

/** Builds the bar rectangles + total width for a Code128-B encoded value. */
function buildBars(value: string, barWidth: number) {
  const bits = encodeCode128B(value || '');
  const rects: { x: number; w: number }[] = [];
  let x = 0;
  let i = 0;
  while (i < bits.length) {
    let run = 1;
    while (i + run < bits.length && bits[i + run] === bits[i]) run++;
    if (bits[i] === '1') rects.push({ x: x * barWidth, w: run * barWidth });
    x += run;
    i += run;
  }
  return { bars: rects, width: x * barWidth };
}

/**
 * Returns a standalone <svg> markup string for the given value. Useful for
 * print windows where we build raw HTML instead of React elements.
 */
export function barcode128Svg(
  value: string,
  { height = 48, barWidth = 1.6, showText = true }: { height?: number; barWidth?: number; showText?: boolean } = {}
): string {
  const { bars, width } = buildBars(value, barWidth);
  const textH = showText ? 14 : 0;
  const rects = bars
    .map((b) => `<rect x="${b.x}" y="0" width="${b.w}" height="${height}" fill="#000"/>`)
    .join('');
  const text = showText
    ? `<text x="${width / 2}" y="${height + textH - 2}" text-anchor="middle" font-size="11" font-family="monospace" fill="#000">${value}</text>`
    : '';
  return `<svg width="${width}" height="${height + textH}" viewBox="0 0 ${width} ${height + textH}" preserveAspectRatio="xMidYMid meet"><rect x="0" y="0" width="${width}" height="${height + textH}" fill="#fff"/>${rects}${text}</svg>`;
}

interface Barcode128Props {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
}

export default function Barcode128({
  value,
  height = 48,
  barWidth = 1.6,
  showText = true,
  className,
}: Barcode128Props) {
  const { bars, width } = useMemo(() => buildBars(value, barWidth), [value, barWidth]);

  const textH = showText ? 14 : 0;

  return (
    <svg
      className={className}
      width={width}
      height={height + textH}
      viewBox={`0 0 ${width} ${height + textH}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={width} height={height + textH} fill="#fff" />
      {bars.map((b, idx) => (
        <rect key={idx} x={b.x} y={0} width={b.w} height={height} fill="#000" />
      ))}
      {showText && (
        <text
          x={width / 2}
          y={height + textH - 2}
          textAnchor="middle"
          fontSize={11}
          fontFamily="monospace"
          fill="#000"
        >
          {value}
        </text>
      )}
    </svg>
  );
}
