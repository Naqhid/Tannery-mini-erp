import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  Factory,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Eye,
} from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../lib/api';

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
  { label: 'Active Recipes', value: '--', change: '+8%', up: true, icon: <TrendingUp size={22} />, color: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50', textColor: 'text-violet-600' },
];

const recentOrders = [
  { id: 'SO-2024-001', customer: 'ABC Leather Pvt Ltd', product: 'Full Grain Cowhide', qty: '500', status: 'Completed', date: '15 Jun 2024' },
  { id: 'SO-2024-002', customer: 'XYZ Tannery Co', product: 'Semi-Aniline Leather', qty: '300', status: 'In Production', date: '14 Jun 2024' },
  { id: 'SO-2024-003', customer: 'Global Leather Inc', product: 'Nappa Leather', qty: '200', status: 'Pending', date: '13 Jun 2024' },
  { id: 'SO-2024-004', customer: 'Premium Hides Ltd', product: 'Pull-Up Leather', qty: '450', status: 'Completed', date: '12 Jun 2024' },
  { id: 'SO-2024-005', customer: 'Euro Leather Corp', product: 'Suede Leather', qty: '350', status: 'In Production', date: '11 Jun 2024' },
];

const lowStock = [
  { item: 'Chrome Tanning Agent', qty: '25 kg', threshold: '50 kg', status: 'Critical', percent: 50 },
  { item: 'Vegetable Tanning Extract', qty: '40 kg', threshold: '60 kg', status: 'Low', percent: 67 },
  { item: 'Aniline Dye - Brown', qty: '15 L', threshold: '30 L', status: 'Critical', percent: 50 },
  { item: 'Wax Emulsion', qty: '80 L', threshold: '100 L', status: 'Low', percent: 80 },
];

const productionSchedule = [
  { batch: 'B-2024-042', recipe: 'Full Grain Finish', stage: 'Dyeing', progress: 65, eta: '2 days', stageColor: 'bg-purple-100 text-purple-700' },
  { batch: 'B-2024-043', recipe: 'Semi-Aniline Finish', stage: 'Tanning', progress: 30, eta: '5 days', stageColor: 'bg-amber-100 text-amber-700' },
  { batch: 'B-2024-044', recipe: 'Nappa Finish', stage: 'Finishing', progress: 90, eta: '1 day', stageColor: 'bg-emerald-100 text-emerald-700' },
];

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
  const [stats, setStats] = useState<DashboardStat[]>(defaultStats);

  useEffect(() => {
    api<{ data: { stats: DashboardStat[] } }>('/dashboard/stats')
      .then((res) => {
        const s = res.data.stats;
        setStats([
          { label: 'Total Customers', value: s[0].value, change: '+12%', up: true, icon: <ShoppingCart size={22} />, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
          { label: 'Active Products', value: s[1].value, change: '+5%', up: true, icon: <Package size={22} />, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
          { label: 'Total Suppliers', value: s[2].value, change: '+3%', up: true, icon: <Factory size={22} />, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
          { label: 'Active Recipes', value: s[3].value, change: '+8%', up: true, icon: <TrendingUp size={22} />, color: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50', textColor: 'text-violet-600' },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
            <button className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
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
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                    <td className="py-3 px-3 font-semibold text-gray-900 text-xs">{o.id}</td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{o.customer}</td>
                    <td className="py-3 px-3 text-gray-600 text-xs hidden md:table-cell">{o.product}</td>
                    <td className="py-3 px-3 text-gray-700 font-medium text-xs">{o.qty}</td>
                    <td className="py-3 px-3">{statusBadge(o.status)}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs hidden lg:table-cell">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{o.id}</span>
                  {statusBadge(o.status)}
                </div>
                <div className="text-xs text-gray-600">{o.customer}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{o.product}</span>
                  <span className="font-medium text-gray-700">Qty: {o.qty}</span>
                </div>
                <div className="text-[11px] text-gray-400">{o.date}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Showing 1-5 of 124 orders</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><ChevronLeft size={14} /></button>
              <button className="w-7 h-7 text-xs rounded-lg bg-blue-600 text-white font-medium shadow-sm shadow-blue-200">1</button>
              <button className="w-7 h-7 text-xs rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">2</button>
              <button className="w-7 h-7 text-xs rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">3</button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><ChevronRight size={14} /></button>
            </div>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          title="Low Stock Alerts"
          subtitle="Items below reorder threshold"
          action={
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <AlertTriangle size={11} />
              {lowStock.filter(i => i.status === 'Critical').length} Critical
            </span>
          }
        >
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.item} className="p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{item.item}</p>
                  {statusBadge(item.status)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                  <span>Current: <strong className="text-gray-700">{item.qty}</strong></span>
                  <span>Threshold: {item.threshold}</span>
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

      {/* Production Schedule */}
      <Card
        title="Production Schedule"
        subtitle="Active batches in progress"
        action={
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
            <BarChart3 size={13} />
            Details
          </button>
        }
      >
        <div className="space-y-4">
          {productionSchedule.map((batch) => (
            <div key={batch.batch} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200">
              <div className="sm:w-36 shrink-0">
                <p className="text-sm font-bold text-gray-900">{batch.batch}</p>
                <p className="text-xs text-gray-500 mt-0.5">{batch.recipe}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${batch.stageColor}`}>
                    <Activity size={10} />
                    {batch.stage}
                  </span>
                  <span className="text-xs font-bold text-gray-700">{batch.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      batch.progress >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                      batch.progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                      'bg-gradient-to-r from-amber-400 to-amber-500'
                    }`}
                    style={{ width: `${batch.progress}%` }}
                  />
                </div>
              </div>
              <div className="sm:w-24 sm:text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                  <Clock size={11} />
                  ETA: {batch.eta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
