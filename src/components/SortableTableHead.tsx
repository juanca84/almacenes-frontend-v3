import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { TableHead } from '@/components/ui/table'

interface SortableTableHeadProps {
  col:      string
  sortBy:   string | null
  sortDir:  'ASC' | 'DESC'
  onSort:   (col: string) => void
  children: React.ReactNode
  className?: string
}

export function SortableTableHead({
  col, sortBy, sortDir, onSort, children, className,
}: SortableTableHeadProps) {
  const active = sortBy === col

  return (
    <TableHead
      className={cn('cursor-pointer select-none', className)}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-foreground/80 transition-colors">
        {children}
        {active
          ? sortDir === 'ASC'
            ? <ArrowUp   className="size-3.5 text-primary" />
            : <ArrowDown className="size-3.5 text-primary" />
          : <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
        }
      </span>
    </TableHead>
  )
}
