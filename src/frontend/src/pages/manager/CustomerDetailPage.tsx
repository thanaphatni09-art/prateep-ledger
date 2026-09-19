import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { CustomerForm } from "@/components/manager/CustomerForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBindCustomerLogin,
  useCustomer,
  useInvoices,
  usePayments,
  useProofs,
  useUpdateCustomer,
} from "@/hooks/use-backend";
import {
  agingBucketLabel,
  formatTHB,
  formatThaiDate,
  formatThaiDateTime,
} from "@/lib/format";
import type { CustomerInput, CustomerUpdate } from "@/types/app";
import { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  Pencil,
  ScrollText,
  Wallet,
} from "lucide-react";
import { type FormEvent, useState } from "react";

/** Manager form: paste a customer's Internet Identity principal to bind it. */
function BindLoginForm({
  customerId,
  onBound,
}: {
  customerId: bigint;
  onBound: () => void;
}) {
  const [principalText, setPrincipalText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const bindLogin = useBindCustomerLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = principalText.trim();
    if (trimmed === "") {
      setInputError("กรุณาวาง Principal ของลูกค้า");
      return;
    }
    let principal: Principal;
    try {
      principal = Principal.fromText(trimmed);
    } catch {
      setInputError("รูปแบบ Principal ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      return;
    }
    setInputError(null);
    bindLogin.mutate(
      { id: customerId, principal },
      {
        onSuccess: (result) => {
          if (result === null) {
            setInputError("ไม่พบลูกค้ารายนี้ในระบบ");
            return;
          }
          setPrincipalText("");
          onBound();
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      data-ocid="customer_detail.bind_login_form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="customer-login-principal">
          Principal ของลูกค้า (Internet Identity)
        </Label>
        <Input
          id="customer-login-principal"
          value={principalText}
          onChange={(event) => setPrincipalText(event.target.value)}
          placeholder="เช่น 2vxsx-fae"
          autoComplete="off"
          spellCheck={false}
          className="font-mono text-xs"
          aria-invalid={inputError ? true : undefined}
          aria-describedby={
            inputError ? "customer-login-principal-error" : undefined
          }
          data-ocid="customer_detail.principal_input"
        />
        <p className="text-xs text-muted-foreground">
          ให้ลูกค้าเข้าสู่ระบบด้วย Internet Identity แล้วคัดลอก Principal
          จากหน้าบัญชีของตนมาวางที่นี่
        </p>
      </div>

      {inputError ? (
        <p
          id="customer-login-principal-error"
          className="text-xs text-destructive"
          data-ocid="customer_detail.bind_login_error"
        >
          {inputError}
        </p>
      ) : null}

      {bindLogin.isError ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          data-ocid="customer_detail.bind_login_request_error"
        >
          ผูกบัญชีเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      ) : null}

      <Button
        type="submit"
        size="sm"
        className="gap-1.5"
        disabled={bindLogin.isPending}
        data-ocid="customer_detail.bind_login_button"
      >
        {bindLogin.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
        ผูกบัญชีเข้าสู่ระบบ
      </Button>
    </form>
  );
}

/** Customer detail: balance, invoices, payments, and uploaded proofs. */
export function CustomerDetailPage() {
  const { customerId } = useParams({ from: "/manager/customers/$customerId" });
  const id = BigInt(customerId);
  const [editOpen, setEditOpen] = useState(false);
  const [bindOpen, setBindOpen] = useState(false);
  const [bindSuccess, setBindSuccess] = useState(false);

  const customer = useCustomer(id);
  const invoices = useInvoices({ customerId: id });
  const payments = usePayments({ customerId: id });
  const proofs = useProofs({ customerId: id });
  const updateCustomer = useUpdateCustomer();

  const detail = customer.data;
  const record = detail?.customer;

  function handleUpdate(input: CustomerInput | CustomerUpdate) {
    updateCustomer.mutate(
      { id, input: input as CustomerUpdate },
      { onSuccess: () => setEditOpen(false) },
    );
  }

  if (customer.isLoading) {
    return (
      <Layout area="manager">
        <LoadingState rows={8} />
      </Layout>
    );
  }

  if (!detail || !record) {
    return (
      <Layout area="manager">
        <EmptyState
          icon={ScrollText}
          title="ไม่พบข้อมูลลูกค้า"
          description="ลูกค้ารายนี้อาจถูกลบหรือไม่มีอยู่ในระบบ"
          action={
            <Button asChild size="sm">
              <Link to="/manager/customers">กลับไปหน้ารายชื่อลูกค้า</Link>
            </Button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="customer_detail.page">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/manager/customers" data-ocid="customer_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายชื่อลูกค้า
          </Link>
        </Button>

        <PageHeader
          title={record.name}
          description={`เปิดบัญชีเมื่อ ${formatThaiDate(record.createdAt)} · ${record.phone || "ไม่มีเบอร์โทร"}`}
          actions={
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => setEditOpen(true)}
                data-ocid="customer_detail.edit_button"
              >
                <Pencil className="size-4" aria-hidden="true" />
                แก้ไขข้อมูล
              </Button>
              <Button asChild className="gap-1.5">
                <Link
                  to="/manager/invoices/new"
                  data-ocid="customer_detail.new_invoice_button"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  ออกใบแจ้งหนี้
                </Link>
              </Button>
            </>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>ยอดค้างชำระ</CardDescription>
              <CardTitle
                className="ledger-figure text-2xl"
                data-ocid="customer_detail.outstanding"
              >
                {formatTHB(detail.outstandingBalance)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>วงเงินเครดิต</CardDescription>
              <CardTitle className="ledger-figure text-2xl">
                {formatTHB(record.creditLimit)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>จำนวนใบแจ้งหนี้</CardDescription>
              <CardTitle className="ledger-figure text-2xl">
                {Number(detail.invoiceCount)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>จำนวนการชำระเงิน</CardDescription>
              <CardTitle className="ledger-figure text-2xl">
                {Number(detail.paymentCount)}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          <Tabs defaultValue="invoices" data-ocid="customer_detail.tabs">
            <TabsList>
              <TabsTrigger
                value="invoices"
                data-ocid="customer_detail.invoices_tab"
              >
                ใบแจ้งหนี้
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                data-ocid="customer_detail.payments_tab"
              >
                การชำระเงิน
              </TabsTrigger>
              <TabsTrigger
                value="proofs"
                data-ocid="customer_detail.proofs_tab"
              >
                หลักฐานการโอน
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="mt-4">
              {invoices.isLoading ? (
                <LoadingState rows={4} />
              ) : (invoices.data ?? []).length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="ยังไม่มีใบแจ้งหนี้"
                  description="ออกใบแจ้งหนี้ให้ลูกค้ารายนี้เพื่อเริ่มติดตามยอด"
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <Table data-ocid="customer_detail.invoice_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>วันที่ออก</TableHead>
                        <TableHead className="text-right">ยอดรวม</TableHead>
                        <TableHead className="text-right">คงค้าง</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(invoices.data ?? []).map((invoice, index) => (
                        <TableRow
                          key={invoice.id.toString()}
                          data-ocid={`customer_detail.invoice_row.${index + 1}`}
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
                            {formatThaiDate(invoice.issuedAt)}
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
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              {payments.isLoading ? (
                <LoadingState rows={4} />
              ) : (payments.data ?? []).length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="ยังไม่มีการชำระเงิน"
                  description="บันทึกการชำระเงินจากใบแจ้งหนี้เพื่อให้รายการปรากฏที่นี่"
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <Table data-ocid="customer_detail.payment_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>ใบแจ้งหนี้</TableHead>
                        <TableHead className="text-right">จำนวน</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payments.data ?? []).map((payment, index) => (
                        <TableRow
                          key={payment.id.toString()}
                          data-ocid={`customer_detail.payment_row.${index + 1}`}
                        >
                          <TableCell className="text-muted-foreground">
                            {formatThaiDate(payment.paidAt)}
                          </TableCell>
                          <TableCell className="ledger-figure">
                            <Link
                              to="/manager/payments/$paymentId"
                              params={{ paymentId: payment.id.toString() }}
                              className="transition-smooth hover:text-primary"
                            >
                              {payment.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell className="ledger-figure text-right">
                            {formatTHB(payment.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={payment.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="proofs" className="mt-4">
              {proofs.isLoading ? (
                <LoadingState rows={4} />
              ) : (proofs.data ?? []).length === 0 ? (
                <EmptyState
                  icon={BadgeCheck}
                  title="ยังไม่มีหลักฐานการโอน"
                  description="เมื่อลูกค้าแนบหลักฐานการโอน รายการจะปรากฏที่นี่"
                />
              ) : (
                <ul
                  className="divide-y divide-border rounded-lg border border-border bg-card"
                  data-ocid="customer_detail.proof_list"
                >
                  {(proofs.data ?? []).map((proof, index) => (
                    <li
                      key={proof.id.toString()}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                      data-ocid={`customer_detail.proof_item.${index + 1}`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="ledger-figure truncate text-sm font-medium text-foreground">
                          {proof.invoiceNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          อัปโหลด {formatThaiDateTime(proof.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="ledger-figure text-sm text-foreground">
                          {formatTHB(proof.amount)}
                        </span>
                        <StatusBadge status={proof.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-6">
            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-base">ข้อมูลลูกค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">ที่อยู่</p>
                  <p className="text-foreground">{record.address || "—"}</p>
                </div>
                <Separator />
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">บันทึก</p>
                  <p className="text-foreground">{record.notes || "—"}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    สถานะบัญชี
                  </span>
                  <span
                    className={
                      record.active
                        ? "text-xs font-medium text-success"
                        : "text-xs font-medium text-muted-foreground"
                    }
                  >
                    {record.active ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    บัญชีเข้าสู่ระบบ
                  </span>
                  <span
                    className={
                      record.loginPrincipal
                        ? "text-xs font-medium text-success"
                        : "text-xs font-medium text-muted-foreground"
                    }
                    data-ocid="customer_detail.login_status"
                  >
                    {record.loginPrincipal ? "ผูกแล้ว" : "ยังไม่ผูก"}
                  </span>
                </div>
                {record.loginPrincipal ? (
                  <p
                    className="break-all font-mono text-[0.68rem] text-muted-foreground"
                    data-ocid="customer_detail.login_principal"
                  >
                    {record.loginPrincipal.toText()}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bindSuccess ? (
                      <output
                        className="flex items-center gap-1.5 text-xs font-medium text-success"
                        data-ocid="customer_detail.bind_login_success"
                      >
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        ผูกบัญชีเข้าสู่ระบบเรียบร้อยแล้ว
                      </output>
                    ) : null}
                    {bindOpen ? (
                      <BindLoginForm
                        customerId={id}
                        onBound={() => {
                          setBindOpen(false);
                          setBindSuccess(true);
                        }}
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => {
                          setBindSuccess(false);
                          setBindOpen(true);
                        }}
                        data-ocid="customer_detail.bind_login_open_button"
                      >
                        <Link2 className="size-4" aria-hidden="true" />
                        ผูกบัญชีเข้าสู่ระบบ
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-base">อายุหนี้คงค้าง</CardTitle>
                <CardDescription>แยกตามช่วงเวลาที่ค้างชำระ</CardDescription>
              </CardHeader>
              <CardContent>
                {detail.aging.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ไม่มียอดค้างชำระ</p>
                ) : (
                  <ul
                    className="space-y-2"
                    data-ocid="customer_detail.aging_list"
                  >
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
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลลูกค้า</DialogTitle>
            <DialogDescription>
              ปรับปรุงข้อมูลติดต่อ วงเงินเครดิต และสถานะบัญชีของลูกค้ารายนี้
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={record}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            isPending={updateCustomer.isPending}
            errorMessage={
              updateCustomer.isError
                ? "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
