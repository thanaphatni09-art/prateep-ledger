import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyReceipts } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { PaymentMethod } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

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

/** The signed-in customer's own issued receipts. */
export function MyReceiptsPage() {
  const { data: receipts, isLoading } = useMyReceipts();

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title="ใบเสร็จของฉัน"
          description="ใบเสร็จที่ออกให้เมื่อการชำระเงินได้รับการอนุมัติแล้ว"
        />

        {isLoading ? (
          <LoadingState rows={6} />
        ) : (receipts ?? []).length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="ยังไม่มีใบเสร็จ"
            description="เมื่อการชำระเงินของคุณได้รับการอนุมัติ ใบเสร็จจะแสดงที่นี่"
          />
        ) : (
          <Card data-ocid="customer.receipt_list">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        เลขที่ใบเสร็จ
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        ใบแจ้งหนี้
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        วันที่ออก
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        วิธีชำระ
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        จำนวนเงิน
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(receipts ?? []).map((receipt, index) => (
                      <tr
                        key={receipt.id.toString()}
                        className="transition-smooth hover:bg-muted/40"
                        data-ocid={`customer.receipt_row.${index + 1}`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            to="/customer/receipts/$receiptId"
                            params={{ receiptId: receipt.id.toString() }}
                            className="ledger-figure font-medium text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            data-ocid={`customer.receipt_link.${index + 1}`}
                          >
                            {receipt.number}
                          </Link>
                        </td>
                        <td className="ledger-figure px-4 py-3 text-muted-foreground">
                          {receipt.invoiceNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatThaiDate(receipt.issuedAt)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {methodLabel(receipt.method)}
                        </td>
                        <td className="ledger-figure px-4 py-3 text-right font-medium text-foreground">
                          {formatTHB(receipt.amount)}
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
