import ReportTabs from '../../components/reports/ReportTabs';
import StockSummaryReport from './inventory/StockSummaryReport';
import StockValuationReport from './inventory/StockValuationReport';
import MaterialReceiptRegister from './inventory/MaterialReceiptRegister';
import MaterialIssueRegister from './inventory/MaterialIssueRegister';
import StockLedgerReport from './inventory/StockLedgerReport';

export default function InventoryReports() {
  return (
    <ReportTabs
      title="Inventory Reports"
      subtitle="Stock, receipts, issues, ledger and valuation."
      tabs={[
        { key: 'stock-summary', label: 'Stock Summary', render: () => <StockSummaryReport embedded /> },
        { key: 'receipt-register', label: 'Material Receipt Register', render: () => <MaterialReceiptRegister embedded /> },
        { key: 'issue-register', label: 'Material Issue Register', render: () => <MaterialIssueRegister embedded /> },
        { key: 'stock-ledger', label: 'Stock Ledger', render: () => <StockLedgerReport embedded /> },
        { key: 'stock-valuation', label: 'Stock Valuation', render: () => <StockValuationReport embedded /> },
      ]}
    />
  );
}
