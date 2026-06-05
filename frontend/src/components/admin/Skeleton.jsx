export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-pink-100 rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-pink-100 rounded-[2rem] p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-pink-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-3/4" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="border-b border-pink-50">
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c} className="py-4 px-4">
          <div className="animate-pulse bg-pink-100 rounded-lg h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-pink-50 rounded-[2rem] p-7 animate-pulse space-y-3">
          <SkeletonLine className="h-3 w-1/2" />
          <SkeletonLine className="h-8 w-2/3" />
          <SkeletonLine className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
