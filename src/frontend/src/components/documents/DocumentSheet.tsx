import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DocumentSheetProps {
  /** Accessible name for the printable sheet, e.g. "ใบแจ้งหนี้ INV-2569-0001". */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * The A4 paper surface shared by every printable Thai document.
 *
 * Always renders on light "paper" tokens regardless of the app theme — see
 * `styles/print.css`. Wrap the sheet in a `doc-print-root` element (the
 * `PrintButton` does this) so `window.print()` isolates it from the app chrome.
 */
export function DocumentSheet({
  label,
  children,
  className,
}: DocumentSheetProps) {
  return (
    <article
      className={cn("doc-sheet", className)}
      aria-label={label}
      data-ocid="document.sheet"
    >
      {children}
    </article>
  );
}
