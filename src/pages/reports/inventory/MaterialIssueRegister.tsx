import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty, fmtDate } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; issue_no: string; issue_date: string; plan_no: string; process_stage: string;
  article: string; warehouse_name: string; material_name: string; uom: string;
  qty: number; rate: number; amount: number; status: string;
}

export default function MaterialIssueRegister({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; stages: string[] }>({ warehouses: [], stages: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; stages: string[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'issue_no', header: 'Issue No', render: r => <span className="font-mono text-blue-700">{r.issue_no}</span> },
    { key: 'issue_date', header: 'Date', render: r => fmtDate(r.issue_date) },
    { key: 'plan_no', header: 'Plan No' },
    { key: 'process_stage', header: 'Stage' },
    { key: 'article', header: 'Article' },
    { key: 'material_name', header: 'Material', render: r => <span className="font-medium text-gray-900">{r.material_name}</span> },
    { key: 'uom', header: 'UOM' },
    { key: 'qty', header: 'Qty', align: 'right', render: r => fmtQty(r.qty) },
    { key: 'rate', header: 'Rate', align: 'right', render: r => fmtNum(r.rate) },
    { key: 'amount', header: 'Amount', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.amount)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Material Issue Register"
      subtitle="Item-wise material issued to production by stage / order."
      endpoint="/reports/inventory/issue-register"
      columns={columns}
      embedded={embedded}
      exportFileName="Material_Issue_Register"
      extraParams={{ warehouse_id: warehouse, process_stage: stage }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={7}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_qty)}</td>
          <td />
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_amount)}</td>
        </tr>
      )}
    />
  );
}
