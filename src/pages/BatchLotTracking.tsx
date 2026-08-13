import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, RotateCcw, Download, ArrowLeft, Loader2, ScanLine } from 'lucide-react';
import api from '../lib/api';
import BarcodeScanner from '../components/BarcodeScanner';

interface Batch {
  id: number;
  batch_no: string;
  production_date: string | null;
  stage: string;
  current_stage: string;
  total_receipt_qty: number;
  total_output_qty: number;
  yield_percent: number;
  status: string;
  items?: BatchLineItem[];
}

interface BatchLineItem {
  id: number;
  seq: number;
  customer_name: string | null;
  order_no: string | null;
  article_code: string | null;
  article_name: string | null;
  finish: string | null;
  color: string | null;
  receipt_qty: number;
  uom: string;
  output_qty: number;
  output_uom: string;
}

export default function BatchLotTracking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Search filters
  const [barcode, setBarcode] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [stage, setStage] = useState('Tanning');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleBarcodeScan = (scannedValue: string) => {
    try {
      const trimmed = scannedValue.trim();
      toast.info(`Scanned value: "${trimmed}"`);
      setBarcode(trimmed);
      setBatchNo(trimmed);
      setScannerOpen(false);
      // Auto-search after scan
      setTimeout(() => {
        handleSearchWithValue(trimmed);
      }, 300);
    } catch (err: any) {
      toast.error(`Scan handler error: ${err.message}`);
    }
  };

  // Fetch batch by ID (for direct URL access)
  const fetchBatch = useCallback(async (batchId: string) => {
    try {
      setLoading(true);
      const res = await api<{ data: Batch }>(`/batches/${batchId}`);
      if (res.data) {
        setBatch(res.data);
        // Populate filter fields from result
        setBatchNo(res.data.batch_no || '');
        setProductionDate(res.data.production_date ? res.data.production_date.split('T')[0] : '');
        setStage(res.data.current_stage || res.data.stage || '');
      } else {
        setBatch(null);
      }
    } catch {
      setBatch(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search batch using tracking endpoint
  const handleSearch = async () => {
    const searchTerm = barcode || batchNo;
    if (!searchTerm && !productionDate && !stage) {
      toast.warning('Please enter at least one search criteria');
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (barcode) params.append('barcode', barcode);
      if (batchNo) params.append('batch_no', batchNo);
      if (productionDate) params.append('production_date', productionDate);
      if (stage) params.append('stage', stage);

      try {
        // Try the dedicated tracking endpoint first
        const res = await api<{ success: boolean; data: Batch }>(`/batches/tracking?${params.toString()}`);
        if (res.success && res.data) {
          setBatch(res.data);
          if (res.data.batch_no) setBatchNo(res.data.batch_no);
          if (res.data.production_date) setProductionDate(res.data.production_date.split('T')[0]);
          if (res.data.current_stage) setStage(res.data.current_stage);
          toast.success(`Batch ${res.data.batch_no} found`);
          return;
        }
      } catch (trackingErr: any) {
        // Fallback: search via getAll then fetch by ID for full details
        try {
          const searchQuery = searchTerm || '';
          const listRes = await api<{ success: boolean; data: Batch[] }>(`/batches?search=${encodeURIComponent(searchQuery)}&limit=1`);
          if (listRes.data && listRes.data.length > 0) {
            const found = listRes.data[0];
            // Fetch full details with items
            const detailRes = await api<{ success: boolean; data: Batch }>(`/batches/${found.id}`);
            if (detailRes.data) {
              setBatch(detailRes.data);
              if (detailRes.data.batch_no) setBatchNo(detailRes.data.batch_no);
              if (detailRes.data.production_date) setProductionDate(detailRes.data.production_date.split('T')[0]);
              if (detailRes.data.current_stage) setStage(detailRes.data.current_stage);
              toast.success(`Batch ${detailRes.data.batch_no} found`);
              return;
            }
          }
        } catch (fallbackErr: any) {
          toast.error(`Search failed: ${fallbackErr.message}`);
        }
      }

      toast.error(`Batch not found for: "${searchTerm}"`);
      setBatch(null);
    } catch (err: any) {
      toast.error(`Search error: ${err.message || 'Unknown error'}`);
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWithValue = async (searchValue: string) => {
    if (!searchValue) return;
    try {
      setLoading(true);
      setBatch(null);
      const params = new URLSearchParams();
      params.append('barcode', searchValue);

      try {
        const res = await api<{ success: boolean; data: Batch }>(`/batches/tracking?${params.toString()}`);
        if (res.success && res.data) {
          const batchData = res.data;
          // Ensure safe values
          batchData.total_receipt_qty = Number(batchData.total_receipt_qty) || 0;
          batchData.total_output_qty = Number(batchData.total_output_qty) || 0;
          batchData.yield_percent = Number(batchData.yield_percent) || 0;
          batchData.items = batchData.items || [];
          setBatch(batchData);
          if (batchData.batch_no) setBatchNo(batchData.batch_no);
          if (batchData.production_date) setProductionDate(batchData.production_date.split('T')[0]);
          if (batchData.current_stage) setStage(batchData.current_stage);
          toast.success(`Batch ${batchData.batch_no} found`);
          return;
        }
      } catch (trackingErr: any) {
        toast.info(`Tracking: ${trackingErr.message || 'No result'}, trying fallback...`);
        // Fallback
        try {
          const listRes = await api<{ success: boolean; data: Batch[] }>(`/batches?search=${encodeURIComponent(searchValue)}&limit=1`);
          if (listRes.data && listRes.data.length > 0) {
            const found = listRes.data[0];
            const detailRes = await api<{ success: boolean; data: Batch }>(`/batches/${found.id}`);
            if (detailRes.data) {
              const batchData = detailRes.data;
              batchData.total_receipt_qty = Number(batchData.total_receipt_qty) || 0;
              batchData.total_output_qty = Number(batchData.total_output_qty) || 0;
              batchData.yield_percent = Number(batchData.yield_percent) || 0;
              batchData.items = batchData.items || [];
              setBatch(batchData);
              if (batchData.batch_no) setBatchNo(batchData.batch_no);
              if (batchData.production_date) setProductionDate(batchData.production_date.split('T')[0]);
              if (batchData.current_stage) setStage(batchData.current_stage);
              toast.success(`Batch ${batchData.batch_no} found (fallback)`);
              return;
            }
          }
        } catch (fallbackErr: any) {
          toast.error(`Fallback failed: ${fallbackErr.message}`);
        }
      }

      toast.error(`Batch not found for: "${searchValue}"`);
      setBatch(null);
    } catch (err: any) {
      toast.error(`Search error: ${err.message || 'Unknown error'}`);
      setRenderError(`Search crashed: ${err.message}`);
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBarcode('');
    setBatchNo('');
    setProductionDate('');
    setStage('');
    setBatch(null);
  };

  useEffect(() => {
    if (id) fetchBatch(id);
  }, [id, fetchBatch]);

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const formatQty = (val: number | null | undefined) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Export line items to CSV
  const handleExport = () => {
    if (!batch?.items || batch.items.length === 0) return;
    const headers = ['#', 'Customer', 'Order No.', 'Article Code', 'Article Name', 'Finish', 'Color', 'Receipt Qty (SQ.FT.)', 'Output Qty (SQ.FT.)'];
    const rows = batch.items.map((item, idx) => [
      idx + 1,
      item.customer_name || '',
      item.order_no || '',
      item.article_code || '',
      item.article_name || '',
      item.finish || '',
      item.color || '',
      item.receipt_qty,
      item.output_qty
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_${batch.batch_no}_items.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (renderError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <h2 className="text-lg font-bold text-red-700 mb-2">Page Error</h2>
        <p className="text-sm text-red-600">{renderError}</p>
        <button onClick={() => { setRenderError(null); setBatch(null); }} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Reset Page</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Batch / Lot Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          Batch / Lot Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Scan Barcode */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Scan Barcode</label>
            <div className="relative">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Scan barcode or enter manually"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-blue-50 transition-colors"
                title="Open Camera Scanner"
              >
                <ScanLine className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          </div>

          {/* Batch No */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Batch No.</label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="BTCH-240520-0012"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Production Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Production Date</label>
            <input
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
            >
              <option value="Tanning">Tanning</option>
              <option value="Finishing">Finishing</option>
              <option value="Dyeing">Dyeing</option>
              <option value="Crusting">Crusting</option>
              <option value="Wet Blue">Wet Blue</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
          </button>
        </div>
      </div>

      {/* Batch Summary Header */}
      {batch && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Batch Details</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              batch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
              batch.status === 'In-Process' ? 'bg-amber-100 text-amber-700' :
              batch.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-700'
            }`}>{batch.status}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Batch No.</p>
              <p className="text-sm font-bold text-gray-900">{batch.batch_no}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Article</p>
              <p className="text-sm font-bold text-gray-900">{(batch as any).article_name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Order No.</p>
              <p className="text-sm font-bold text-gray-900">{(batch as any).order_no || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Production Date</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(batch.production_date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats Cards */}
      {batch && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Stage</p>
              <p className="text-sm font-bold text-gray-900">{batch.current_stage || batch.stage}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Production Date</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(batch.production_date)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Receipt Qty</p>
              <p className="text-sm font-bold text-gray-900">{formatQty(batch.total_receipt_qty)} SQ.FT.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Output Qty</p>
              <p className="text-sm font-bold text-gray-900">{formatQty(batch.total_output_qty)} SQ.FT.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Yield %</p>
              <p className="text-sm font-bold text-emerald-600">{(batch.yield_percent || 0).toFixed(2)} %</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch / Lot Line Items Table */}
      {batch && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              Batch / Lot Line Items
            </h2>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Order No.</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Article Code</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Article Name</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Finish</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Color</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Receipt Qty (SQ.FT.)</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Output Qty (SQ.FT.)</th>
                </tr>
              </thead>
              <tbody>
                {batch.items && batch.items.length > 0 ? (
                  batch.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                      <td className="py-3 px-3 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-3 text-gray-700">{item.customer_name || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.order_no || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.article_code || '-'}</td>
                      <td className="py-3 px-3 text-gray-700">{item.article_name || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.finish || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.color || '-'}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatQty(item.receipt_qty)}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatQty(item.output_qty)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">No line items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {batch.items && batch.items.length > 0 ? (
              batch.items.map((item, index) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.customer_name || '-'}</p>
                      <p className="text-xs text-blue-700 font-mono mt-0.5">{item.order_no || '-'}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-medium shrink-0 ml-2">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2.5">
                    <span className="truncate">{item.article_name || item.article_code || '-'}</span>
                    {item.color && <><span className="text-gray-300">•</span><span>{item.color}</span></>}
                    {item.finish && <><span className="text-gray-300">•</span><span>{item.finish}</span></>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Receipt Qty</p>
                      <p className="text-xs font-bold text-gray-900 tabular-nums">{formatQty(item.receipt_qty)} SQ.FT.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Output Qty</p>
                      <p className="text-xs font-bold text-gray-900 tabular-nums">{formatQty(item.output_qty)} SQ.FT.</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400">No line items found</div>
            )}
          </div>

          {/* Footer Totals */}
          {batch.items && batch.items.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">Total Records: <span className="font-semibold">{batch.items.length}</span></p>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-bold text-blue-700">
                    {formatQty(batch.total_receipt_qty)}
                  </span>
                </div>
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-bold text-blue-700">
                    {formatQty(batch.total_output_qty)}
                  </span>
                </div>
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-xs text-green-600">Yield %</p>
                  <span className="text-sm font-bold text-green-700">{(batch.yield_percent || 0).toFixed(2)} %</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
}
