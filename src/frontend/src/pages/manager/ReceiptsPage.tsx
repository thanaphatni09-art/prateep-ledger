import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayments } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { PaymentMethod, PaymentStatus } from "@/types/app";
import { Receipt } from "lucide-react";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: "เงินสด",
  [PaymentMethod.bankTransfer]: "โอนผ่านธนาคาร",
  [PaymentMethod.other]: "อื่น ๆ",
};

/**
 * Receipt register. Receipts are issued automatically when a payment is
 * recorded, so this view lists the confirmed payments that produced them.
 * The backend exposes no manager-scoped receipt list, so the register is
 * derived from the manager payment ledger.
 */
export function ReceiptsPage() {
  const payments = usePayments();
  const rows = (payments.data ?? []).filter(
    (payment) => payment.status === PaymentStatus.approved,
  );

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="receipts.page">
        <PageHeader
          title="ใบเสร็จรับเงิน"
          description="รายการใบเสร็จที่ออกให้ลูกค้าแล้ว พร้อมเลขที่และยอดรับชำระ"
        />

        {payments.isLoading ? (
          <LoadingState rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="ยังไม่มีใบเสร็จรับเงิน"
            description="ใบเสร็จจะถูกออกโดยอัตโนมัติเมื่อบันทึกการชำระเงินให้ลูกค้า"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table data-ocid="receipts.table">
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>เลขที่อ้างอิง</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ใบแจ้งหนี้</TableHead>
                  <TableHead>วันที่รับชำระ</TableHead>
                  <TableHead>ช่องทาง</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((payment, index) => (
                  <TableRow
                    key={payment.id.toString()}
                    data-ocid={`receipts.row.${index + 1}`}
                  >
                    <TableCell className="ledger-figure font-medium">
                      {payment.reference || `#${payment.id.toString()}`}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {payment.customerName}
                    </TableCell>
                    <TableCell className="ledger-figure text-muted-foreground">
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatThaiDate(payment.paidAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {METHOD_LABELS[payment.method]}
                    </TableCell>
                    <TableCell className="ledger-figure text-right">
                      {formatTHB(payment.amount)}
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
