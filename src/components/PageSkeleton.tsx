import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from './TableSkeleton'

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-28" />
      </div>

      <TableSkeleton cols={5} rows={8} />
    </div>
  )
}
