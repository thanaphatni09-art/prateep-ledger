import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  /** Accessible label, e.g. "พิมพ์ใบแจ้งหนี้". */
  label?: string;
  className?: string;
}

/**
 * Print / save-as-PDF trigger for a document sheet.
 *
 * The sheet must be wrapped in an element carrying `doc-print-root`; the
 * print stylesheet hides everything else and isolates that subtree on A4.
 * `window.print()` opens the browser dialog where the user can also choose
 * "Save as PDF".
 */
export function PrintButton({
  label = "พิมพ์ / บันทึกเป็น PDF",
  className,
}: PrintButtonProps) {
  return (
    <Button
      type="button"
      variant="default"
      className={className}
      onClick={() => window.print()}
      data-ocid="document.print_button"
    >
      <Printer className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
