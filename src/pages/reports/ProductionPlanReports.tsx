import ReportTabs from '../../components/reports/ReportTabs';
import PlanVsActualOutput from './production/PlanVsActualOutput';
import OrderProductionPlan from './production/OrderProductionPlan';
import DailyProductionOutput from './production/DailyProductionOutput';
import StageWiseProduction from './production/StageWiseProduction';
import ProductionWipReport from './production/ProductionWipReport';

// Production Plan Reports and Actual Production Reports are merged into one
// page. Plan-oriented tabs come first, followed by the actual-production tabs.
export default function ProductionPlanReports() {
  return (
    <ReportTabs
      title="Production Plan Reports"
      subtitle="Plan summary, plan vs actual, order-linked plans, daily output, stage-wise production and WIP."
      tabs={[
        { key: 'order-plan', label: 'Order Production Plan', render: () => <OrderProductionPlan embedded /> },
        { key: 'plan-vs-actual', label: 'Plan vs Actual Output', render: () => <PlanVsActualOutput embedded /> },
        { key: 'daily-output', label: 'Daily Production Output', render: () => <DailyProductionOutput embedded /> },
        { key: 'stage-wise', label: 'Stage-wise Production', render: () => <StageWiseProduction embedded /> },
        { key: 'wip', label: 'Production WIP', render: () => <ProductionWipReport embedded /> },
      ]}
    />
  );
}
