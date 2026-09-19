import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { ProductForm } from "@/components/manager/ProductForm";
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
import { Separator } from "@/components/ui/separator";
import {
  useDeactivateProduct,
  useProduct,
  useUpdateProduct,
} from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import type { ProductInput, ProductUpdate } from "@/types/app";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, Pencil, Power } from "lucide-react";
import { useState } from "react";

/** Product detail and edit view. */
export function ProductDetailPage() {
  const { productId } = useParams({ from: "/manager/products/$productId" });
  const id = BigInt(productId);
  const [editOpen, setEditOpen] = useState(false);

  const product = useProduct(id);
  const updateProduct = useUpdateProduct();
  const deactivateProduct = useDeactivateProduct();

  const record = product.data;

  function handleUpdate(input: ProductInput | ProductUpdate) {
    updateProduct.mutate(
      { id, input: input as ProductUpdate },
      { onSuccess: () => setEditOpen(false) },
    );
  }

  if (product.isLoading) {
    return (
      <Layout area="manager">
        <LoadingState rows={6} />
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout area="manager">
        <EmptyState
          icon={Package}
          title="ไม่พบสินค้า"
          description="สินค้ารายการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ"
          action={
            <Button asChild size="sm">
              <Link to="/manager/products">กลับไปหน้ารายการสินค้า</Link>
            </Button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="product_detail.page">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/manager/products" data-ocid="product_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            กลับไปรายการสินค้า
          </Link>
        </Button>

        <PageHeader
          title={record.name}
          description={`รหัสสินค้า ${record.sku || "—"} · เพิ่มเมื่อ ${formatThaiDate(record.createdAt)}`}
          actions={
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => setEditOpen(true)}
                data-ocid="product_detail.edit_button"
              >
                <Pencil className="size-4" aria-hidden="true" />
                แก้ไขสินค้า
              </Button>
              {record.active ? (
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => deactivateProduct.mutate(id)}
                  disabled={deactivateProduct.isPending}
                  data-ocid="product_detail.deactivate_button"
                >
                  <Power className="size-4" aria-hidden="true" />
                  ปิดการขาย
                </Button>
              ) : null}
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">รายละเอียดสินค้า</CardTitle>
              <CardDescription>ข้อมูลที่ใช้เมื่อเพิ่มสินค้านี้ลงในใบแจ้งหนี้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">ชื่อสินค้า</p>
                  <p className="text-foreground">{record.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">รหัสสินค้า</p>
                  <p className="ledger-figure text-foreground">
                    {record.sku || "—"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">หมวดหมู่</p>
                  <p className="text-foreground">{record.category || "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">หน่วยนับ</p>
                  <p className="text-foreground">{record.unit || "—"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  ราคาต่อหน่วย
                </span>
                <span
                  className="ledger-figure text-lg font-semibold text-foreground"
                  data-ocid="product_detail.unit_price"
                >
                  {formatTHB(record.unitPrice)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">สถานะการขาย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">สถานะ</span>
                <span
                  className={
                    record.active
                      ? "text-xs font-medium text-success"
                      : "text-xs font-medium text-muted-foreground"
                  }
                  data-ocid="product_detail.status"
                >
                  {record.active ? "เปิดขาย" : "ปิดขาย"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                การปิดการขายจะไม่ลบประวัติใบแจ้งหนี้เดิม สินค้ายังคงปรากฏในเอกสารที่ออกไปแล้ว
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
            <DialogDescription>
              ปรับปรุงชื่อ ราคาต่อหน่วย หมวดหมู่ และสถานะการขาย
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={record}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            isPending={updateProduct.isPending}
            errorMessage={
              updateProduct.isError
                ? "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
