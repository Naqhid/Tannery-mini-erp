const COLORS: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'in progress': 'bg-blue-50 text-blue-700 border-blue-200',
  planned: 'bg-gray-100 text-gray-600 border-gray-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  posted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const key = (status || '').toLowerCase();
  const cls = COLORS[key] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status || '—'}
    </span>
  );
}
