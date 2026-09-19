import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyPayments } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { PaymentMethod, PaymentStatus } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_FILTERS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: PaymentStatus.pending, label: "รอตรวจสอบ" },
  { value: PaymentStatus.approved, label: "อนุมัติแล้ว" },
  { value: PaymentStatus.rejected, label: "ถูกปฏิเสธ" },
];

function methodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.cash:
      return "เงินสด";
    case PaymentMethod.bankTransfer:
      return "โอนเงิน";
    default:
      return "อื่น ๆ";
  }
}

/** The signed-in customer's own payments with review status. */
export function MyPaymentsPage() {
  const { data: payments, isLoading } = useMyPayments();
  const [status, setStatus] = useState<PaymentStatus | "all">("all");

  const filtered = useMemo(
    () =>
      (payments ?? []).filter(
        (payment) => status === "all" || payment.status === status,
      ),
    [payments, status],
  );

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title="การชำระเงินของฉัน"
          description="รายการชำระเงินทั้งหมด พร้อมสถานะการตรวจสอบจากผู้จัดการร้าน"
        />

        <fieldset
          className="flex flex-wrap gap-1.5"
          aria-label="กรองตามสถานะ"
          data-ocid="customer.payment_filter"
        >
          <legend className="sr-only">กรองตามสถานะ</legend>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={status === filter.value ? "default" : "outline"}
              onClick={() => setStatus(filter.value)}
              data-ocid={`customer.payment_filter.${filter.value}`}
            >
              {filter.label}
            </Button>
          ))}
        </fieldset>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={
              (payments ?? []).length === 0
                ? "ยังไม่มีการชำระเงิน"
                : "ไม่พบรายการที่ตรงกับตัวกรอง"
            }
            description={
              (payments ?? []).length === 0
                ? "เมื่อคุณแจ้งชำระเงินและผู้จัดการร้านอนุมัติ รายการจะแสดงที่นี่"
                : "ลองเลือกสถานะอื่นเพื่อดูรายการที่เหลือ"
            }
          />
        ) : (
          <Card data-ocid="customer.payment_list">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        ใบแจ้งหนี้
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        วันที่ชำระ
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        วิธีชำระ
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        จำนวนเงิน
                      </th>
                      <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((payment, index) => (
                      <tr
                        key={payment.id.toString()}
                        className="transition-smooth hover:bg-muted/40"
                        data-ocid={`customer.payment_row.${index + 1}`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            to="/customer/payments/$paymentId"
                            params={{ paymentId: payment.id.toString() }}
                            className="ledger-figure font-medium text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            data-ocid={`customer.payment_link.${index + 1}`}
                          >
                            {payment.invoiceNumber || "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatThaiDate(payment.paidAt)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {methodLabel(payment.method)}
                        </td>
                        <td className="ledger-figure px-4 py-3 text-right font-medium text-foreground">
                          {formatTHB(payment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
