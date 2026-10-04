import { useRef, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DualDateInputProps {
  /** ISO date string (yyyy-mm-dd) or '' */
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  title?: string;
  minWidth?: number;
}

// Convert an ISO (yyyy-mm-dd) date to a display string (dd-mm-yyyy).
function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// Parse a manually typed date into ISO (yyyy-mm-dd). Accepts dd-mm-yyyy,
// dd/mm/yyyy, dd.mm.yyyy and also yyyy-mm-dd. Returns '' when incomplete/invalid.
function displayToIso(text: string): string {
  const t = text.trim();
  if (!t) return '';
  // Already ISO.
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) {
    const y = m[1], mo = m[2].padStart(2, '0'), d = m[3].padStart(2, '0');
    return isValid(y, mo, d) ? `${y}-${mo}-${d}` : '';
  }
  // dd-mm-yyyy with -, / or . separators.
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(t);
  if (m) {
    const d = m[1].padStart(2, '0'), mo = m[2].padStart(2, '0'), y = m[3];
    return isValid(y, mo, d) ? `${y}-${mo}-${d}` : '';
  }
  return '';
}

function isValid(y: string, mo: string, d: string): boolean {
  const year = Number(y), month = Number(mo), day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(year, month - 1, day);
  return dt.getFullYear() === year && dt.getMonth() === month - 1 && dt.getDate() === day;
}

/**
 * Date field that supports BOTH manual typing (dd-mm-yyyy) and a native date
 * picker (via the calendar icon). Emits an ISO (yyyy-mm-dd) string so callers
 * keep the same data contract as a plain <input type="date">.
 */
export default function DualDateInput({
  value, onChange, disabled, readOnly, className = '', title, minWidth = 130,
}: DualDateInputProps) {
  const [text, setText] = useState(isoToDisplay(value));
  const pickerRef = useRef<HTMLInputElement>(null);

  // Keep the visible text in sync when the ISO value changes externally
  // (e.g. derived expiry date, loading an existing receipt).
  useEffect(() => { setText(isoToDisplay(value)); }, [value]);

  const commit = (raw: string) => {
    const iso = displayToIso(raw);
    if (iso) onChange(iso);
    else if (raw.trim() === '') onChange('');
    // invalid partial input: keep what the user typed, don't emit.
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el || disabled || readOnly) return;
    if (typeof (el as any).showPicker === 'function') (el as any).showPicker();
    else el.click();
  };

  return (
    <div className={`relative ${readOnly || disabled ? 'opacity-90' : ''}`} style={{ minWidth }}>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        placeholder="dd-mm-yyyy"
        disabled={disabled}
        readOnly={readOnly}
        title={title}
        onChange={(e) => { setText(e.target.value); commit(e.target.value); }}
        onBlur={(e) => commit(e.target.value)}
        className={`w-full px-2 py-1.5 pr-7 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${disabled || readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''} ${className}`}
      />
      {!readOnly && (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          title="Open calendar"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed"
        >
          <Calendar size={14} />
        </button>
      )}
      {/* Hidden native date input used purely for the picker UI. */}
      <input
        ref={pickerRef}
        type="date"
        value={value || ''}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => { onChange(e.target.value); setText(isoToDisplay(e.target.value)); }}
        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
