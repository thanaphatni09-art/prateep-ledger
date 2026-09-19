import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
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
import { useDebtRows, useDebtSummary } from "@/hooks/use-backend";
import { agingBucketLabel, formatTHB, formatThaiDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

/** Debt ledger: every customer with an outstanding balance and aging buckets. */
export function DebtsPage() {
  const summary = useDebtSummary();
  const debts = useDebtRows();
  const rows = debts.data ?? [];

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="debts.page">
        <PageHeader
          title="ลูกหนี้คงค้าง"
          description="ยอดค้างชำระของลูกค้าทุกราย พร้อมช่วงอายุหนี้"
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-lg shadow-none sm:col-span-2 xl:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>ยอดค้างชำระรวมทั้งร้าน</CardDescription>
              <CardTitle
                className="ledger-figure text-2xl"
                data-ocid="debts.total_outstanding"
              >
                {formatTHB(summary.data?.totalOutstanding ?? 0n)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {Number(summary.data?.customerCount ?? 0n)} ลูกค้ามียอดค้าง
              </p>
            </CardContent>
          </Card>

          {(summary.data?.aging ?? [])
            .filter((bucket) => bucket.amount > 0n)
            .map((bucket) => (
              <Card
                key={bucket.bucket}
                className="rounded-lg shadow-none"
                data-ocid={`debts.aging_card.${bucket.bucket}`}
              >
                <CardHeader className="pb-2">
                  <CardDescription>
                    {agingBucketLabel(bucket.bucket)}
                  </CardDescription>
                  <CardTitle className="ledger-figure text-xl">
                    {formatTHB(bucket.amount)}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
        </section>

        {debts.isLoading ? (
          <LoadingState rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="ไม่มีลูกหนี้คงค้าง"
            description="เมื่อมีใบแจ้งหนี้ที่ยังไม่ชำระ ยอดค้างจะปรากฏที่นี่"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table data-ocid="debts.table">
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead className="text-right">จำนวนใบแจ้งหนี้</TableHead>
                  <TableHead>ครบกำหนดเก่าสุด</TableHead>
                  <TableHead className="text-right">ยอดค้างชำระ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.customerId.toString()}
                    data-ocid={`debts.row.${index + 1}`}
                  >
                    <TableCell className="font-medium">
                      <Link
                        to="/manager/debts/$customerId"
                        params={{ customerId: row.customerId.toString() }}
                        className="transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid={`debts.link.${index + 1}`}
                      >
                        {row.customerName}
                      </Link>
                    </TableCell>
                    <TableCell className="ledger-figure text-muted-foreground">
                      {row.phone || "—"}
                    </TableCell>
                    <TableCell className="ledger-figure text-right">
                      {Number(row.invoiceCount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.oldestDueAt !== undefined
                        ? formatThaiDate(row.oldestDueAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="ledger-figure text-right font-semibold">
                      {formatTHB(row.outstandingBalance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
