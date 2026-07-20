import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, RotateCcw, Download, ArrowLeft, Loader2, Barcode } from 'lucide-react';
import api from '../lib/api';

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

  // Search filters
  const [barcode, setBarcode] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [stage, setStage] = useState('Tanning');

  // Fetch batch by ID
  const fetchBatch = useCallback(async (batchId: string) => {
    try {
      setLoading(true);
      const res = await api<{ data: Batch }>(`/batches/${batchId}`);
      setBatch(res.data || null);
    } catch {
      setBatch(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch batch by barcode/batch_no
  const handleSearch = async () => {
    const searchTerm = barcode || batchNo;
    if (!searchTerm) return;
    try {
      setLoading(true);
      const res = await api<{ data: Batch[] }>(`/batches?search=${encodeURIComponent(searchTerm)}&limit=1`);
      if (res.data && res.data.length > 0) {
        setBatch(res.data[0]);
      } else {
        toast.error('Batch not found');
        setBatch(null);
      }
    } catch {
      toast.error('Error searching batch');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBarcode('');
    setBatchNo('');
    setProductionDate('');
    setStage('Tanning');
    setBatch(null);
  };

  useEffect(() => {
    if (id) fetchBatch(id);
  }, [id, fetchBatch]);

  const formatDate = (d: string | null) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Batch / Lot Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Barcode className="w-4 h-4 text-blue-600" />
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
              <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Batch No */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Batch No.</label>
            <input
              type="text"
              value={batchNo || batch?.batch_no || ''}
              onChange={(e) => setBatchNo(e.target.value)}
              placeholder="BTCH-240520-0012"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Production Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Production Date</label>
            <input
              type="date"
              value={productionDate || batch?.production_date || ''}
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
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button onClick={handleClear} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            <RotateCcw className="w-4 h-4" /> Clear
          </button>
          <button onClick={handleSearch} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {batch && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg">🧪</div>
            <div>
              <p className="text-xs text-gray-500">Current Stage</p>
              <p className="text-sm font-bold text-gray-900">{batch.current_stage}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">📅</div>
            <div>
              <p className="text-xs text-gray-500">Production Date</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(batch.production_date)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-lg">📦</div>
            <div>
              <p className="text-xs text-gray-500">Total Receipt Qty</p>
              <p className="text-sm font-bold text-gray-900">{batch.total_receipt_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })} SQ.FT.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-lg">📤</div>
            <div>
              <p className="text-xs text-gray-500">Total Output Qty</p>
              <p className="text-sm font-bold text-gray-900">{batch.total_output_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })} SQ.FT.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-lg">📊</div>
            <div>
              <p className="text-xs text-gray-500">Yield %</p>
              <p className="text-sm font-bold text-emerald-600">{batch.yield_percent.toFixed(2)} %</p>
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
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              Batch / Lot Line Items
            </h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
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
                      <td className="py-3 px-3 text-gray-600">{index + 1}</td>
                      <td className="py-3 px-3 text-gray-900">{item.customer_name || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.order_no || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.article_code || '-'}</td>
                      <td className="py-3 px-3 text-gray-900">{item.article_name || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.finish || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{item.color || '-'}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{item.receipt_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{item.output_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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

          {/* Footer Totals */}
          {batch.items && batch.items.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">Total Records: <span className="font-semibold">{batch.items.length}</span></p>
              <div className="flex items-center gap-6">
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-bold text-blue-700">
                    {batch.total_receipt_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-bold text-blue-700">
                    {batch.total_output_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600">Yield %</p>
                  <span className="text-sm font-bold text-green-700">{batch.yield_percent.toFixed(2)} %</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    </div>
  );
}
