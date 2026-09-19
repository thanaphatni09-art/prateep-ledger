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
import { useMyInvoices } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

/** Pick an unpaid invoice and attach a bank-transfer proof to it. */
export function MyProofsPage() {
  const { data: invoices, isLoading } = useMyInvoices();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unpaid = useMemo(
    () => (invoices ?? []).filter((invoice) => invoice.outstanding > 0n),
    [invoices],
  );

  const selected =
    unpaid.find((invoice) => invoice.id.toString() === selectedId) ??
    unpaid[0] ??
    null;

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title="แจ้งชำระเงิน"
          description="เลือกใบแจ้งหนี้ที่ต้องการชำระ แล้วแนบหลักฐานการโอนเงินให้ผู้จัดการร้านตรวจสอบ"
        />

        {isLoading ? (
          <LoadingState rows={5} />
        ) : unpaid.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="ไม่มียอดค้างชำระ"
            description="ทุกใบแจ้งหนี้ของคุณชำระครบแล้ว จึงยังไม่ต้องแจ้งชำระเงินเพิ่มเติม"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-6">
              <Card data-ocid="customer.unpaid_invoices_card">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">ใบแจ้งหนี้ที่ต้องชำระ</CardTitle>
                  <CardDescription>เลือกหนึ่งใบเพื่อแนบหลักฐานการโอน</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {unpaid.map((invoice, index) => {
                      const isSelected = selected?.id === invoice.id;
                      return (
                        <li key={invoice.id.toString()}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(invoice.id.toString())}
                            aria-pressed={isSelected}
                            className={cn(
                              "flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isSelected
                                ? "bg-primary/10"
                                : "hover:bg-muted/40",
                            )}
                            data-ocid={`customer.unpaid_invoice.${index + 1}`}
                          >
                            <div className="min-w-0">
                              <p className="ledger-figure truncate text-sm font-medium text-foreground">
                                {invoice.number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ครบกำหนด {formatThaiDate(invoice.dueAt)}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span className="ledger-figure text-sm font-medium text-foreground">
                                {formatTHB(invoice.outstanding)}
                              </span>
                              <StatusBadge status={invoice.status} />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              <BankInfoCard />
            </div>

            <Card data-ocid="customer.proof_upload_card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="size-4 text-primary" aria-hidden="true" />
                  แนบหลักฐานการโอน
                </CardTitle>
                <CardDescription>
                  {selected
                    ? `สำหรับใบแจ้งหนี้ ${selected.number} · ยอดคงค้าง ${formatTHB(selected.outstanding)}`
                    : "เลือกใบแจ้งหนี้ก่อนแนบหลักฐาน"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {selected ? (
                  <ProofUploadForm
                    key={selected.id.toString()}
                    invoice={selected}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    กรุณาเลือกใบแจ้งหนี้จากรายการด้านซ้าย
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
