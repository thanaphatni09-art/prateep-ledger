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
import { useMyDebt } from "@/hooks/use-backend";
import { agingBucketLabel, formatTHB, formatThaiDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ScrollText, Upload } from "lucide-react";

/** The signed-in customer's own outstanding balance with aging breakdown. */
export function MyDebtsPage() {
  const { data: debt, isLoading } = useMyDebt();

  const outstanding = debt?.outstandingBalance ?? 0n;
  const aging = (debt?.aging ?? []).filter((entry) => entry.amount > 0n);
  const unpaidInvoices = (debt?.invoices ?? []).filter(
    (invoice) => invoice.outstanding > 0n,
  );

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title="ยอดค้างชำระของฉัน"
          description="ยอดคงค้างทั้งหมดและอายุหนี้ที่แยกตามช่วงเวลาครบกำหนด"
          actions={
            outstanding > 0n ? (
              <Button
                asChild
                className="gap-2"
                data-ocid="customer.upload_link"
              >
                <Link to="/customer/proofs">
                  <Upload className="size-4" aria-hidden="true" />
                  แจ้งชำระเงิน
                </Link>
              </Button>
            ) : undefined
          }
        />

        {isLoading ? (
          <LoadingState rows={5} />
        ) : outstanding <= 0n ? (
          <EmptyState
            icon={CheckCircle2}
            title="ไม่มียอดค้างชำระ"
            description="บัญชีของคุณชำระครบทุกใบแจ้งหนี้แล้ว ขอบคุณที่ชำระตรงเวลา"
          />
        ) : (
          <>
            <Card
              className="bg-gradient-subtle"
              data-ocid="customer.debt_total_card"
            >
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ScrollText className="size-4" aria-hidden="true" />
                  ยอดค้างชำระทั้งหมด
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="ledger-figure text-3xl font-semibold text-foreground">
                  {formatTHB(outstanding)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  จาก {unpaidInvoices.length} ใบแจ้งหนี้ที่ยังค้างชำระ
                </p>
              </CardContent>
            </Card>

            <Card data-ocid="customer.aging_card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">อายุหนี้</CardTitle>
                <CardDescription>
                  ยอดค้างชำระแยกตามระยะเวลาที่เลยกำหนดชำระ
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {aging.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มียอดที่เลยกำหนดชำระ
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {aging.map((entry) => (
                      <li
                        key={entry.bucket}
                        className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
                        data-ocid="customer.aging_row"
                      >
                        <span className="text-sm text-muted-foreground">
                          {agingBucketLabel(entry.bucket)}
                        </span>
                        <span className="ledger-figure text-sm font-medium text-foreground">
                          {formatTHB(entry.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card data-ocid="customer.debt_invoices_card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">ใบแจ้งหนี้ที่ค้างชำระ</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          เลขที่
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          ครบกำหนด
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          คงค้าง
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {unpaidInvoices.map((invoice, index) => (
                        <tr
                          key={invoice.id.toString()}
                          className="transition-smooth hover:bg-muted/40"
                          data-ocid={`customer.debt_invoice_row.${index + 1}`}
                        >
                          <td className="px-4 py-3">
                            <Link
                              to="/customer/invoices/$invoiceId"
                              params={{ invoiceId: invoice.id.toString() }}
                              className="ledger-figure font-medium text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              data-ocid={`customer.debt_invoice_link.${index + 1}`}
                            >
                              {invoice.number}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatThaiDate(invoice.dueAt)}
                          </td>
                          <td className="ledger-figure px-4 py-3 text-right font-medium text-foreground">
                            {formatTHB(invoice.outstanding)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={invoice.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
