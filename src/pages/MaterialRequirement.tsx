import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Download, ListChecks, AlertTriangle, Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useDebounce } from '../lib/useDebounce';

interface SaleOrderRow {
  id: number;
  order_no: string;
  customer_name: string;
  article: string;
  colour: string;
  order_qty: number;
  delivery_date: string | null;
  status: string;
  item_count: number;
}

interface RequirementRow {
  material_id: number;
  material_code: string;
  material_description: string;
  uom: string;
  per_piece_qty: number;
  required_qty: number;
}

interface RequirementResult {
  order: {
    id: number;
    order_no: string;
    customer_name: string;
    article: string;
    colour: string;
    order_qty: number;
    delivery_date: string | null;
    status: string;
  };
  materials: RequirementRow[];
  missingBom: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-amber-50 text-amber-700 border border-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  Shipped: 'bg-violet-50 text-violet-700 border border-violet-200',
  Delivered: 'bg-teal-50 text-teal-700 border border-teal-200',
  Cancelled: 'bg-rose-50 text-rose-600 border border-rose-200',
  New: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const fmtNum = (n: number) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });
const fmtQty = (n: number) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 4 });
const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function MaterialRequirement() {
  const [orders, setOrders] = useState<SaleOrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [selected, setSelected] = useState<RequirementResult | null>(null);
  const [loadingReq, setLoadingReq] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const qs = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await api<{ data: SaleOrderRow[] }>(`/material-requirement/sale-orders${qs}`);
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load sale orders: ' + (err as Error).message);
    } finally {
      setLoadingOrders(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const selectOrder = async (orderId: number) => {
    try {
      setLoadingReq(true);
      const res = await api<{ data: RequirementResult }>(`/material-requirement/${orderId}`);
      setSelected(res.data);
      window.scrollTo(0, 0);
      if (res.data.missingBom) {
        toast.info('Some items have no linked product / Active BOM and were skipped.');
      }
    } catch (err) {
      toast.error('Failed to calculate requirements: ' + (err as Error).message);
    } finally {
      setLoadingReq(false);
    }
  };

  const exportExcel = () => {
    if (!selected) return;
    const { order, materials } = selected;
    const header = [
      ['Sale Order No.', order.order_no],
      ['Customer', order.customer_name],
      ['Article', order.article],
      ['Colour', order.colour],
      ['Order Qty', order.order_qty],
      [],
      ['Material Code', 'Material Description', 'UOM', 'BOM Qty per Piece', 'Order Qty', 'Required Qty'],
    ];
    const body = materials.map((m) => [
      m.material_code,
      m.material_description,
      m.uom,
      Number(m.per_piece_qty.toFixed(4)),
      order.order_qty,
      Number(m.required_qty.toFixed(4)),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...body]);
    ws['!cols'] = [{ wch: 16 }, { wch: 34 }, { wch: 8 }, { wch: 16 }, { wch: 12 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Material Requirements');
    XLSX.writeFile(wb, `${order.order_no}_Material_Requirements.xlsx`);
  };

  const totalRequired = selected?.materials.reduce((s, m) => s + m.required_qty, 0) || 0;

  // ─── BOM Requirements view ─────────────────────────────────────────────────
  if (selected) {
    const { order, materials } = selected;
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800">
          <ArrowLeft size={16} /> Back to Sale Orders
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Requirements</h1>
            <p className="text-sm text-gray-500 mt-1">BOM quantity calculated for the selected sale order.</p>
          </div>
          <button
            onClick={exportExcel}
            disabled={materials.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <Download size={15} /> Export to Excel
          </button>
        </div>

        {/* Order info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            <InfoItem label="Sale Order No." value={order.order_no} highlight />
            <InfoItem label="Customer" value={order.customer_name} />
            <InfoItem label="Article" value={order.article} />
            <InfoItem label="Colour" value={order.colour} />
            <InfoItem label="Order Qty" value={`${fmtNum(order.order_qty)}`} />
          </div>
        </div>

        {selected.missingBom && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>Some sale-order items have no linked product or no Active BOM, so they were excluded from the calculation.</span>
          </div>
        )}

        {/* Requirements table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700">BOM Material Requirements</h2>
            <span className="text-xs text-gray-500">{materials.length} BOM item{materials.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Material Code</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Material Description</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-center">UOM</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">BOM Qty / Piece</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">Order Qty</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">Required Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m) => (
                  <tr key={m.material_id} className="hover:bg-blue-50/30 transition-all">
                    <td className="py-3 px-4 font-mono text-xs font-medium text-blue-700">{m.material_code}</td>
                    <td className="py-3 px-4 text-gray-900">{m.material_description}</td>
                    <td className="py-3 px-4 text-center text-xs text-gray-600">{m.uom}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">{fmtQty(m.per_piece_qty)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">{fmtNum(order.order_qty)}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-gray-900">{fmtQty(m.required_qty)}</td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                      No BOM material requirements found for this order.
                    </td>
                  </tr>
                )}
              </tbody>
              {materials.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={5} className="py-3 px-4 text-right">Total Required Qty</td>
                    <td className="py-3 px-4 text-right tabular-nums">{fmtQty(totalRequired)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Required Qty = BOM Qty per Piece × Sale Order Qty</span>
            <span>{materials.length} material{materials.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Sale Orders list view ─────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <ListChecks size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale Orders</h1>
          <p className="text-sm text-gray-500">Select a sale order to calculate its BOM material requirements.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order no. or customer..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Sale Order No.</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Customer</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Article</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Colour</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">Order Qty</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Delivery Date</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingOrders ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">
                  <Loader2 size={22} className="animate-spin inline" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  <FileSpreadsheet size={28} className="inline mb-2 text-gray-300" /><br />
                  No sale orders found.
                </td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-700">{o.order_no}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{o.customer_name}</td>
                  <td className="py-3 px-4 text-gray-700">{o.article}</td>
                  <td className="py-3 px-4 text-gray-700">{o.colour}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-gray-900">{fmtNum(o.order_qty)}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{fmtDate(o.delivery_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => selectOrder(o.id)}
                      disabled={loadingReq}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50">
                      View BOM →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{orders.length} sale order{orders.length !== 1 ? 's' : ''}</span>
          <span>Select an order to view BOM requirements</span>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-gray-500 uppercase font-medium mb-1">{label}</p>
      <p className={`text-sm font-semibold truncate ${highlight ? 'text-blue-700' : 'text-gray-900'}`} title={value}>{value}</p>
    </div>
  );
}
