import { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { DatePreset, DateRange, PRESET_OPTIONS, resolvePreset } from '../../lib/dateRange';

interface Props {
  preset: DatePreset;
  onPresetChange: (p: DatePreset) => void;
  range: DateRange;
  onRangeChange: (r: DateRange) => void;
  label?: string;
}

/**
 * Reusable date filter: a preset dropdown (Today / Yesterday / This Week / …)
 * plus From/To date inputs. Selecting a preset auto-fills the From/To dates;
 * choosing "Custom Range" lets the user pick dates manually.
 */
export default function DateRangeFilter({ preset, onPresetChange, range, onRangeChange, label = 'Period' }: Props) {
  // When a non-custom preset is chosen, sync the resolved dates into range.
  useEffect(() => {
    if (preset !== 'custom') {
      const resolved = resolvePreset(preset);
      if (resolved.from !== range.from || resolved.to !== range.to) {
        onRangeChange(resolved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  // Editing a date manually switches the preset to "Custom" so the typed value
  // is kept (a preset would otherwise overwrite it on the next render).
  const handleFrom = (v: string) => {
    if (preset !== 'custom') onPresetChange('custom');
    onRangeChange({ ...range, from: v });
  };
  const handleTo = (v: string) => {
    if (preset !== 'custom') onPresetChange('custom');
    onRangeChange({ ...range, to: v });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">{label}</label>
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as DatePreset)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 min-w-[140px]"
        >
          {PRESET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">From</label>
        <input
          type="date"
          value={range.from}
          onChange={(e) => handleFrom(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">To</label>
        <input
          type="date"
          value={range.to}
          onChange={(e) => handleTo(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
