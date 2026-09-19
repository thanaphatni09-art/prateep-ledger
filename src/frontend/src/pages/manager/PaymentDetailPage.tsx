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
import { Separator } from "@/components/ui/separator";
import { usePayment } from "@/hooks/use-backend";
import { formatTHB, formatThaiDateTime } from "@/lib/format";
import { PaymentMethod } from "@/types/app";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Wallet } from "lucide-react";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: "เงินสด",
  [PaymentMethod.bankTransfer]: "โอนผ่านธนาคาร",
  [PaymentMethod.other]: "อื่น ๆ",
};

/** Payment detail: amount, method, reference, and the linked invoice. */
export function PaymentDetailPage() {
  const { paymentId } = useParams({ from: "/manager/payments/$paymentId" });
  const id = BigInt(paymentId);
  const payment = usePayment(id);
  const record = payment.data;

  if (payment.isLoading) {
    return (
      <Layout area="manager">
        <LoadingState rows={6} />
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout area="manager">
        <EmptyState
          icon={Wallet}
          title="ไม่พบรายการชำระเงิน"
          description="รายการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ"
          action={
            <Button asChild size="sm">
              <Link to="/manager/payments">กลับไปรายการชำระเงิน</Link>
            </Button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="payment_detail.page">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/manager/payments" data-ocid="payment_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายการชำระเงิน
          </Link>
        </Button>

        <PageHeader
          title={`การชำระเงิน ${formatTHB(record.amount)}`}
          description={`${record.customerName} · บันทึกเมื่อ ${formatThaiDateTime(record.createdAt)}`}
          actions={<StatusBadge status={record.status} />}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">รายละเอียดการชำระเงิน</CardTitle>
              <CardDescription>ข้อมูลที่บันทึกไว้สำหรับการรับชำระครั้งนี้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">จำนวนเงิน</p>
                  <p
                    className="ledger-figure text-lg font-semibold text-foreground"
                    data-ocid="payment_detail.amount"
                  >
                    {formatTHB(record.amount)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">ช่องทางชำระเงิน</p>
                  <p className="text-foreground">
                    {METHOD_LABELS[record.method]}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">วันที่รับชำระ</p>
                  <p className="text-foreground">
                    {formatThaiDateTime(record.paidAt)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">เลขที่อ้างอิง</p>
                  <p className="ledger-figure text-foreground">
                    {record.reference || "—"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  ใบแจ้งหนี้ที่เชื่อมโยง
                </span>
                <Link
                  to="/manager/invoices/$invoiceId"
                  params={{ invoiceId: record.invoiceId.toString() }}
                  className="ledger-figure inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:underline"
                  data-ocid="payment_detail.invoice_link"
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  {record.invoiceNumber}
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">ที่มา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">ลูกค้า</span>
                <Link
                  to="/manager/customers/$customerId"
                  params={{ customerId: record.customerId.toString() }}
                  className="text-sm font-medium text-primary transition-smooth hover:underline"
                  data-ocid="payment_detail.customer_link"
                >
                  {record.customerName}
                </Link>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  หลักฐานการโอน
                </span>
                <span className="text-sm text-foreground">
                  {record.proofId !== undefined ? "มีหลักฐานแนบ" : "บันทึกด้วยตนเอง"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
