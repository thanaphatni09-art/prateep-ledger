import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton rows to render. */
  rows?: number;
  className?: string;
  label?: string;
}

const SKELETON_IDS = Array.from({ length: 12 }, (_, i) => `skeleton-row-${i}`);

/** Layout-matched skeleton rows for dense ledger tables. */
export function LoadingState({
  rows = 6,
  className,
  label = "กำลังโหลดข้อมูล",
}: LoadingStateProps) {
  return (
    <output
      className={cn("block space-y-3", className)}
      aria-live="polite"
      data-ocid="loading_state"
    >
      <span className="sr-only">{label}</span>
      {SKELETON_IDS.slice(0, rows).map((id) => (
        <div key={id} className="flex items-center gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </output>
  );
}
