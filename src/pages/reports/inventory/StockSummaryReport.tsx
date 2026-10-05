import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; material_code: string; material_name: string; group_name: string;
  uom: string; opening_qty: number; opening_value: number; receipt_qty: number; receipt_value: number;
  issue_qty: number; issue_value: number; transfer_qty: number; transfer_value: number;
  outbound_qty: number; outbound_value: number; closing_qty: number; closing_value: number;
}

export default function StockSummaryReport({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [group, setGroup] = useState('');
  const [asOnDate, setAsOnDate] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; groups: { id: number; name: string }[] }>({ warehouses: [], groups: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; groups: { id: number; name: string }[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], groups: r.data.groups || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'material_code', header: 'Item Code', render: r => <span className="font-mono text-blue-700">{r.material_code}</span> },
    { key: 'material_name', header: 'Item', render: r => <span className="font-medium text-gray-900">{r.material_name}</span> },
    { key: 'group_name', header: 'Item Group' },
    { key: 'uom', header: 'UOM' },
    { key: 'opening_qty', header: 'Opening Qty', align: 'right', render: r => fmtQty(r.opening_qty) },
    { key: 'receipt_qty', header: 'Receipt Qty', align: 'right', render: r => <span className="text-emerald-700">{fmtQty(r.receipt_qty)}</span> },
    { key: 'issue_qty', header: 'Issue Qty', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.issue_qty)}</span> },
    { key: 'transfer_qty', header: 'Transfer Qty', align: 'right', render: r => <span className="text-amber-600">{fmtQty(r.transfer_qty)}</span> },
    { key: 'outbound_qty', header: 'Outbound Qty', align: 'right', render: r => <span className="text-orange-600">{fmtQty(r.outbound_qty)}</span> },
    { key: 'closing_qty', header: 'Closing Qty', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.closing_qty)}</span> },
    { key: 'closing_value', header: 'Closing Value', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.closing_value)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Stock Summary"
      subtitle="Stock movement summary with opening, receipts, issues, transfers, outbound and closing quantities."
      endpoint="/reports/inventory/stock-summary"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Stock_Summary"
      extraParams={{ warehouse_id: warehouse, group_id: group, as_on_date: asOnDate }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Item Group" value={group} onChange={setGroup} options={opts.groups.map(g => ({ value: String(g.id), label: g.name }))} />
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">As On Date:</label>
            <input
              type="date"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm font-medium" colSpan={4}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.opening_qty)}</td>
          <td className="px-4 py-3 text-sm text-right text-emerald-700">{fmtQty(totals.receipt_qty)}</td>
          <td className="px-4 py-3 text-sm text-right text-red-600">{fmtQty(totals.issue_qty)}</td>
          <td className="px-4 py-3 text-sm text-right text-amber-600">{fmtQty(totals.transfer_qty)}</td>
          <td className="px-4 py-3 text-sm text-right text-orange-600">{fmtQty(totals.outbound_qty)}</td>
          <td className="px-4 py-3 text-sm text-right font-semibold">{fmtQty(totals.closing_qty)}</td>
          <td className="px-4 py-3 text-sm text-right font-semibold">{fmtNum(totals.closing_value)}</td>
        </tr>
      )}
    />
  );
}
