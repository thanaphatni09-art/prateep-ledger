import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMyPayments } from "@/hooks/use-backend";
import { formatTHB, formatThaiDateTime } from "@/lib/format";
import { PaymentMethod, PaymentStatus } from "@/types/app";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Receipt, Wallet } from "lucide-react";

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

/** One payment with its review status and a link to the issued receipt. */
export function MyPaymentDetailPage() {
  const { paymentId } = useParams({ from: "/customer/payments/$paymentId" });
  const parsedId = /^\d+$/.test(paymentId) ? BigInt(paymentId) : null;
  const { data: payments, isLoading } = useMyPayments();

  const payment = (payments ?? []).find((row) => row.id === parsedId) ?? null;

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 px-0"
          data-ocid="customer.back_button"
        >
          <Link to="/customer/payments">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายการชำระเงิน
          </Link>
        </Button>

        {isLoading ? (
          <LoadingState rows={5} />
        ) : !payment ? (
          <EmptyState
            icon={Wallet}
            title="ไม่พบรายการชำระเงิน"
            description="รายการนี้อาจถูกลบหรือไม่ได้เป็นของคุณ"
            action={
              <Button asChild data-ocid="customer.back_to_list_button">
                <Link to="/customer/payments">กลับไปรายการชำระเงิน</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              title="รายละเอียดการชำระเงิน"
              description={`บันทึกเมื่อ ${formatThaiDateTime(payment.createdAt)}`}
              actions={<StatusBadge status={payment.status} />}
            />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card data-ocid="customer.payment_detail_card">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">ข้อมูลการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2">
                    <span className="text-sm text-muted-foreground">
                      ใบแจ้งหนี้
                    </span>
                    <Link
                      to="/customer/invoices/$invoiceId"
                      params={{ invoiceId: payment.invoiceId.toString() }}
                      className="ledger-figure text-sm font-medium text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-ocid="customer.payment_invoice_link"
                    >
                      {payment.invoiceNumber || "—"}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2">
                    <span className="text-sm text-muted-foreground">
                      จำนวนเงิน
                    </span>
                    <span className="ledger-figure text-sm font-semibold text-foreground">
                      {formatTHB(payment.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2">
                    <span className="text-sm text-muted-foreground">
                      วิธีชำระ
                    </span>
                    <span className="text-sm text-foreground">
                      {methodLabel(payment.method)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2">
                    <span className="text-sm text-muted-foreground">
                      วันที่ชำระ
                    </span>
                    <span className="text-sm text-foreground">
                      {formatThaiDateTime(payment.paidAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      หมายเลขอ้างอิง
                    </span>
                    <span className="ledger-figure text-sm text-foreground">
                      {payment.reference || "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card data-ocid="customer.payment_status_card">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">สถานะการตรวจสอบ</CardTitle>
                  <CardDescription>
                    ผู้จัดการร้านเป็นผู้ตรวจสอบและอนุมัติการชำระเงิน
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <StatusBadge status={payment.status} />
                  <p className="text-sm text-muted-foreground">
                    {payment.status === PaymentStatus.pending
                      ? "รายการนี้อยู่ระหว่างรอผู้จัดการร้านตรวจสอบ"
                      : payment.status === PaymentStatus.approved
                        ? "ผู้จัดการร้านอนุมัติการชำระเงินนี้แล้ว"
                        : "ผู้จัดการร้านปฏิเสธรายการนี้ กรุณาตรวจสอบหลักฐานอีกครั้ง"}
                  </p>
                  {payment.status === PaymentStatus.approved ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full gap-2"
                      data-ocid="customer.receipts_link"
                    >
                      <Link to="/customer/receipts">
                        <Receipt className="size-4" aria-hidden="true" />
                        ดูใบเสร็จของฉัน
                      </Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
