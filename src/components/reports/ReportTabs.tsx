import { ReactNode, useState } from 'react';
import { FileBarChart } from 'lucide-react';

export interface ReportTab {
  key: string;
  label: string;
  render: () => ReactNode;
}

interface Props {
  title: string;
  subtitle: string;
  tabs: ReportTab[];
}

/**
 * Group page that shows a title header and a row of tabs. Each tab renders one
 * report (a ReportShell). Only the active tab's report is mounted so filters /
 * data are loaded lazily per tab.
 */
export default function ReportTabs({ title, subtitle, tabs }: Props) {
  const [active, setActive] = useState(tabs[0]?.key);
  const activeTab = tabs.find(t => t.key === active) || tabs[0];

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-600/20 shrink-0">
          <FileBarChart size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">{subtitle}</p>
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

      <div>{activeTab?.render()}</div>
    </div>
  );
}
