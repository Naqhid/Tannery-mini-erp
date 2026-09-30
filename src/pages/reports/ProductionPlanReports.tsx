import ReportTabs from '../../components/reports/ReportTabs';
import ProductionPlanSummary from './production/ProductionPlanSummary';
import PlanVsActualOutput from './production/PlanVsActualOutput';
import OrderProductionPlan from './production/OrderProductionPlan';

export default function ProductionPlanReports() {
  return (
    <ReportTabs
      title="Production Plan Reports"
      subtitle="Plan summary, plan vs actual and order-linked plans."
      tabs={[
        { key: 'order-plan', label: 'Order Production Plan', render: () => <OrderProductionPlan embedded /> },
        { key: 'plan-summary', label: 'Production Plan Summary', render: () => <ProductionPlanSummary embedded /> },
        { key: 'plan-vs-actual', label: 'Plan vs Actual Output', render: () => <PlanVsActualOutput embedded /> },
      ]}
    />
  );
}
