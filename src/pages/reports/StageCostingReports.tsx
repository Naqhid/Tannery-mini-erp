import ReportTabs from '../../components/reports/ReportTabs';
import WipCostSheetReport from './costing/WipCostSheetReport';
import FullOrderCostSheetReport from './costing/FullOrderCostSheetReport';
import StageCostSummaryReport from './costing/StageCostSummaryReport';
import StandardVsActualCostReport from './costing/StandardVsActualCostReport';

export default function StageCostingReports() {
  return (
    <ReportTabs
      title="Stage Costing Reports"
      subtitle="WIP cost, full order cost, stage summary and standard vs actual."
      tabs={[
        { key: 'wip-cost-sheet', label: 'WIP Cost Sheet', render: () => <WipCostSheetReport embedded /> },
        { key: 'full-order-cost-sheet', label: 'Full Order Cost Sheet', render: () => <FullOrderCostSheetReport embedded /> },
        { key: 'stage-cost-summary', label: 'Stage Cost Summary', render: () => <StageCostSummaryReport embedded /> },
        { key: 'standard-vs-actual', label: 'Standard vs Actual Cost', render: () => <StandardVsActualCostReport embedded /> },
      ]}
    />
  );
}
