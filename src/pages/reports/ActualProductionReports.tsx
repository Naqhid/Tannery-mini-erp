import ReportTabs from '../../components/reports/ReportTabs';
import DailyProductionOutput from './production/DailyProductionOutput';
import StageWiseProduction from './production/StageWiseProduction';
import PlanVsActualOutput from './production/PlanVsActualOutput';
import ProductionWipReport from './production/ProductionWipReport';

export default function ActualProductionReports() {
  return (
    <ReportTabs
      title="Actual Production Reports"
      subtitle="Daily output, stage-wise production, plan vs actual and WIP."
      tabs={[
        { key: 'daily-output', label: 'Daily Production Output', render: () => <DailyProductionOutput embedded /> },
        { key: 'stage-wise', label: 'Stage-wise Production', render: () => <StageWiseProduction embedded /> },
        { key: 'plan-vs-actual', label: 'Plan vs Actual Production', render: () => (
          <PlanVsActualOutput embedded title="Plan vs Actual Production" subtitle="Planned quantity against actual produced output." />
        ) },
        { key: 'wip', label: 'Production WIP', render: () => <ProductionWipReport embedded /> },
      ]}
    />
  );
}
