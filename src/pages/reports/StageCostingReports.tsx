import { useState } from 'react';
import { FileBarChart } from 'lucide-react';
import WipCostSheetReport from './costing/WipCostSheetReport';
import StageCostSummaryReport from './costing/StageCostSummaryReport';
import StandardVsActualCostReport from './costing/StandardVsActualCostReport';

type TabKey = 'stage-cost-summary' | 'stage-costing-breakup' | 'standard-vs-actual';

export default function StageCostingReports() {
  const [active, setActive] = useState<TabKey>('stage-cost-summary');
  // When a summary row is clicked we jump to the breakup tab filtered to that order.
  const [breakupOrderNo, setBreakupOrderNo] = useState('');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'stage-cost-summary', label: 'Stage Costing Summary' },
    { key: 'stage-costing-breakup', label: 'Stage Costing Breakup' },
    { key: 'standard-vs-actual', label: 'Standard vs Actual Cost' },
  ];

  const openBreakupForOrder = (orderNo: string) => {
    setBreakupOrderNo(orderNo);
    setActive('stage-costing-breakup');
  };

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-600/20 shrink-0">
          <FileBarChart size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Stage Costing Reports</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">Stage costing summary, breakup and standard vs actual.</p>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab.key === active
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {active === 'stage-cost-summary' && (
          <StageCostSummaryReport embedded onRowClick={openBreakupForOrder} />
        )}
        {active === 'stage-costing-breakup' && (
          <WipCostSheetReport embedded orderNo={breakupOrderNo} />
        )}
        {active === 'standard-vs-actual' && <StandardVsActualCostReport embedded />}
      </div>
    </div>
  );
}
