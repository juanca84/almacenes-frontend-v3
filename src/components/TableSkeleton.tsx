import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  cols?: number
  rows?: number
}

export function TableSkeleton({ cols = 5, rows = 8 }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/40">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {/* Filas */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          {Array.from({ length: Math.max(0, cols - 2) }).map((_, j) => (
            <Skeleton key={j} className="h-5 w-16 rounded-full" />
          ))}
        </div>
      ))}
    </div>
  )
}
