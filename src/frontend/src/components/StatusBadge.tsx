import { cn } from "@/lib/utils";
import { InvoiceStatus, PaymentStatus, ProofStatus } from "@/types/app";

type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "primary";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  accent: "text-accent",
  primary: "text-primary",
};

interface StatusBadgeProps {
  /** A backend status enum value, or a free-form label for other states. */
  status?: InvoiceStatus | PaymentStatus | ProofStatus | string;
  label?: string;
  tone?: BadgeTone;
  className?: string;
}

function resolve(status: string): { label: string; tone: BadgeTone } {
  switch (status) {
    case InvoiceStatus.paid:
    case PaymentStatus.approved:
    case ProofStatus.approved:
      return { label: "ชำระแล้ว", tone: "success" };
    case InvoiceStatus.partiallyPaid:
      return { label: "ชำระบางส่วน", tone: "accent" };
    case InvoiceStatus.unpaid:
      return { label: "ค้างชำระ", tone: "warning" };
    case InvoiceStatus.overdue:
      return { label: "เกินกำหนด", tone: "danger" };
    case PaymentStatus.pending:
    case ProofStatus.pending:
      return { label: "รอตรวจสอบ", tone: "accent" };
    case PaymentStatus.rejected:
    case ProofStatus.rejected:
      return { label: "ถูกปฏิเสธ", tone: "danger" };
    default:
      return { label: status, tone: "neutral" };
  }
}

/** Ledger margin-tick status chip. Colour carries meaning, never decoration. */
export function StatusBadge({
  status,
  label,
  tone,
  className,
}: StatusBadgeProps) {
  const resolved = status
    ? resolve(status)
    : { label: label ?? "—", tone: "neutral" as BadgeTone };
  const finalTone = tone ?? resolved.tone;
  return (
    <span
      className={cn(
        "ledger-tick inline-flex items-center whitespace-nowrap text-xs font-medium",
        TONE_CLASSES[finalTone],
        className,
      )}
      data-ocid="status.badge"
    >
      {label ?? resolved.label}
    </span>
  );
}
