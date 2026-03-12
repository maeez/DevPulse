import { cn } from '../../services/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800',
      className
    )}
  />
)

export const RepoCardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex gap-4 pt-1">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
)

export const EventSkeleton = () => (
  <div className="flex gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800">
    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
)

export const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
)

export const HeatmapSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
    <Skeleton className="h-5 w-40 mb-4" />
    <div className="flex gap-1">
      {Array.from({ length: 52 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          {Array.from({ length: 7 }).map((_, j) => (
            <Skeleton key={j} className="w-3 h-3 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  </div>
)
