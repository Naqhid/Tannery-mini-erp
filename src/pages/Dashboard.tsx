// import { useState } from 'react';
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
} from 'lucide-react';
import Card from '../components/ui/Card';

const stats = [
  { label: 'Total Sales Orders', value: '124', change: '+12%', up: true, icon: <ShoppingCart size={20} />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Products', value: '86', change: '+5%', up: true, icon: <Package size={20} />, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Production Batches', value: '42', change: '-3%', up: false, icon: <Factory size={20} />, color: 'bg-amber-50 text-amber-600' },
  { label: 'Inventory Value', value: '₹2.4M', change: '+8%', up: true, icon: <TrendingUp size={20} />, color: 'bg-violet-50 text-violet-600' },
];

const recentOrders = [
  { id: 'SO-2024-001', customer: 'ABC Leather Pvt Ltd', product: 'Full Grain Cowhide', qty: '500', status: 'Completed', date: '15 Jun 2024' },
  { id: 'SO-2024-002', customer: 'XYZ Tannery Co', product: 'Semi-Aniline Leather', qty: '300', status: 'In Production', date: '14 Jun 2024' },
  { id: 'SO-2024-003', customer: 'Global Leather Inc', product: 'Nappa Leather', qty: '200', status: 'Pending', date: '13 Jun 2024' },
  { id: 'SO-2024-004', customer: 'Premium Hides Ltd', product: 'Pull-Up Leather', qty: '450', status: 'Completed', date: '12 Jun 2024' },
  { id: 'SO-2024-005', customer: 'Euro Leather Corp', product: 'Suede Leather', qty: '350', status: 'In Production', date: '11 Jun 2024' },
];

const lowStock = [
  { item: 'Chrome Tanning Agent', qty: '25 kg', threshold: '50 kg', status: 'Critical' },
  { item: 'Vegetable Tanning Extract', qty: '40 kg', threshold: '60 kg', status: 'Low' },
  { item: 'Aniline Dye - Brown', qty: '15 L', threshold: '30 L', status: 'Critical' },
  { item: 'Wax Emulsion', qty: '80 L', threshold: '100 L', status: 'Low' },
];

const productionSchedule = [
  { batch: 'B-2024-042', recipe: 'Full Grain Finish', stage: 'Dyeing', progress: 65, eta: '2 days' },
  { batch: 'B-2024-043', recipe: 'Semi-Aniline Finish', stage: 'Tanning', progress: 30, eta: '5 days' },
  { batch: 'B-2024-044', recipe: 'Nappa Finish', stage: 'Finishing', progress: 90, eta: '1 day' },
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status === 'Critical' && <AlertTriangle size={12} />}
      {status === 'Completed' && <CheckCircle2 size={12} />}
      {status === 'In Production' && <Clock size={12} />}
      {status}
    </span>
  );
};

export default function Dashboard() {
  // const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {s.up ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                  <span className={`text-xs font-medium ${s.up ? 'text-emerald-600' : 'text-red-600'}`}>{s.change}</span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg ${s.color}`}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="xl:col-span-2" title="Recent Sales Orders" subtitle="Last 5 orders placed">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{o.id}</td>
                    <td className="py-2.5 px-3 text-gray-600">{o.customer}</td>
                    <td className="py-2.5 px-3 text-gray-600">{o.product}</td>
                    <td className="py-2.5 px-3 text-gray-600">{o.qty}</td>
                    <td className="py-2.5 px-3">{statusBadge(o.status)}</td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing 1-5 of 124 orders</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><ChevronLeft size={14} /></button>
              <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white">1</button>
              <button className="px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-600">2</button>
              <button className="px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-600">3</button>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><ChevronRight size={14} /></button>
            </div>
          </div>
        </Card>

        {/* Low Stock */}
        <Card title="Low Stock Alerts" subtitle="Items below reorder threshold">
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.item} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.item}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Current: {item.qty} / Threshold: {item.threshold}</p>
                </div>
                {statusBadge(item.status)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Production Schedule */}
      <Card title="Production Schedule" subtitle="Active batches in progress">
        <div className="space-y-4">
          {productionSchedule.map((batch) => (
            <div key={batch.batch} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-32 shrink-0">
                <p className="text-sm font-medium text-gray-900">{batch.batch}</p>
                <p className="text-xs text-gray-500">{batch.recipe}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{batch.stage}</span>
                  <span className="text-xs font-medium text-gray-700">{batch.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${batch.progress}%` }}
                  />
                </div>
              </div>
              <div className="sm:w-20 sm:text-right">
                <span className="text-xs text-gray-500">ETA: {batch.eta}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
