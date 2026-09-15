import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Download, FileBarChart } from 'lucide-react';
import api from '../../lib/api';
import { useDebounce } from '../../lib/useDebounce';
import { DatePreset, DateRange, resolvePreset } from '../../lib/dateRange';
import DateRangeFilter from './DateRangeFilter';
import ReportTable, { Column } from './ReportTable';
import { exportToExcel } from '../../lib/excelExport';

interface ReportShellProps<T> {
  title: string;
  subtitle: string;
  endpoint: string;             // e.g. '/reports/inventory/stock-summary'
  columns: Column<T>[];
  // Optional date filter: which query keys to send from/to as.
  showDate?: boolean;
  datePreset?: DatePreset;      // default preset when date shown
  fromKey?: string;             // default 'from_date'
  toKey?: string;               // default 'to_date'
  // extra filter query params (controlled by parent)
  extraParams?: Record<string, string>;
  // slot to render extra filter controls (selects etc.)
  filterControls?: ReactNode;
  // Export column definition (defaults to columns' key/header)
  exportFileName?: string;
  footer?: (rows: T[], totals: Record<string, number> | null) => ReactNode;
  // When true, hide the page-level title/header + outer padding (used inside tabs).
  embedded?: boolean;
}

export default function ReportShell<T extends Record<string, unknown>>({
  title, subtitle, endpoint, columns,
  showDate = true, datePreset = 'this_month', fromKey = 'from_date', toKey = 'to_date',
  extraParams = {}, filterControls, exportFileName, footer, embedded = false,
}: ReportShellProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [totals, setTotals] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const [preset, setPreset] = useState<DatePreset>(datePreset);
  const [range, setRange] = useState<DateRange>(resolvePreset(datePreset));

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const extraKey = JSON.stringify(extraParams);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (showDate) {
        if (range.from) params.set(fromKey, range.from);
        if (range.to) params.set(toKey, range.to);
      }
      Object.entries(extraParams).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      const sep = endpoint.includes('?') ? '&' : '?';
      const res = await api<{ data: T[]; total: number; totalPages: number; totals: Record<string, number> | null }>(`${endpoint}${sep}${params.toString()}`);
      setRows(res.data || []);
      setTotals(res.totals || null);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setRows([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, showDate, range.from, range.to, fromKey, toKey, extraKey, currentPage, pageSize, endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, range.from, range.to, extraKey]);

  const handleExport = async () => {
    // Fetch up to 5000 records for export (unpaginated view).
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (showDate) {
      if (range.from) params.set(fromKey, range.from);
      if (range.to) params.set(toKey, range.to);
    }
    Object.entries(extraParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', '1');
    params.set('limit', '5000');
    const sep = endpoint.includes('?') ? '&' : '?';
    const res = await api<{ data: T[] }>(`${endpoint}${sep}${params.toString()}`);
    exportToExcel({
      data: res.data || [],
      columns: columns.map(c => ({ key: c.key, header: c.header })),
      fileName: exportFileName || title.replace(/\s+/g, '_'),
    });
  };

  return (
    <div className={embedded ? '' : 'p-4 md:p-6 max-w-[1500px] mx-auto'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {embedded ? (
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-600/20 shrink-0">
              <FileBarChart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-5 shadow-sm">
        <div className="flex flex-col gap-3">
          {showDate && (
            <DateRangeFilter preset={preset} onPresetChange={setPreset} range={range} onRangeChange={setRange} />
          )}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
            {filterControls}
            <div className="flex-1" />
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 md:w-72 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <ReportTable<T>
        columns={columns}
        rows={rows}
        loading={loading}
        rowKey={(r, i) => (r.id as number) ?? i}
        page={currentPage}
        pageSize={pageSize}
        totalRecords={totalRecords}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        footer={footer ? footer(rows, totals) : undefined}
      />
    </div>
  );
}
