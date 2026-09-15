import ReportTabs from '../../components/reports/ReportTabs';
import SalesOrderSummary from './sales/SalesOrderSummary';
import OrderFulfillmentReport from './sales/OrderFulfillmentReport';
import OpenSalesOrderReport from './sales/OpenSalesOrderReport';
import SalesOrderProductionTracking from './sales/SalesOrderProductionTracking';

export default function SalesOrderReports() {
  return (
    <ReportTabs
      title="Sales Order Reports"
      subtitle="Order summary, fulfillment, open orders and production tracking."
      tabs={[
        { key: 'summary', label: 'Sales Order Summary', render: () => <SalesOrderSummary embedded /> },
        { key: 'fulfillment', label: 'Order Fulfillment', render: () => <OrderFulfillmentReport embedded /> },
        { key: 'open', label: 'Open Sales Orders', render: () => <OpenSalesOrderReport embedded /> },
        { key: 'production-tracking', label: 'Production Tracking', render: () => <SalesOrderProductionTracking embedded /> },
      ]}
    />
  );
}
