import { Skeleton } from '@/components/ui/skeleton'

export function AuthPageSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-12 rounded-xl" />
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-4 shadow-xl">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
