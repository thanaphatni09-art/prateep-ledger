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
import { useMyCustomer } from "@/hooks/use-auth";
import {
  useMyDebt,
  useMyInvoices,
  useMyPayments,
  useMyReceipts,
} from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  Receipt,
  ScrollText,
  Upload,
  Wallet,
} from "lucide-react";

/** Customer landing view: balance at a glance plus the latest activity. */
export function CustomerDashboardPage() {
  const { data: customer } = useMyCustomer();
  const debt = useMyDebt();
  const invoices = useMyInvoices();
  const payments = useMyPayments();
  const receipts = useMyReceipts();

  const outstanding = debt.data?.outstandingBalance ?? 0n;
  const recentInvoices = (invoices.data ?? []).slice(0, 5);
  const recentPayments = (payments.data ?? []).slice(0, 5);
  const isLoading = debt.isLoading || invoices.isLoading || payments.isLoading;

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title={customer ? `สวัสดี ${customer.name}` : "ภาพรวมบัญชีของฉัน"}
          description="สรุปยอดค้างชำระ ใบแจ้งหนี้ และการชำระเงินล่าสุดของคุณ"
          actions={
            <Button asChild className="gap-2" data-ocid="customer.upload_link">
              <Link to="/customer/proofs">
                <Upload className="size-4" aria-hidden="true" />
                แจ้งชำระเงิน
              </Link>
            </Button>
          }
        />

        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-ocid="customer.summary_section"
        >
          <Card
            className="bg-gradient-subtle"
            data-ocid="customer.balance_card"
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ScrollText className="size-4" aria-hidden="true" />
                ยอดค้างชำระทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="ledger-figure text-2xl font-semibold text-foreground">
                {formatTHB(outstanding)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {outstanding > 0n
                  ? "กรุณาชำระตามกำหนดเพื่อรักษาเครดิต"
                  : "ไม่มียอดค้างชำระ"}
              </p>
            </CardContent>
          </Card>

          <Card data-ocid="customer.invoice_count_card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="size-4" aria-hidden="true" />
                ใบแจ้งหนี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="ledger-figure text-2xl font-semibold text-foreground">
                {invoices.data?.length ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ฉบับทั้งหมด</p>
            </CardContent>
          </Card>

          <Card data-ocid="customer.payment_count_card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="size-4" aria-hidden="true" />
                การชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="ledger-figure text-2xl font-semibold text-foreground">
                {payments.data?.length ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">รายการทั้งหมด</p>
            </CardContent>
          </Card>

          <Card data-ocid="customer.receipt_count_card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Receipt className="size-4" aria-hidden="true" />
                ใบเสร็จ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="ledger-figure text-2xl font-semibold text-foreground">
                {receipts.data?.length ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ฉบับทั้งหมด</p>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-ocid="customer.recent_invoices_card">
            <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border pb-4">
              <CardTitle className="text-base">ใบแจ้งหนี้ล่าสุด</CardTitle>
              <Button
                asChild
                variant="link"
                size="sm"
                className="gap-1 px-0"
                data-ocid="customer.invoices_link"
              >
                <Link to="/customer/invoices">
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <LoadingState rows={4} />
              ) : recentInvoices.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="ยังไม่มีใบแจ้งหนี้"
                  description="เมื่อร้านออกใบแจ้งหนี้ให้คุณ รายการจะแสดงที่นี่"
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recentInvoices.map((invoice) => (
                    <li key={invoice.id.toString()}>
                      <Link
                        to="/customer/invoices/$invoiceId"
                        params={{ invoiceId: invoice.id.toString() }}
                        className="flex items-center justify-between gap-4 py-3 transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid="customer.invoice_link"
                      >
                        <div className="min-w-0">
                          <p className="ledger-figure truncate text-sm font-medium text-foreground">
                            {invoice.number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ครบกำหนด {formatThaiDate(invoice.dueAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="ledger-figure text-sm font-medium text-foreground">
                            {formatTHB(invoice.outstanding)}
                          </span>
                          <StatusBadge status={invoice.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card data-ocid="customer.recent_payments_card">
            <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border pb-4">
              <CardTitle className="text-base">การชำระเงินล่าสุด</CardTitle>
              <Button
                asChild
                variant="link"
                size="sm"
                className="gap-1 px-0"
                data-ocid="customer.payments_link"
              >
                <Link to="/customer/payments">
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <LoadingState rows={4} />
              ) : recentPayments.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="ยังไม่มีการชำระเงิน"
                  description="เมื่อคุณแจ้งชำระเงินและผู้จัดการร้านอนุมัติ รายการจะแสดงที่นี่"
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recentPayments.map((payment) => (
                    <li key={payment.id.toString()}>
                      <Link
                        to="/customer/payments/$paymentId"
                        params={{ paymentId: payment.id.toString() }}
                        className="flex items-center justify-between gap-4 py-3 transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid="customer.payment_link"
                      >
                        <div className="min-w-0">
                          <p className="ledger-figure truncate text-sm font-medium text-foreground">
                            {payment.invoiceNumber || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatThaiDate(payment.paidAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="ledger-figure text-sm font-medium text-foreground">
                            {formatTHB(payment.amount)}
                          </span>
                          <StatusBadge status={payment.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
