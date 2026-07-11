interface SkeletonLoaderProps {
  rows?: number;
  cols?: number;
}

export default function SkeletonLoader({ rows = 5, cols = 4 }: SkeletonLoaderProps) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
          <td className="py-3.5 px-5">
            <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
          </td>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="py-3.5 px-5">
              <div
                className="h-4 rounded-lg bg-gray-200 animate-pulse"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </td>
          ))}
          <td className="py-3.5 px-5">
            <div className="flex gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
