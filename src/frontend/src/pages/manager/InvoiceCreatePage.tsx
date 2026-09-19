import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { InvoiceForm } from "@/components/manager/InvoiceForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateInvoice,
  useCustomers,
  useProducts,
  useSettings,
} from "@/hooks/use-backend";
import type { InvoiceInput } from "@/types/app";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";

/** Dedicated page for composing a new invoice. */
export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const customers = useCustomers({ sortBy: "name" });
  const products = useProducts({ activeOnly: true });
  const settings = useSettings();
  const createInvoice = useCreateInvoice();

  const termsDays = Number(settings.data?.defaultPaymentTermsDays ?? 30n);

  function handleSubmit(input: InvoiceInput) {
    createInvoice.mutate(input, {
      onSuccess: (invoice) => {
        void navigate({
          to: "/manager/invoices/$invoiceId",
          params: { invoiceId: invoice.id.toString() },
        });
      },
    });
  }

  const isLoading = customers.isLoading || products.isLoading;

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="invoice_create.page">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/manager/invoices" data-ocid="invoice_create.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายการใบแจ้งหนี้
          </Link>
        </Button>

        <PageHeader
          title="ออกใบแจ้งหนี้ใหม่"
          description="เลือกลูกค้า เพิ่มรายการสินค้า และกำหนดวันครบกำหนดชำระ"
        />

        {isLoading ? (
          <LoadingState rows={6} />
        ) : (customers.data ?? []).length === 0 ? (
          <EmptyState
            icon={FileText}
            title="ยังไม่มีลูกค้าในระบบ"
            description="เปิดบัญชีลูกค้าก่อนจึงจะออกใบแจ้งหนี้ได้"
            action={
              <Button asChild size="sm">
                <Link to="/manager/customers">ไปหน้าลูกค้า</Link>
              </Button>
            }
          />
        ) : (
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">รายละเอียดใบแจ้งหนี้</CardTitle>
              <CardDescription>
                ยอดรวมคำนวณจากราคาต่อหน่วยของสินค้าคูณจำนวน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceForm
                customers={customers.data ?? []}
                products={products.data ?? []}
                defaultTermsDays={termsDays}
                onSubmit={handleSubmit}
                onCancel={() => void navigate({ to: "/manager/invoices" })}
                isPending={createInvoice.isPending}
                errorMessage={
                  createInvoice.isError
                    ? "ออกใบแจ้งหนี้ไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่"
                    : undefined
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
