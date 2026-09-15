import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; material_code: string; material_name: string; group_name: string;
  warehouse_name: string; uom: string; closing_qty: number; avg_rate: number; stock_value: number;
}

export default function StockValuationReport({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [group, setGroup] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; groups: { id: number; name: string }[] }>({ warehouses: [], groups: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; groups: { id: number; name: string }[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], groups: r.data.groups || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'material_code', header: 'Item Code', render: r => <span className="font-mono text-blue-700">{r.material_code}</span> },
    { key: 'material_name', header: 'Item', render: r => <span className="font-medium text-gray-900">{r.material_name}</span> },
    { key: 'group_name', header: 'Item Group' },
    { key: 'warehouse_name', header: 'Warehouse' },
    { key: 'uom', header: 'UOM' },
    { key: 'closing_qty', header: 'Closing Qty', align: 'right', render: r => fmtQty(r.closing_qty) },
    { key: 'avg_rate', header: 'Average Rate', align: 'right', render: r => fmtNum(r.avg_rate) },
    { key: 'stock_value', header: 'Stock Value', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.stock_value)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Stock Valuation Report"
      subtitle="Closing quantity valued at weighted-average rate."
      endpoint="/reports/inventory/stock-valuation"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Stock_Valuation"
      extraParams={{ warehouse_id: warehouse, group_id: group }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Item Group" value={group} onChange={setGroup} options={opts.groups.map(g => ({ value: String(g.id), label: g.name }))} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={7}>Total Stock Value</td>
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_value)}</td>
        </tr>
      )}
    />
  );
}
