import ReportTabs from '../../components/reports/ReportTabs';
import DailyProductionOutput from './production/DailyProductionOutput';
import StageWiseProduction from './production/StageWiseProduction';
import ProductionWipReport from './production/ProductionWipReport';

export default function ActualProductionReports() {
  return (
    <ReportTabs
      title="Actual Production Reports"
      subtitle="Daily output, stage-wise production and WIP."
      tabs={[
        { key: 'daily-output', label: 'Daily Production Output', render: () => <DailyProductionOutput embedded /> },
        { key: 'stage-wise', label: 'Stage-wise Production', render: () => <StageWiseProduction embedded /> },
        { key: 'wip', label: 'Production WIP', render: () => <ProductionWipReport embedded /> },
      ]}
    />
  );
}
