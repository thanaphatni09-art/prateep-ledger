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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerDebt, useDebtNoticeDocument } from "@/hooks/use-backend";
import { agingBucketLabel, formatTHB, formatThaiDate } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer, ScrollText } from "lucide-react";

/** One customer's debt detail with aging and the printable debt notice. */
export function DebtDetailPage() {
  const { customerId } = useParams({ from: "/manager/debts/$customerId" });
  const id = BigInt(customerId);
  const debt = useCustomerDebt(id);
  const notice = useDebtNoticeDocument(id);

  const detail = debt.data;

  if (debt.isLoading) {
    return (
      <Layout area="manager">
        <LoadingState rows={6} />
      </Layout>
    );
  }

  if (!detail) {
    return (
      <Layout area="manager">
        <EmptyState
          icon={ScrollText}
          title="ไม่พบข้อมูลลูกหนี้"
          description="ลูกค้ารายนี้อาจไม่มีอยู่ในระบบหรือไม่มียอดค้างชำระ"
          action={
            <Button asChild size="sm">
              <Link to="/manager/debts">กลับไปหน้าลูกหนี้คงค้าง</Link>
            </Button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="debt_detail.page">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/manager/debts" data-ocid="debt_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปหน้าลูกหนี้คงค้าง
          </Link>
        </Button>

        <PageHeader
          title={detail.customerName}
          description={`${detail.phone || "ไม่มีเบอร์โทร"} · ยอดค้างชำระรวม ${formatTHB(detail.outstandingBalance)}`}
          actions={
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => window.print()}
              data-ocid="debt_detail.print_button"
            >
              <Printer className="size-4" aria-hidden="true" />
              พิมพ์หนังสือทวงถาม
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">ใบแจ้งหนี้ที่ค้างชำระ</CardTitle>
              <CardDescription>
                {detail.invoices.length} รายการที่ยังมียอดคงค้าง
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detail.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ไม่มีใบแจ้งหนี้ที่ค้างชำระ
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border border-border">
                  <Table data-ocid="debt_detail.invoice_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>ครบกำหนด</TableHead>
                        <TableHead className="text-right">ยอดรวม</TableHead>
                        <TableHead className="text-right">คงค้าง</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.invoices.map((invoice, index) => (
                        <TableRow
                          key={invoice.id.toString()}
                          data-ocid={`debt_detail.invoice_row.${index + 1}`}
                        >
                          <TableCell className="ledger-figure font-medium">
                            <Link
                              to="/manager/invoices/$invoiceId"
                              params={{ invoiceId: invoice.id.toString() }}
                              className="transition-smooth hover:text-primary"
                            >
                              {invoice.number}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatThaiDate(invoice.dueAt)}
                          </TableCell>
                          <TableCell className="ledger-figure text-right">
                            {formatTHB(invoice.total)}
                          </TableCell>
                          <TableCell className="ledger-figure text-right">
                            {formatTHB(invoice.outstanding)}
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={invoice.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-base">อายุหนี้</CardTitle>
              </CardHeader>
              <CardContent>
                {detail.aging.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ไม่มียอดค้างชำระ</p>
                ) : (
                  <ul className="space-y-2" data-ocid="debt_detail.aging_list">
                    {detail.aging.map((bucket) => (
                      <li
                        key={bucket.bucket}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {agingBucketLabel(bucket.bucket)}
                        </span>
                        <span className="ledger-figure text-foreground">
                          {formatTHB(bucket.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-base">หนังสือทวงถาม</CardTitle>
                <CardDescription>ข้อมูลสำหรับจัดพิมพ์เอกสาร</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {notice.isLoading ? (
                  <LoadingState rows={3} />
                ) : notice.data ? (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        ยอดค้างเป็นตัวอักษร
                      </p>
                      <p className="text-foreground">
                        {notice.data.amountInWords}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">บัญชีรับโอน</p>
                      <p className="text-foreground">
                        {notice.data.bankName} · {notice.data.accountNumber}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={() => window.print()}
                      data-ocid="debt_detail.print_notice_button"
                    >
                      <Printer className="size-4" aria-hidden="true" />
                      พิมพ์หนังสือทวงถาม
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
    </Layout>
  );
}
