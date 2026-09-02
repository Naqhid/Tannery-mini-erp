import { SelectHTMLAttributes, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  required?: boolean;
  gridCol?: boolean;
  options: { value: string; label: string }[];
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  /** Placeholder shown when nothing is selected */
  placeholder?: string;
  /** Disable the built-in search box (rarely needed) */
  searchable?: boolean;
}

const DROPDOWN_HEIGHT = 240;

/**
 * Searchable dropdown that keeps the classic <Select> API.
 * onChange is called with a synthetic event `{ target: { value } }`
 * so existing handlers using `e.target.value` keep working.
 */
export default function Select({
  label,
  error,
  required,
  gridCol,
  options,
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder,
  searchable = true,
  ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const strValue = value === undefined || value === null ? '' : String(value);
  // Some pages pass a leading placeholder option with value ''. Show its label as placeholder.
  const emptyOption = options.find((o) => o.value === '');
  const selectableOptions = options.filter((o) => o.value !== '');
  const selected = options.find((o) => o.value === strValue && o.value !== '');
  const displayPlaceholder = placeholder || emptyOption?.label || 'Select...';

  const filtered = search.trim()
    ? selectableOptions.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : selectableOptions;

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < DROPDOWN_HEIGHT && rect.top > spaceBelow;
    setPos({
      top: openAbove ? rect.top - DROPDOWN_HEIGHT - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    if (searchable && inputRef.current) inputRef.current.focus();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition, searchable]);

  const emit = (val: string) => onChange?.({ target: { value: val } });

  return (
    <div className={`w-full ${gridCol === false ? 'col-span-2' : ''}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-900 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <div
          onClick={() => { if (!disabled) { setOpen((o) => !o); setSearch(''); } }}
          className={`w-full px-2.5 py-2 pr-8 text-xs border rounded-lg bg-white flex items-center justify-between cursor-pointer transition-all ${
            error ? 'border-red-300' : 'border-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-300'} ${
            open ? 'ring-2 ring-blue-500/20 border-blue-500' : ''
          } ${className}`}
          {...(rest as any)}
        >
          <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
            {selected ? selected.label : displayPlaceholder}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {strValue && !disabled && !required && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); emit(''); }}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <X size={12} className="text-gray-400" />
              </button>
            )}
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {open && createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 200), zIndex: 9999, maxHeight: DROPDOWN_HEIGHT }}
            className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto">
              {!required && emptyOption && (
                <div
                  onClick={() => { emit(''); setOpen(false); setSearch(''); }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${strValue === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-400'}`}
                >
                  {emptyOption.label}
                </div>
              )}
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-xs text-gray-400 text-center">No results found</div>
              ) : (
                filtered.slice(0, 200).map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => { emit(opt.value); setOpen(false); setSearch(''); }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${opt.value === strValue ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    {opt.label}
                  </div>
                ))
              )}
              {filtered.length > 200 && (
                <div className="px-3 py-2 text-[10px] text-gray-400 text-center border-t">Showing first 200 results. Type to narrow down.</div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
