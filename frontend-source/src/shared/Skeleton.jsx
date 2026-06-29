export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="panel overflow-hidden">
      <div className="grid gap-px bg-slate-200 dark:bg-slate-800" style={{ gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))` }}>
        {Array.from({ length: cols }).map((_, index) => (
          <SkeletonBlock key={`h-${index}`} className="h-12 rounded-none bg-slate-100 dark:bg-slate-900" />
        ))}
        {Array.from({ length: rows * cols }).map((_, index) => (
          <SkeletonBlock key={index} className="h-16 rounded-none bg-white dark:bg-slate-950" />
        ))}
      </div>
    </div>
  );
}
