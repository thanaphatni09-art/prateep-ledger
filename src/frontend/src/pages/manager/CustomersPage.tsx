import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { CustomerForm } from "@/components/manager/CustomerForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateCustomer, useCustomers } from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import type { CustomerInput, CustomerUpdate } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "name" | "outstandingBalance" | "createdAt";

const SORT_LABELS: Record<SortKey, string> = {
  name: "ชื่อลูกค้า",
  outstandingBalance: "ยอดค้างชำระ",
  createdAt: "วันที่เปิดบัญชี",
};

/** Customer list with search, sortable columns, and account creation. */
export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [descending, setDescending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const filter = useMemo(
    () => ({ search: search.trim() || undefined, sortBy, descending }),
    [search, sortBy, descending],
  );
  const customers = useCustomers(filter);
  const createCustomer = useCreateCustomer();

  function toggleSort(key: SortKey) {
    if (key === sortBy) {
      setDescending((prev) => !prev);
      return;
    }
    setSortBy(key);
    setDescending(false);
  }

  function handleCreate(input: CustomerInput | CustomerUpdate) {
    createCustomer.mutate(input as CustomerInput, {
      onSuccess: () => setCreateOpen(false),
    });
  }

  const rows = customers.data ?? [];

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="customers.page">
        <PageHeader
          title="ลูกค้า"
          description="ค้นหา เปิดบัญชี และดูข้อมูลเครดิตของลูกค้าแต่ละราย"
          actions={
            <Button
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
              data-ocid="customers.create_button"
            >
              <Plus className="size-4" aria-hidden="true" />
              เปิดบัญชีลูกค้า
            </Button>
          }
        />

        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อหรือเบอร์โทรศัพท์"
            className="pl-9"
            aria-label="ค้นหาลูกค้า"
            data-ocid="customers.search_input"
          />
        </div>

        {customers.isLoading ? (
          <LoadingState rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "ไม่พบลูกค้าที่ตรงกับคำค้น" : "ยังไม่มีลูกค้า"}
            description={
              search
                ? "ลองค้นหาด้วยชื่อหรือเบอร์โทรศัพท์อื่น"
                : "เปิดบัญชีลูกค้ารายแรกเพื่อเริ่มออกใบแจ้งหนี้"
            }
            action={
              search ? undefined : (
                <Button
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  data-ocid="customers.empty_create_button"
                >
                  เปิดบัญชีลูกค้า
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table data-ocid="customers.table">
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <TableHead
                      key={key}
                      className={key === "name" ? "" : "text-right"}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-smooth hover:text-foreground"
                        data-ocid={`customers.sort_${key}_button`}
                      >
                        {SORT_LABELS[key]}
                        {sortBy === key ? (
                          descending ? (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          ) : (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          )
                        ) : null}
                      </button>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">เบอร์โทร</TableHead>
                  <TableHead className="text-right">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((customer, index) => (
                  <TableRow
                    key={customer.id.toString()}
                    data-ocid={`customers.row.${index + 1}`}
                  >
                    <TableCell className="font-medium">
                      <Link
                        to="/manager/customers/$customerId"
                        params={{ customerId: customer.id.toString() }}
                        className="transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid={`customers.link.${index + 1}`}
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="ledger-figure text-right">
                      {formatTHB(customer.outstandingBalance)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatThaiDate(customer.createdAt)}
                    </TableCell>
                    <TableCell className="ledger-figure text-right text-muted-foreground">
                      {customer.phone || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          customer.active
                            ? "text-xs font-medium text-success"
                            : "text-xs font-medium text-muted-foreground"
                        }
                      >
                        {customer.active ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>เปิดบัญชีลูกค้าใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลลูกค้าและวงเงินเครดิต จากนั้นผูกบัญชีเข้าสู่ระบบให้ลูกค้า
              ได้ที่หน้ารายละเอียดลูกค้า หรือให้ลูกค้าเข้าสู่ระบบแล้วกดยืนยันบัญชีของตนเอง
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isPending={createCustomer.isPending}
            errorMessage={
              createCustomer.isError
                ? "สร้างบัญชีลูกค้าไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่"
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
