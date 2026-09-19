import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-backend";
import { Landmark } from "lucide-react";

interface BankInfoCardProps {
  className?: string;
}

interface BankRow {
  label: string;
  value: string;
}

/** Shop bank details the customer transfers against, shown beside the upload form. */
export function BankInfoCard({ className }: BankInfoCardProps) {
  const { data: settings, isLoading } = useSettings();

  const rows: BankRow[] = settings
    ? [
        { label: "ธนาคาร", value: settings.bankName },
        { label: "ชื่อบัญชี", value: settings.accountName },
        { label: "เลขที่บัญชี", value: settings.accountNumber },
        { label: "พร้อมเพย์", value: settings.promptPayRef },
      ].filter((row) => row.value.trim() !== "")
    : [];

  return (
    <Card className={className} data-ocid="customer.bank_info_card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-primary">
            <Landmark className="size-4" aria-hidden="true" />
          </span>
          บัญชีสำหรับโอนเงิน
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-3" data-ocid="loading_state">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            ร้านยังไม่ได้ตั้งค่าข้อมูลบัญชีธนาคาร กรุณาติดต่อผู้จัดการร้าน
          </p>
        ) : (
          <dl className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="ledger-figure text-right text-sm font-medium text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          โอนเงินตามยอดที่แจ้ง แล้วแนบหลักฐานการโอนเพื่อให้ผู้จัดการร้านตรวจสอบ
        </p>
      </CardContent>
    </Card>
  );
}
