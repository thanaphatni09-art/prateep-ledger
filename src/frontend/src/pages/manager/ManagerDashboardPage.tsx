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
import { useDebtSummary, useInvoices, useProofs } from "@/hooks/use-backend";
import { useManagerNotifications } from "@/hooks/use-notifications";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { InvoiceStatus, ProofStatus } from "@/types/app";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  FileText,
  Plus,
  ScrollText,
  Wallet,
} from "lucide-react";

/** Manager overview: outstanding total, recent invoices, proofs, notifications. */
export function ManagerDashboardPage() {
  const debtSummary = useDebtSummary();
  const invoices = useInvoices();
  const proofs = useProofs({ status: ProofStatus.pending });
  const notifications = useManagerNotifications({ limit: 5n });

  const recentInvoices = (invoices.data ?? []).slice(0, 5);
  const pendingProofs = (proofs.data ?? []).slice(0, 4);
  const recentNotifications = notifications.data ?? [];

  const stats = [
    {
      label: "ยอดค้างชำระรวม",
      value: formatTHB(debtSummary.data?.totalOutstanding ?? 0n),
      hint: `${Number(debtSummary.data?.customerCount ?? 0n)} ลูกค้ามียอดค้าง`,
      icon: ScrollText,
      to: "/manager/debts",
    },
    {
      label: "ใบแจ้งหนี้ทั้งหมด",
      value: `${(invoices.data ?? []).length}`,
      hint: "รายการที่ออกแล้ว",
      icon: FileText,
      to: "/manager/invoices",
    },
    {
      label: "หลักฐานรอตรวจสอบ",
      value: `${pendingProofs.length}`,
      hint: "รอการอนุมัติหรือปฏิเสธ",
      icon: BadgeCheck,
      to: "/manager/proofs",
    },
    {
      label: "การแจ้งเตือนใหม่",
      value: `${recentNotifications.filter((item) => !item.read).length}`,
      hint: "ยังไม่ได้อ่าน",
      icon: Bell,
      to: "/manager/notifications",
    },
  ];

  return (
    <Layout area="manager">
      <div className="space-y-8" data-ocid="manager.dashboard.page">
        <PageHeader
          title="ภาพรวมร้านค้า"
          description="สรุปยอดค้างชำระ ใบแจ้งหนี้ล่าสุด และงานที่รอการตรวจสอบ"
          actions={
            <Button asChild className="gap-1.5">
              <Link
                to="/manager/invoices/new"
                data-ocid="dashboard.new_invoice_button"
              >
                <Plus className="size-4" aria-hidden="true" />
                ออกใบแจ้งหนี้
              </Link>
            </Button>
          }
        />

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          data-ocid="dashboard.stats_section"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.to}
                className="group rounded-lg border border-border bg-card p-4 shadow-subtle transition-smooth hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-ocid={`dashboard.stat_card.${stat.label}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  <Icon
                    className="size-4 text-muted-foreground transition-smooth group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="ledger-figure mt-3 text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.hint}
                </p>
              </Link>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-lg shadow-none">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base">ใบแจ้งหนี้ล่าสุด</CardTitle>
                <CardDescription>รายการที่ออกให้ลูกค้าล่าสุด</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link
                  to="/manager/invoices"
                  data-ocid="dashboard.view_invoices_link"
                >
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.isLoading ? (
                <LoadingState rows={4} />
              ) : recentInvoices.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="ยังไม่มีใบแจ้งหนี้"
                  description="เริ่มออกใบแจ้งหนี้ให้ลูกค้าเพื่อติดตามยอดค้างชำระ"
                  action={
                    <Button asChild size="sm">
                      <Link to="/manager/invoices/new">ออกใบแจ้งหนี้</Link>
                    </Button>
                  }
                />
              ) : (
                <ul
                  className="divide-y divide-border"
                  data-ocid="dashboard.invoice_list"
                >
                  {recentInvoices.map((invoice, index) => (
                    <li key={invoice.id.toString()}>
                      <Link
                        to="/manager/invoices/$invoiceId"
                        params={{ invoiceId: invoice.id.toString() }}
                        className="flex items-center justify-between gap-3 py-3 transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid={`dashboard.invoice_item.${index + 1}`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="ledger-figure truncate text-sm font-medium text-foreground">
                            {invoice.number}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {invoice.customerName} ·{" "}
                            {formatThaiDate(invoice.issuedAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="ledger-figure text-sm text-foreground">
                            {formatTHB(invoice.total)}
                          </span>
                          <StatusBadge status={invoice.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg shadow-none">
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">หลักฐานรอตรวจสอบ</CardTitle>
                  <CardDescription>ยอดโอนที่ลูกค้าแจ้งเข้ามา</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link
                    to="/manager/proofs"
                    data-ocid="dashboard.view_proofs_link"
                  >
                    ตรวจสอบ
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {proofs.isLoading ? (
                  <LoadingState rows={3} />
                ) : pendingProofs.length === 0 ? (
                  <EmptyState
                    icon={BadgeCheck}
                    title="ไม่มีหลักฐานค้างตรวจ"
                    description="เมื่อลูกค้าแนบหลักฐานการโอน รายการจะปรากฏที่นี่"
                  />
                ) : (
                  <ul
                    className="divide-y divide-border"
                    data-ocid="dashboard.proof_list"
                  >
                    {pendingProofs.map((proof, index) => (
                      <li
                        key={proof.id.toString()}
                        className="flex items-center justify-between gap-3 py-3"
                        data-ocid={`dashboard.proof_item.${index + 1}`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-sm font-medium text-foreground">
                            {proof.customerName}
                          </p>
                          <p className="ledger-figure truncate text-xs text-muted-foreground">
                            {proof.invoiceNumber}
                          </p>
                        </div>
                        <span className="ledger-figure shrink-0 text-sm text-foreground">
                          {formatTHB(proof.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-none">
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">การแจ้งเตือน</CardTitle>
                  <CardDescription>เหตุการณ์ล่าสุดในร้าน</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link
                    to="/manager/notifications"
                    data-ocid="dashboard.view_notifications_link"
                  >
                    ดูทั้งหมด
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {notifications.isLoading ? (
                  <LoadingState rows={3} />
                ) : recentNotifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="ยังไม่มีการแจ้งเตือน"
                    description="ความเคลื่อนไหวของร้านจะแสดงที่นี่"
                  />
                ) : (
                  <ul
                    className="divide-y divide-border"
                    data-ocid="dashboard.notification_list"
                  >
                    {recentNotifications.map((item, index) => (
                      <li
                        key={item.id.toString()}
                        className="flex items-start gap-3 py-3"
                        data-ocid={`dashboard.notification_item.${index + 1}`}
                      >
                        <span
                          className={
                            item.read
                              ? "mt-1.5 size-2 shrink-0 rounded-full bg-muted"
                              : "mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                          }
                          aria-hidden="true"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {item.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <section
          className="grid gap-4 sm:grid-cols-3"
          data-ocid="dashboard.quick_actions"
        >
          <Button
            asChild
            variant="outline"
            className="h-auto justify-start gap-3 py-3"
          >
            <Link to="/manager/customers" data-ocid="dashboard.customers_link">
              <Wallet className="size-4" aria-hidden="true" />
              จัดการลูกค้า
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto justify-start gap-3 py-3"
          >
            <Link to="/manager/products" data-ocid="dashboard.products_link">
              <FileText className="size-4" aria-hidden="true" />
              จัดการสินค้า
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto justify-start gap-3 py-3"
          >
            <Link to="/manager/settings" data-ocid="dashboard.settings_link">
              <ScrollText className="size-4" aria-hidden="true" />
              ตั้งค่าร้านและธนาคาร
            </Link>
          </Button>
        </section>
      </div>
    </Layout>
  );
}
