import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty, fmtDate } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; transaction_date: string; transaction_type: string;
  reference_no: string; delivery_challan_no: string;
  material_code: string; material_name: string; uom: string;
  opening_qty: number; receipt_qty: number; issue_qty: number; transfer_qty: number; outbound_qty: number; closing_qty: number;
  rate: number; amount: number;
  remarks: string; created_by_name: string; created_at: string;
}

export default function StockLedgerReport({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [txnType, setTxnType] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; transaction_types: string[] }>({ warehouses: [], transaction_types: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; transaction_types: string[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], transaction_types: r.data.transaction_types || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'transaction_date', header: 'Txn Date', render: r => fmtDate(r.transaction_date) },
    { key: 'reference_no', header: 'Ref No', render: r => <span className="font-mono text-blue-700">{r.reference_no || '—'}</span> },
    { key: 'material_code', header: 'Item Code', render: r => <span className="font-mono">{r.material_code || '—'}</span> },
    { key: 'material_name', header: 'Item', render: r => <span className="font-medium text-gray-900">{r.material_name}</span> },
    { key: 'uom', header: 'UOM' },
    { key: 'opening_qty', header: 'Opening Qty', align: 'right', render: r => fmtQty(r.opening_qty || 0) },
    { key: 'receipt_qty', header: 'Receipt Qty', align: 'right', render: r => <span className="text-emerald-700">{fmtQty(r.receipt_qty || 0)}</span> },
    { key: 'issue_qty', header: 'Issue Qty', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.issue_qty || 0)}</span> },
    { key: 'transfer_qty', header: 'Transfer Qty', align: 'right', render: r => <span className="text-amber-600">{fmtQty(r.transfer_qty || 0)}</span> },
    { key: 'outbound_qty', header: 'Outbound Qty', align: 'right', render: r => <span className="text-orange-600">{fmtQty(r.outbound_qty || 0)}</span> },
    { key: 'closing_qty', header: 'Closing Qty', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.closing_qty || 0)}</span> },
    { key: 'rate', header: 'Rate', align: 'right', render: r => fmtNum(r.rate) },
    { key: 'amount', header: 'Amount', align: 'right', render: r => fmtNum(r.amount) },
    { key: 'remarks', header: 'Remarks', render: r => r.remarks || '—' },
  ];

  return (
    <ReportShell<Row>
      title="Stock Ledger"
      subtitle="Complete stock ledger with opening, receipts, issues, transfers, outbound and closing quantities."
      endpoint="/reports/inventory/stock-ledger"
      columns={columns}
      datePreset="month"
      embedded={embedded}
      exportFileName="Stock_Ledger"
      extraParams={{ warehouse_id: warehouse, transaction_type: txnType }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Transaction Type" value={txnType} onChange={setTxnType} options={opts.transaction_types.map(t => ({ value: t, label: t }))} minWidth={160} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={5}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_opening || 0)}</td>
          <td className="px-4 py-3 text-sm text-right text-emerald-700">{fmtQty(totals.total_receipt || 0)}</td>
          <td className="px-4 py-3 text-sm text-right text-red-600">{fmtQty(totals.total_issue || 0)}</td>
          <td className="px-4 py-3 text-sm text-right text-amber-600">{fmtQty(totals.total_transfer || 0)}</td>
          <td className="px-4 py-3 text-sm text-right text-orange-600">{fmtQty(totals.total_outbound || 0)}</td>
          <td className="px-4 py-3 text-sm text-right font-semibold">{fmtQty(totals.total_closing || 0)}</td>
          <td />
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_amount)}</td>
          <td />
        </tr>
      )}
    />
  );
}
