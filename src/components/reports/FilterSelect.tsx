interface Option { value: string; label: string; }

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  allLabel?: string;
  minWidth?: number;
}

export default function FilterSelect({ label, value, onChange, options, allLabel = 'All', minWidth = 150 }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-600 whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minWidth }}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
