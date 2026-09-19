import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoices } from "@/hooks/use-backend";
import {
  dateToTimestamp,
  formatTHB,
  formatThaiDate,
  fromDateInputValue,
} from "@/lib/format";
import { type InvoiceQuery, InvoiceStatus } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { FileText, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

const ALL_STATUSES = "__all__";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.unpaid]: "ค้างชำระ",
  [InvoiceStatus.partiallyPaid]: "ชำระบางส่วน",
  [InvoiceStatus.paid]: "ชำระแล้ว",
  [InvoiceStatus.overdue]: "เกินกำหนด",
};

/** Invoice list with search, status filter, and date range. */
export function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL_STATUSES);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filter = useMemo<InvoiceQuery>(() => {
    const from = fromDate ? fromDateInputValue(fromDate) : null;
    const to = toDate ? fromDateInputValue(toDate) : null;
    return {
      search: search.trim() || undefined,
      status: status === ALL_STATUSES ? undefined : (status as InvoiceStatus),
      fromDate: from ? dateToTimestamp(from) : undefined,
      toDate: to ? dateToTimestamp(to) : undefined,
    };
  }, [search, status, fromDate, toDate]);

  const invoices = useInvoices(filter);
  const rows = invoices.data ?? [];
  const hasFilters =
    search.trim() !== "" ||
    status !== ALL_STATUSES ||
    fromDate !== "" ||
    toDate !== "";

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="invoices.page">
        <PageHeader
          title="ใบแจ้งหนี้"
          description="ค้นหา กรองตามสถานะและช่วงวันที่ และเปิดดูรายละเอียดแต่ละใบ"
          actions={
            <Button asChild className="gap-1.5">
              <Link
                to="/manager/invoices/new"
                data-ocid="invoices.create_button"
              >
                <Plus className="size-4" aria-hidden="true" />
                ออกใบแจ้งหนี้
              </Link>
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาเลขที่หรือชื่อลูกค้า"
              className="pl-9"
              aria-label="ค้นหาใบแจ้งหนี้"
              data-ocid="invoices.search_input"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              aria-label="กรองตามสถานะ"
              data-ocid="invoices.status_select"
            >
              <SelectValue placeholder="ทุกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>ทุกสถานะ</SelectItem>
              {Object.values(InvoiceStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <Label htmlFor="invoices-from" className="text-xs">
              ตั้งแต่วันที่
            </Label>
            <Input
              id="invoices-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              data-ocid="invoices.from_date_input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="invoices-to" className="text-xs">
              ถึงวันที่
            </Label>
            <Input
              id="invoices-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              data-ocid="invoices.to_date_input"
            />
          </div>
        </div>

        {invoices.isLoading ? (
          <LoadingState rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasFilters ? "ไม่พบใบแจ้งหนี้ที่ตรงกับเงื่อนไข" : "ยังไม่มีใบแจ้งหนี้"}
            description={
              hasFilters
                ? "ลองปรับคำค้น สถานะ หรือช่วงวันที่"
                : "ออกใบแจ้งหนี้ให้ลูกค้าเพื่อเริ่มติดตามยอดค้างชำระ"
            }
            action={
              hasFilters ? undefined : (
                <Button asChild size="sm">
                  <Link to="/manager/invoices/new">ออกใบแจ้งหนี้</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table data-ocid="invoices.table">
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>วันที่ออก</TableHead>
                  <TableHead>ครบกำหนด</TableHead>
                  <TableHead className="text-right">ยอดรวม</TableHead>
                  <TableHead className="text-right">คงค้าง</TableHead>
                  <TableHead className="text-right">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((invoice, index) => (
                  <TableRow
                    key={invoice.id.toString()}
                    data-ocid={`invoices.row.${index + 1}`}
                  >
                    <TableCell className="ledger-figure font-medium">
                      <Link
                        to="/manager/invoices/$invoiceId"
                        params={{ invoiceId: invoice.id.toString() }}
                        className="transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid={`invoices.link.${index + 1}`}
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {invoice.customerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatThaiDate(invoice.issuedAt)}
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
      </div>
    </Layout>
  );
}
