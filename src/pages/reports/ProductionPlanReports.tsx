import ReportTabs from '../../components/reports/ReportTabs';
import ProductionPlanSummary from './production/ProductionPlanSummary';
import PlanVsActualOutput from './production/PlanVsActualOutput';
import ProductionPlanStatus from './production/ProductionPlanStatus';
import OrderProductionPlan from './production/OrderProductionPlan';

export default function ProductionPlanReports() {
  return (
    <ReportTabs
      title="Production Plan Reports"
      subtitle="Plan summary, plan vs actual, status and order-wise plans."
      tabs={[
        { key: 'plan-summary', label: 'Production Plan Summary', render: () => <ProductionPlanSummary embedded /> },
        { key: 'plan-vs-actual', label: 'Plan vs Actual Output', render: () => <PlanVsActualOutput embedded /> },
        { key: 'plan-status', label: 'Production Plan Status', render: () => <ProductionPlanStatus embedded /> },
        { key: 'order-plan', label: 'Order Production Plan', render: () => <OrderProductionPlan embedded /> },
      ]}
    />
  );
}
