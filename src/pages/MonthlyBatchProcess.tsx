import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Play, CheckCircle, Loader2, RotateCcw, Calendar, AlertTriangle, Clock } from 'lucide-react';
import api from '../lib/api';

interface ProcessStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message?: string;
}

interface BatchProcessStatus {
  last_execution_date: string | null;
  last_execution_month: string | null;
  is_locked: boolean;
}

const STEPS: { id: number; name: string }[] = [
  { id: 1, name: 'Calculating the average rates' },
  { id: 2, name: 'Archiving all transactions' },
  { id: 3, name: 'Updating material master from ledger' },
  { id: 4, name: 'Archiving closing balance' },
  { id: 5, name: 'Creating opening stocks' },
];

// Helper to get default date range (previous month)
function getDefaultDateRange() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear = currentYear - 1;
  }
  
  const firstDay = new Date(prevYear, prevMonth, 1);
  const lastDay = new Date(prevYear, prevMonth + 1, 0);
  
  return {
    fromDate: firstDay.toISOString().split('T')[0],
    toDate: lastDay.toISOString().split('T')[0],
  };
}

// Helper to get current month identifier
function getCurrentMonthIdentifier() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function MonthlyBatchProcess() {
  const { fromDate: defaultFromDate, toDate: defaultToDate } = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>(
    STEPS.map(s => ({ ...s, status: 'pending' as const, progress: 0, message: '' }))
  );
  const [stepMessages, setStepMessages] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, any>>({});
  const [batchStatus, setBatchStatus] = useState<BatchProcessStatus>({
    last_execution_date: null,
    last_execution_month: null,
    is_locked: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Calculate the current month being processed
  const currentMonth = `${new Date(fromDate).getFullYear()}-${String(new Date(fromDate).getMonth() + 1).padStart(2, '0')}`;

  // Check if this month has already been processed
  const alreadyProcessed = batchStatus.last_execution_month === currentMonth;

  // Load batch process status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api('/material-issues/batch-process/status', {
          method: 'GET',
        });
        if (response.success) {
          setBatchStatus(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch batch process status:', err);
      }
    };
    fetchStatus();
  }, []);

  // Auto-check if current month is already processed
  useEffect(() => {
    if (batchStatus.last_execution_month && !running) {
      const selectedMonth = `${new Date(fromDate).getFullYear()}-${String(new Date(fromDate).getMonth() + 1).padStart(2, '0')}`;
      if (batchStatus.last_execution_month === selectedMonth) {
        setError(`Month end job already executed for ${batchStatus.last_execution_month}. Please select a different period.`);
      } else {
        setError(null);
      }
    }
  }, [fromDate, toDate, batchStatus, running]);

  const updateStep = useCallback((id: number, updates: Partial<ProcessStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const setStepMessage = useCallback((id: number, message: string) => {
    setStepMessages(prev => ({ ...prev, [id]: message }));
  }, []);

  // Auto-fill previous month dates
  const handleUsePreviousMonth = () => {
    const { fromDate, toDate } = getDefaultDateRange();
    setFromDate(fromDate);
    setToDate(toDate);
    setError(null);
    toast.info('Date range set to previous month');
  };

  // Reset error when dates change
  useEffect(() => {
    if (error && (fromDate !== defaultFromDate || toDate !== defaultToDate)) {
      const selectedMonth = `${new Date(fromDate).getFullYear()}-${String(new Date(fromDate).getMonth() + 1).padStart(2, '0')}`;
      if (batchStatus.last_execution_month !== selectedMonth) {
        setError(null);
      }
    }
  }, [fromDate, toDate, batchStatus, error]);

  const executeStep = async (stepId: number, endpoint: string, stepName: string) => {
    updateStep(stepId, { status: 'running', progress: 10, message: `Starting ${stepName}...` });
    
    try {
      const response = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      });
      
      if (response.success) {
        updateStep(stepId, { 
          status: 'completed', 
          progress: 100,
          message: response.message || `${stepName} completed`
        });
        setResults(prev => ({ ...prev, [stepId]: response.data }));
        setStepMessage(stepId, response.message || `${stepName} completed`);
        return true;
      } else {
        updateStep(stepId, { 
          status: 'error', 
          progress: 100,
          message: response.message || 'Step failed'
        });
        setStepMessage(stepId, response.message || 'Step failed');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || err.toString() || 'Unknown error';
      updateStep(stepId, { 
        status: 'error', 
        progress: 100,
        message: `Error: ${errorMessage}`
      });
      setStepMessage(stepId, `Error: ${errorMessage}`);
      return false;
    }
  };

  const handleExecute = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select From Date and To Date');
      return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From Date must be before To Date');
      return;
    }
    
    // Check if already processed for this period
    if (alreadyProcessed) {
      toast.error(`Month end job already executed for ${batchStatus.last_execution_month}. Please select a different period.`);
      return;
    }

    setRunning(true);
    setCompleted(false);
    setSteps(STEPS.map(s => ({ ...s, status: 'pending' as const, progress: 0, message: '' })));
    setStepMessages({});
    setResults({});
    setError(null);

    try {
      // Execute all steps via single endpoint
      const response = await api('/material-issues/batch-process/execute', {
        method: 'POST',
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      });
      
      if (response.success) {
        // Update UI to show completion
        setCompleted(true);
        setSteps(STEPS.map(s => ({ ...s, status: 'completed' as const, progress: 100 })));
        setResults(response.data.results || {});
        
        // Refresh batch status
        const statusResponse = await api('/material-issues/batch-process/status', {
          method: 'GET',
        });
        if (statusResponse.success) {
          setBatchStatus(statusResponse.data);
        }
        
        toast.success('Monthly batch process completed successfully!');
      } else if (response.already_executed) {
        setError(response.message);
        toast.error(response.message);
      } else {
        toast.error('Batch process failed: ' + (response.message || 'Unknown error'));
      }
      
    } catch (err: any) {
      toast.error('Batch process failed: ' + (err.message || err.toString()));
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setSteps(STEPS.map(s => ({ ...s, status: 'pending' as const, progress: 0, message: '' })));
    setCompleted(false);
    setStepMessages({});
    setResults({});
    // Keep dates for convenience
  };

  const getStepMessage = (stepId: number) => {
    return stepMessages[stepId] || steps.find(s => s.id === stepId)?.message || '';
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not executed yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Batch Process</h1>
        <p className="text-sm text-gray-500 mt-1">Run monthly closing and opening stock processing for the selected period.</p>
      </div>

      {/* Last Execution Info - Display in RED */}
      {batchStatus.last_execution_date && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Last Processed</p>
              <p className="text-sm text-red-700">
                Date: <span className="font-semibold">{formatDate(batchStatus.last_execution_date)}</span>
              </p>
              <p className="text-sm text-red-700">
                Month: <span className="font-semibold">{batchStatus.last_execution_month}</span>
              </p>
              {alreadyProcessed && (
                <p className="text-sm text-red-700 mt-1">
                  ⚠️ Month end job already executed for this period
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message - Display if trying to execute already processed month */}
      {error && !running && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Status */}
      {!batchStatus.last_execution_date && !running && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Batch process not yet executed</p>
              <p className="text-xs text-blue-600 mt-0.5">Select a date range and click Execute to run the monthly batch process</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar size={14} /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setError(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar size={14} /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setError(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleUsePreviousMonth}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mb-2"
          >
            Use Previous Month
          </button>
          <button
            onClick={handleExecute}
            disabled={running || !fromDate || !toDate || alreadyProcessed}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? 'Processing...' : 'Execute'}
          </button>
          {completed && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
        
        {/* Date range info */}
        {fromDate && toDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Selected period: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
            </p>
            {alreadyProcessed && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ This month has already been processed. Please select a different period.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Process Steps Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-gray-700 w-12">#</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-gray-700">Process Step</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-gray-700 w-48">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-gray-700 w-48">Progress</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {steps.map((step) => (
              <tr key={step.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    step.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    step.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {step.id}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{step.name}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {step.status === 'completed' && <CheckCircle size={16} className="text-emerald-600" />}
                    {step.status === 'running' && <Loader2 size={16} className="text-blue-600 animate-spin" />}
                    {step.status === 'error' && <AlertTriangle size={16} className="text-red-600" />}
                    <span className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-emerald-700' :
                      step.status === 'running' ? 'text-blue-700' :
                      step.status === 'error' ? 'text-red-700' :
                      'text-gray-400'
                    }`}>
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'running' ? 'Running...' :
                       step.status === 'error' ? 'Error' : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          step.status === 'completed' ? 'bg-emerald-500' :
                          step.status === 'running' ? 'bg-blue-500' :
                          step.status === 'error' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold min-w-[36px] text-right ${
                      step.status === 'completed' ? 'text-emerald-700' :
                      step.status === 'running' ? 'text-blue-700' :
                      step.status === 'error' ? 'text-red-700' :
                      'text-gray-400'
                    }`}>
                      {step.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {getStepMessage(step.id) && (
                    <div className="text-xs text-gray-600 max-w-[200px] truncate" title={getStepMessage(step.id)}>
                      {getStepMessage(step.id)}
                    </div>
                  )}
                  {results[step.id]?.processed_count && (
                    <div className="text-xs text-blue-600 mt-1">
                      Processed: {results[step.id]?.processed_count || results[step.id]?.created_count || results[step.id]?.archived_count || 0} items
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      {completed && Object.keys(results).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-blue-800 mb-3">Process Results Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results[1] && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500">Average Rates Calculation</p>
                <p className="text-lg font-semibold text-blue-700">{results[1]?.processed_count || 0} entries</p>
              </div>
            )}
            {results[2] && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500">Transactions Archived</p>
                <p className="text-lg font-semibold text-blue-700">{results[2]?.total_archived || 0} records</p>
              </div>
            )}
            {results[3] && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500">Material Master Updated</p>
                <p className="text-lg font-semibold text-blue-700">{results[3]?.updated_count || 0} materials</p>
              </div>
            )}
            {results[4] && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500">Closing Balance Archived</p>
                <p className="text-lg font-semibold text-blue-700">{results[4]?.archived_count || 0} pairs</p>
              </div>
            )}
            {results[5] && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500">Opening Stocks Created</p>
                <p className="text-lg font-semibold text-blue-700">{results[5]?.created_count || 0} entries</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {completed && !error && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Batch process completed successfully!</p>
            <p className="text-xs text-emerald-600 mt-0.5">All steps have been executed successfully for the selected period.</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {steps.some(s => s.status === 'error') && !running && !completed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <p className="text-sm font-bold mb-2">Some steps encountered errors</p>
          <p className="text-xs">Please review the error messages in the table above and try again.</p>
        </div>
      )}
    </div>
  );
}
