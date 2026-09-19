import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { BankInfoCard } from "@/components/customer/BankInfoCard";
import { ProofUploadForm } from "@/components/customer/ProofUploadForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMyInvoice } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Upload } from "lucide-react";

/** One invoice with its line items, totals, and the proof upload form. */
export function MyInvoiceDetailPage() {
  const { invoiceId } = useParams({ from: "/customer/invoices/$invoiceId" });
  const parsedId = /^\d+$/.test(invoiceId) ? BigInt(invoiceId) : null;
  const { data: invoice, isLoading } = useMyInvoice(parsedId);

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
          <Link to="/customer/invoices">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายการใบแจ้งหนี้
          </Link>
        </Button>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : !invoice ? (
          <EmptyState
            icon={FileText}
            title="ไม่พบใบแจ้งหนี้"
            description="ใบแจ้งหนี้นี้อาจถูกลบหรือไม่ได้เป็นของคุณ"
            action={
              <Button asChild data-ocid="customer.back_to_list_button">
                <Link to="/customer/invoices">กลับไปรายการใบแจ้งหนี้</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              title={`ใบแจ้งหนี้ ${invoice.number}`}
              description={`ออกเมื่อ ${formatThaiDate(invoice.issuedAt)} · ครบกำหนด ${formatThaiDate(invoice.dueAt)}`}
              actions={<StatusBadge status={invoice.status} />}
            />

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <Card data-ocid="customer.invoice_lines_card">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="text-base">รายการสินค้า</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">
                              รายการ
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                              จำนวน
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                              ราคาต่อหน่วย
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                              รวม
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {invoice.lines.map((line, index) => (
                            <tr
                              key={`${line.productId.toString()}-${index}`}
                              data-ocid={`customer.invoice_line.${index + 1}`}
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-foreground">
                                  {line.productName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  หน่วย: {line.unit}
                                </p>
                              </td>
                              <td className="ledger-figure px-4 py-3 text-right text-muted-foreground">
                                {line.quantity.toString()}
                              </td>
                              <td className="ledger-figure px-4 py-3 text-right text-muted-foreground">
                                {formatTHB(line.unitPrice)}
                              </td>
                              <td className="ledger-figure px-4 py-3 text-right font-medium text-foreground">
                                {formatTHB(line.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card data-ocid="customer.invoice_totals_card">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="text-base">สรุปยอดเงิน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                      <span className="ledger-figure text-foreground">
                        {formatTHB(invoice.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ยอดรวมทั้งสิ้น</span>
                      <span className="ledger-figure font-medium text-foreground">
                        {formatTHB(invoice.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ชำระแล้ว</span>
                      <span className="ledger-figure text-success">
                        {formatTHB(invoice.amountPaid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-base">
                      <span className="font-medium text-foreground">
                        ยอดคงค้าง
                      </span>
                      <span className="ledger-figure font-semibold text-foreground">
                        {formatTHB(invoice.outstanding)}
                      </span>
                    </div>
                    {invoice.notes ? (
                      <p className="border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
                        หมายเหตุ: {invoice.notes}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <BankInfoCard />
                <Card data-ocid="customer.proof_upload_card">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Upload
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      แจ้งชำระเงิน
                    </CardTitle>
                    <CardDescription>
                      แนบหลักฐานการโอนเพื่อให้ผู้จัดการร้านตรวจสอบ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {invoice.outstanding <= 0n ? (
                      <p className="text-sm text-muted-foreground">
                        ใบแจ้งหนี้นี้ชำระครบแล้ว ไม่ต้องแนบหลักฐานเพิ่มเติม
                      </p>
                    ) : (
                      <ProofUploadForm invoice={invoice} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
