import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  Factory,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BarChart3,
  Eye,
  X,
  ClipboardList,
  FlaskConical,
  Layers,
  Boxes,
  Users,
  TrendingUp,
  Truck,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import api from '../lib/api';
import LineChart from '../components/charts/LineChart';
import DonutChart from '../components/charts/DonutChart';

interface KpiCounts {
  salesOrdersThisMonth: number;
  recipesActive: number;
  bomsActive: number;
  totalItems: number;
  materialsActive: number;
  suppliersActive: number;
}
interface SalesTrendPoint { label: string; value: number; orderCount: number; }
interface InventoryValue { total: number; breakdown: { category: string; value: number }[]; }
interface TopProduct { product: string; value: number; }
interface RecentReceipt { id: number; receipt_no: string; receipt_date: string; supplier_name: string; amount: number; status: string; }
interface QuickSummary {
  pendingSalesOrders: number;
  pendingGoodsReceipt: number;
  pendingMaterialIssues: number;
  lowStockItems: number;
  openProductionPlans: number;
}

const fmtMoney = (n: number) => '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  textColor: string;
}

const defaultStats: DashboardStat[] = [
  { label: 'Total Customers', value: '--', change: '+12%', up: true, icon: <ShoppingCart size={22} />, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
  { label: 'Active Products', value: '--', change: '+5%', up: true, icon: <Package size={22} />, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { label: 'Total Suppliers', value: '--', change: '+3%', up: true, icon: <Factory size={22} />, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
];

interface RecentOrder { id: number; order_no: string; customer_name: string; product: string; total_quantity: number; status: string; order_date: string; }
interface LowStockItem { id: number; item: string; qty: string; threshold: string; status: string; percent: number; }
interface ProductionPlanRow { id: number; plan_no: string; article: string; color: string; plan_date: string; planned_qty: number; uom: string; customer_name: string; sales_order_no: string; status: string; }
interface WipStage { stage: string; wip_qty: number; planned_qty: number; order_count: number; }

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Production': 'bg-blue-50 text-blue-700 border-blue-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Critical: 'bg-red-50 text-red-700 border-red-200',
    Low: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status === 'Critical' && <AlertTriangle size={11} />}
      {status === 'Completed' && <CheckCircle2 size={11} />}
      {status === 'In Production' && <Clock size={11} />}
      {status}
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStat[]>(defaultStats);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [productionOrders, setProductionOrders] = useState<{ counts: { pendingOrInProgress: number; completed: number }; orders: { pendingOrInProgress: ProductionPlanRow[]; completed: ProductionPlanRow[] } }>({ counts: { pendingOrInProgress: 0, completed: 0 }, orders: { pendingOrInProgress: [], completed: [] } });
  const [highestWipStages, setHighestWipStages] = useState<WipStage[]>([]);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState<'pendingOrInProgress' | 'completed' | null>(null);
  const [kpiCounts, setKpiCounts] = useState<KpiCounts | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([]);
  const [inventoryValue, setInventoryValue] = useState<InventoryValue>({ total: 0, breakdown: [] });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<RecentReceipt[]>([]);
  const [quickSummary, setQuickSummary] = useState<QuickSummary | null>(null);

  useEffect(() => {
    api<{ data: {
      stats: DashboardStat[]; recentOrders: RecentOrder[]; lowStock: LowStockItem[];
      productionOrders: typeof productionOrders; highestWipStages: WipStage[];
      kpiCounts: KpiCounts; salesTrend: SalesTrendPoint[]; inventoryValue: InventoryValue;
      topProducts: TopProduct[]; recentReceipts: RecentReceipt[]; quickSummary: QuickSummary;
    } }>('/dashboard/stats')
      .then((res) => {
        const s = res.data.stats;
        setStats([
          { label: 'Total Customers', value: s[0].value, change: '+12%', up: true, icon: <ShoppingCart size={22} />, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
          { label: 'Active Products', value: s[1].value, change: '+5%', up: true, icon: <Package size={22} />, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
          { label: 'Total Suppliers', value: s[2].value, change: '+3%', up: true, icon: <Factory size={22} />, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
        ]);
        setRecentOrders(res.data.recentOrders || []);
        setLowStock(res.data.lowStock || []);
        setProductionOrders(res.data.productionOrders || { counts: { pendingOrInProgress: 0, completed: 0 }, orders: { pendingOrInProgress: [], completed: [] } });
        setHighestWipStages(res.data.highestWipStages || []);
        setKpiCounts(res.data.kpiCounts || null);
        setSalesTrend(res.data.salesTrend || []);
        setInventoryValue(res.data.inventoryValue || { total: 0, breakdown: [] });
        setTopProducts(res.data.topProducts || []);
        setRecentReceipts(res.data.recentReceipts || []);
        setQuickSummary(res.data.quickSummary || null);
      })
      .catch(() => {});
  }, []);

  const kpiCards = kpiCounts ? [
    { label: 'Sales Orders', sub: 'This Month', value: kpiCounts.salesOrdersThisMonth, icon: <ClipboardList size={20} />, tint: 'bg-blue-50 text-blue-600', to: '/sales-orders' },
    { label: 'Recipes', sub: 'Active', value: kpiCounts.recipesActive, icon: <FlaskConical size={20} />, tint: 'bg-emerald-50 text-emerald-600', to: '/recipe-creation' },
    { label: 'BOMs', sub: 'Active', value: kpiCounts.bomsActive, icon: <Layers size={20} />, tint: 'bg-violet-50 text-violet-600', to: '/bom' },
    { label: 'Total Items', sub: 'In Inventory', value: kpiCounts.totalItems, icon: <Boxes size={20} />, tint: 'bg-amber-50 text-amber-600', to: '/chemical-master' },
    { label: 'Materials', sub: 'Active', value: kpiCounts.materialsActive, icon: <Package size={20} />, tint: 'bg-cyan-50 text-cyan-600', to: '/chemical-master' },
    { label: 'Suppliers', sub: 'Active', value: kpiCounts.suppliersActive, icon: <Users size={20} />, tint: 'bg-rose-50 text-rose-600', to: '/supplier-master' },
  ] : [];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* KPI cards (live counts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {kpiCards.map((k) => (
          <button
            key={k.label}
            onClick={() => navigate(k.to)}
            className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
          >
            <span className={`p-2.5 rounded-xl ${k.tint} group-hover:scale-110 transition-transform`}>{k.icon}</span>
            <span className="min-w-0">
              <span className="block text-[11px] text-gray-500 font-medium truncate">{k.label}</span>
              <span className="block text-xl font-bold text-gray-900 leading-tight">{new Intl.NumberFormat('en-IN').format(k.value)}</span>
              <span className="block text-[10px] text-gray-400">{k.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Charts row: Sales trend · Inventory value · Top products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <Card className="xl:col-span-1" title="Sales Order Value" subtitle="Last 6 months">
          <LineChart data={salesTrend.map((p) => ({ label: p.label.split(' ')[0], value: p.value }))} formatValue={fmtMoney} />
        </Card>

        <Card title="Inventory Value" subtitle="Live stock valuation by type"
          action={<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full"><TrendingUp size={11} />{fmtMoney(inventoryValue.total)}</span>}>
          <div className="space-y-2.5">
            <p className="text-2xl font-bold text-gray-900">{fmtMoney(inventoryValue.total)}</p>
            <p className="text-[11px] text-gray-400 -mt-1 mb-2">Total Stock Value</p>
            {inventoryValue.breakdown.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400">No stock value available</p>
            ) : inventoryValue.breakdown.map((b, i) => {
              const pct = inventoryValue.total > 0 ? Math.round((b.value / inventoryValue.total) * 100) : 0;
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500', 'bg-slate-500'];
              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-2 text-gray-700"><span className={`inline-block w-2.5 h-2.5 rounded-sm ${colors[i % colors.length]}`} />{b.category}</span>
                    <span className="font-semibold text-gray-900">{fmtMoney(b.value)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Top 5 Products" subtitle="By sales order value">
          <DonutChart data={topProducts.map((p) => ({ label: p.product, value: p.value }))} formatValue={fmtMoney} />
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden"
          >
            {/* Subtle gradient accent on top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color} opacity-80`} />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{s.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{s.value}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${
                    s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {s.change}
                  </span>
                  <span className="text-[11px] text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl ${s.bgLight} ${s.textColor} group-hover:scale-110 transition-transform duration-300`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Recent Orders */}
        <Card
          className="xl:col-span-2"
          title="Recent Sales Orders"
          subtitle="Last 5 orders placed"
          action={
            <button onClick={() => navigate('/sales-orders')} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              <Eye size={13} />
              View All
            </button>
          }
        >
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Product</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-xs text-gray-400">No recent orders</td></tr>
                ) : recentOrders.map((o) => (
                  <tr key={o.id} onClick={() => navigate(`/sales-orders/${o.id}`)} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                    <td className="py-3 px-3 font-semibold text-gray-900 text-xs">{o.order_no}</td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{o.customer_name || '—'}</td>
                    <td className="py-3 px-3 text-gray-600 text-xs hidden md:table-cell">{o.product || '—'}</td>
                    <td className="py-3 px-3 text-gray-700 font-medium text-xs">{o.total_quantity}</td>
                    <td className="py-3 px-3">{statusBadge(o.status)}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs hidden lg:table-cell">{fmtDate(o.order_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {recentOrders.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No recent orders</div>
            ) : recentOrders.map((o) => (
              <div key={o.id} onClick={() => navigate(`/sales-orders/${o.id}`)} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 space-y-2 cursor-pointer active:bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{o.order_no}</span>
                  {statusBadge(o.status)}
                </div>
                <div className="text-xs text-gray-600">{o.customer_name || '—'}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{o.product || '—'}</span>
                  <span className="font-medium text-gray-700">Qty: {o.total_quantity}</span>
                </div>
                <div className="text-[11px] text-gray-400">{fmtDate(o.order_date)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          title="Low Stock Alerts"
          subtitle="Chemical materials at or below minimum stock"
          action={
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <AlertTriangle size={11} />
              {lowStock.length} Items
            </span>
          }
        >
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {lowStock.map((item) => (
              <div key={item.item} className="p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{item.item}</p>
                  {statusBadge(item.status)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                  <span>Current: <strong className="text-gray-700">{item.qty}</strong></span>
                  <span>Minimum: {item.threshold}</span>
                </div>
                {/* Progress bar showing stock level */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.status === 'Critical' ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        <Card title="Production Orders" subtitle="Click a count to view order details" action={<button onClick={() => navigate('/production-plan')} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"><BarChart3 size={13} /> All Plans</button>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setSelectedOrderGroup('pendingOrInProgress')} className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:border-amber-300 hover:shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-wide text-amber-700">Pending / In Progress</span>
              <span className="mt-2 block text-3xl font-extrabold text-amber-900">{productionOrders.counts.pendingOrInProgress}</span>
              <span className="mt-1 block text-xs text-amber-700">View order details →</span>
            </button>
            <button onClick={() => setSelectedOrderGroup('completed')} className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-left transition hover:border-emerald-300 hover:shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-700">Completed Orders</span>
              <span className="mt-2 block text-3xl font-extrabold text-emerald-900">{productionOrders.counts.completed}</span>
              <span className="mt-1 block text-xs text-emerald-700">View order details →</span>
            </button>
          </div>
        </Card>

        <Card title="Highest WIP Stages" subtitle="Stages with the most remaining work in progress">
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {highestWipStages.length === 0 ? <p className="py-6 text-center text-xs text-gray-400">No work in progress</p> : highestWipStages.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-800">{stage.stage}</p><p className="text-[11px] text-gray-500">{stage.order_count} active {stage.order_count === 1 ? 'order' : 'orders'}</p></div>
                <div className="shrink-0 text-right"><p className="text-sm font-bold text-indigo-700">{stage.wip_qty.toLocaleString('en-IN')} units</p><p className="text-[10px] text-gray-400">of {stage.planned_qty.toLocaleString('en-IN')} planned</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Goods Receipt (live) */}
      <Card
        title="Recent Goods Receipt"
        subtitle="Latest 5 material receipts"
        action={
          <button onClick={() => navigate('/material-receipt')} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
            <Eye size={13} /> View All
          </button>
        }
      >
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">GR No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Supplier</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-right py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount (₹)</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentReceipts.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-xs text-gray-400">No goods receipts</td></tr>
              ) : recentReceipts.map((r) => (
                <tr key={r.id} onClick={() => navigate(`/material-receipt/${r.id}`)} className="hover:bg-gray-50/80 transition-colors cursor-pointer">
                  <td className="py-3 px-3 font-semibold text-gray-900 text-xs flex items-center gap-1.5"><FileText size={12} className="text-gray-400" />{r.receipt_no}</td>
                  <td className="py-3 px-3 text-gray-600 text-xs">{r.supplier_name}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs hidden sm:table-cell">{fmtDate(r.receipt_date)}</td>
                  <td className="py-3 px-3 text-gray-800 font-medium text-xs text-right tabular-nums">{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(r.amount)}</td>
                  <td className="py-3 px-3">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Summary (live) */}
      {quickSummary && (
        <Card title="Quick Summary" subtitle="Items needing attention">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Pending Sales Orders', value: quickSummary.pendingSalesOrders, icon: <ShoppingCart size={16} />, tint: 'text-blue-600 bg-blue-50', to: '/sales-orders' },
              { label: 'Pending Goods Receipt', value: quickSummary.pendingGoodsReceipt, icon: <Truck size={16} />, tint: 'text-emerald-600 bg-emerald-50', to: '/material-receipt' },
              { label: 'Pending Material Issues', value: quickSummary.pendingMaterialIssues, icon: <ClipboardList size={16} />, tint: 'text-violet-600 bg-violet-50', to: '/material-issue' },
              { label: 'Low Stock Items', value: quickSummary.lowStockItems, icon: <AlertTriangle size={16} />, tint: 'text-amber-600 bg-amber-50', to: '/chemical-master' },
              { label: 'Open Production Plans', value: quickSummary.openProductionPlans, icon: <Factory size={16} />, tint: 'text-rose-600 bg-rose-50', to: '/production-plan' },
            ].map((q) => (
              <button key={q.label} onClick={() => navigate(q.to)} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 text-left hover:border-gray-200 hover:shadow-sm transition-all">
                <span className={`p-2 rounded-lg ${q.tint}`}>{q.icon}</span>
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-gray-900 leading-tight">{new Intl.NumberFormat('en-IN').format(q.value)}</span>
                  <span className="block text-[11px] text-gray-500 leading-tight">{q.label}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedOrderGroup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" role="presentation" onClick={() => setSelectedOrderGroup(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="production-orders-title" onClick={(event) => event.stopPropagation()} className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div><h2 id="production-orders-title" className="text-lg font-bold text-gray-900">{selectedOrderGroup === 'completed' ? 'Completed Orders' : 'Pending / In Progress Orders'}</h2><p className="text-xs text-gray-500">Click an order to open its production plan.</p></div>
              <button onClick={() => setSelectedOrderGroup(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close"><X size={18} /></button>
            </header>
            <div className="overflow-y-auto p-4">
              {productionOrders.orders[selectedOrderGroup].length === 0 ? <p className="py-10 text-center text-sm text-gray-400">No orders in this category.</p> : (
                <div className="space-y-2">{productionOrders.orders[selectedOrderGroup].map((order) => (
                  <button key={order.id} onClick={() => navigate(`/production-plan/${order.id}`)} className="flex w-full flex-col gap-1 rounded-xl border border-gray-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between">
                    <span><strong className="text-sm text-gray-900">{order.plan_no}</strong><span className="ml-2 text-xs text-gray-500">{order.article || '—'}{order.color ? ` / ${order.color}` : ''}</span><span className="block text-[11px] text-gray-500">{order.customer_name || 'No customer'}{order.sales_order_no ? ` · ${order.sales_order_no}` : ''}</span></span>
                    <span className="flex items-center gap-3 text-xs"><span className="text-gray-500">{Number(order.planned_qty).toLocaleString('en-IN')} {order.uom || ''}</span>{statusBadge(order.status)}<span className="text-gray-400">{fmtDate(order.plan_date)}</span></span>
                  </button>
                ))}</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
