import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMyInvoices } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { InvoiceStatus } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_FILTERS: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: InvoiceStatus.unpaid, label: "ค้างชำระ" },
  { value: InvoiceStatus.partiallyPaid, label: "ชำระบางส่วน" },
  { value: InvoiceStatus.paid, label: "ชำระแล้ว" },
  { value: InvoiceStatus.overdue, label: "เกินกำหนด" },
];

/** The signed-in customer's own invoices, newest first. */
export function MyInvoicesPage() {
  const { data: invoices, isLoading } = useMyInvoices();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (invoices ?? []).filter((invoice) => {
      const matchesStatus = status === "all" || invoice.status === status;
      const matchesSearch =
        term === "" ||
        invoice.number.toLowerCase().includes(term) ||
        invoice.notes.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, status]);

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title="ใบแจ้งหนี้ของฉัน"
          description="รายการใบแจ้งหนี้ทั้งหมดที่ร้านออกให้คุณ พร้อมสถานะการชำระเงิน"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาเลขที่ใบแจ้งหนี้"
              className="pl-9"
              aria-label="ค้นหาใบแจ้งหนี้"
              data-ocid="customer.invoice_search_input"
            />
          </div>
          <fieldset
            className="flex flex-wrap gap-1.5"
            aria-label="กรองตามสถานะ"
            data-ocid="customer.invoice_filter"
          >
            <legend className="sr-only">กรองตามสถานะ</legend>
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={status === filter.value ? "default" : "outline"}
                onClick={() => setStatus(filter.value)}
                data-ocid={`customer.invoice_filter.${filter.value}`}
              >
                {filter.label}
              </Button>
            ))}
          </fieldset>
        </div>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              (invoices ?? []).length === 0
                ? "ยังไม่มีใบแจ้งหนี้"
                : "ไม่พบใบแจ้งหนี้ที่ตรงกับเงื่อนไข"
            }
            description={
              (invoices ?? []).length === 0
                ? "เมื่อร้านออกใบแจ้งหนี้ให้คุณ รายการจะแสดงที่นี่"
                : "ลองปรับคำค้นหาหรือตัวกรองสถานะอีกครั้ง"
            }
          />
        ) : (
          <Card data-ocid="customer.invoice_list">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">เลขที่</th>
                      <th className="px-4 py-3 text-left font-medium">
                        วันที่ออก
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        ครบกำหนด
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        ยอดรวม
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        คงค้าง
                      </th>
                      <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((invoice, index) => (
                      <tr
                        key={invoice.id.toString()}
                        className="transition-smooth hover:bg-muted/40"
                        data-ocid={`customer.invoice_row.${index + 1}`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            to="/customer/invoices/$invoiceId"
                            params={{ invoiceId: invoice.id.toString() }}
                            className="ledger-figure font-medium text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            data-ocid={`customer.invoice_link.${index + 1}`}
                          >
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatThaiDate(invoice.issuedAt)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatThaiDate(invoice.dueAt)}
                        </td>
                        <td className="ledger-figure px-4 py-3 text-right text-foreground">
                          {formatTHB(invoice.total)}
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
        )}
      </div>
    </Layout>
  );
}
