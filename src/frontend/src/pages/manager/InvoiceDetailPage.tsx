import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentForm } from "@/components/manager/PaymentForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInvoice,
  useInvoiceDocument,
  useRecordPayment,
} from "@/hooks/use-backend";
import { formatTHB, formatThaiDate, formatThaiDateTime } from "@/lib/format";
import type { PaymentInput } from "@/types/app";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Printer, Wallet } from "lucide-react";
import { useState } from "react";

/** Invoice detail: line items, totals, linked payments, and print document. */
export function InvoiceDetailPage() {
  const { invoiceId } = useParams({ from: "/manager/invoices/$invoiceId" });
  const id = BigInt(invoiceId);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const invoice = useInvoice(id);
  const document = useInvoiceDocument(id);
  const recordPayment = useRecordPayment();

  const detail = invoice.data;
  const invoiceRecord = detail?.invoice;

  function handlePayment(input: PaymentInput) {
    recordPayment.mutate(input, {
      onSuccess: () => setPaymentOpen(false),
    });
  }

  if (invoice.isLoading) {
    return (
      <Layout area="manager">
        <LoadingState rows={8} />
      </Layout>
    );
  }

  if (!detail || !invoiceRecord) {
    return (
      <Layout area="manager">
        <EmptyState
          icon={FileText}
          title="ไม่พบใบแจ้งหนี้"
          description="ใบแจ้งหนี้นี้อาจถูกลบหรือไม่มีอยู่ในระบบ"
          action={
            <Button asChild size="sm">
              <Link to="/manager/invoices">กลับไปรายการใบแจ้งหนี้</Link>
            </Button>
          }
        />
      </Layout>
    );
  }

  const canRecordPayment = invoiceRecord.outstanding > 0n;

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="invoice_detail.page">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/manager/invoices" data-ocid="invoice_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายการใบแจ้งหนี้
          </Link>
        </Button>

        <PageHeader
          title={`ใบแจ้งหนี้ ${invoiceRecord.number}`}
          description={`${invoiceRecord.customerName} · ออกเมื่อ ${formatThaiDate(invoiceRecord.issuedAt)} · ครบกำหนด ${formatThaiDate(invoiceRecord.dueAt)}`}
          actions={
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => window.print()}
                data-ocid="invoice_detail.print_button"
              >
                <Printer className="size-4" aria-hidden="true" />
                พิมพ์ / บันทึก PDF
              </Button>
              <Button
                className="gap-1.5"
                onClick={() => setPaymentOpen(true)}
                disabled={!canRecordPayment}
                data-ocid="invoice_detail.record_payment_button"
              >
                <Wallet className="size-4" aria-hidden="true" />
                บันทึกการชำระเงิน
              </Button>
            </>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>ยอดรวม</CardDescription>
              <CardTitle className="ledger-figure text-2xl">
                {formatTHB(invoiceRecord.total)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>ชำระแล้ว</CardDescription>
              <CardTitle className="ledger-figure text-2xl">
                {formatTHB(invoiceRecord.amountPaid)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>ยอดคงค้าง</CardDescription>
              <CardTitle
                className="ledger-figure text-2xl"
                data-ocid="invoice_detail.outstanding"
              >
                {formatTHB(invoiceRecord.outstanding)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>สถานะ</CardDescription>
              <CardTitle className="text-2xl">
                <StatusBadge status={invoiceRecord.status} />
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">รายการสินค้า</CardTitle>
              <CardDescription>
                {invoiceRecord.lines.length} รายการในใบแจ้งหนี้นี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border border-border">
                <Table data-ocid="invoice_detail.line_table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>รายการ</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead className="text-right">ราคาต่อหน่วย</TableHead>
                      <TableHead className="text-right">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceRecord.lines.map((line, index) => (
                      <TableRow
                        key={`${line.productId.toString()}-${index}`}
                        data-ocid={`invoice_detail.line_row.${index + 1}`}
                      >
                        <TableCell className="font-medium">
                          {line.productName}
                        </TableCell>
                        <TableCell className="ledger-figure text-right">
                          {Number(line.quantity)} {line.unit}
                        </TableCell>
                        <TableCell className="ledger-figure text-right">
                          {formatTHB(line.unitPrice)}
                        </TableCell>
                        <TableCell className="ledger-figure text-right">
                          {formatTHB(line.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                  <span className="ledger-figure text-foreground">
                    {formatTHB(invoiceRecord.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ชำระแล้ว</span>
                  <span className="ledger-figure text-foreground">
                    −{formatTHB(invoiceRecord.amountPaid)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span className="text-foreground">ยอดคงค้าง</span>
                  <span className="ledger-figure text-foreground">
                    {formatTHB(invoiceRecord.outstanding)}
                  </span>
                </div>
              </div>

              {invoiceRecord.notes ? (
                <p className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {invoiceRecord.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-base">การชำระเงินที่เชื่อมโยง</CardTitle>
                <CardDescription>
                  {detail.payments.length} รายการ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detail.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มีการชำระเงินสำหรับใบแจ้งหนี้นี้
                  </p>
                ) : (
                  <ul
                    className="divide-y divide-border"
                    data-ocid="invoice_detail.payment_list"
                  >
                    {detail.payments.map((payment, index) => (
                      <li
                        key={payment.id.toString()}
                        className="flex items-center justify-between gap-3 py-3"
                        data-ocid={`invoice_detail.payment_item.${index + 1}`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <Link
                            to="/manager/payments/$paymentId"
                            params={{ paymentId: payment.id.toString() }}
                            className="ledger-figure text-sm font-medium text-foreground transition-smooth hover:text-primary"
                          >
                            {formatTHB(payment.amount)}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {formatThaiDateTime(payment.paidAt)}
                          </p>
                        </div>
                        <StatusBadge status={payment.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-base">เอกสารสำหรับพิมพ์</CardTitle>
                <CardDescription>ข้อมูลหัวเอกสารและยอดเป็นตัวอักษร</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {document.isLoading ? (
                  <LoadingState rows={3} />
                ) : document.data ? (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        ผู้ออกเอกสาร
                      </p>
                      <p className="text-foreground">
                        {document.data.header.shopName}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        ยอดเป็นตัวอักษร
                      </p>
                      <p className="text-foreground">
                        {document.data.amountInWords}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={() => window.print()}
                      data-ocid="invoice_detail.print_document_button"
                    >
                      <Printer className="size-4" aria-hidden="true" />
                      พิมพ์เอกสาร
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    ไม่สามารถโหลดข้อมูลเอกสารได้
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>บันทึกการชำระเงิน</DialogTitle>
            <DialogDescription>
              บันทึกยอดที่รับชำระจริง ระบบจะปรับยอดคงค้างของใบแจ้งหนี้นี้
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            invoiceId={invoiceRecord.id}
            invoiceNumber={invoiceRecord.number}
            outstanding={invoiceRecord.outstanding}
            onSubmit={handlePayment}
            onCancel={() => setPaymentOpen(false)}
            isPending={recordPayment.isPending}
            errorMessage={
              recordPayment.isError
                ? "บันทึกการชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
