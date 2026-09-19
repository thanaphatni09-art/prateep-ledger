import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { ProductForm } from "@/components/manager/ProductForm";
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
import { useCreateProduct, useProducts } from "@/hooks/use-backend";
import { formatTHB } from "@/lib/format";
import type { ProductInput, ProductUpdate } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { Package, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

const ALL_CATEGORIES = "__all__";

/** Product list with search, category filter, and creation. */
export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [createOpen, setCreateOpen] = useState(false);

  const allProducts = useProducts();
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const product of allProducts.data ?? []) {
      if (product.category) set.add(product.category);
    }
    return Array.from(set).sort();
  }, [allProducts.data]);

  const filter = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category === ALL_CATEGORIES ? undefined : category,
    }),
    [search, category],
  );
  const products = useProducts(filter);
  const createProduct = useCreateProduct();

  function handleCreate(input: ProductInput | ProductUpdate) {
    createProduct.mutate(input as ProductInput, {
      onSuccess: () => setCreateOpen(false),
    });
  }

  const rows = products.data ?? [];

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="products.page">
        <PageHeader
          title="สินค้า"
          description="จัดการรายการสินค้า ราคาต่อหน่วย และสถานะการขาย"
          actions={
            <Button
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
              data-ocid="products.create_button"
            >
              <Plus className="size-4" aria-hidden="true" />
              เพิ่มสินค้า
            </Button>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อหรือรหัสสินค้า"
              className="pl-9"
              aria-label="ค้นหาสินค้า"
              data-ocid="products.search_input"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              className="sm:w-56"
              aria-label="กรองตามหมวดหมู่"
              data-ocid="products.category_select"
            >
              <SelectValue placeholder="ทุกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>ทุกหมวดหมู่</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {products.isLoading ? (
          <LoadingState rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              search || category !== ALL_CATEGORIES
                ? "ไม่พบสินค้าที่ตรงกับเงื่อนไข"
                : "ยังไม่มีสินค้า"
            }
            description={
              search || category !== ALL_CATEGORIES
                ? "ลองปรับคำค้นหรือเลือกหมวดหมู่อื่น"
                : "เพิ่มสินค้ารายการแรกเพื่อเริ่มออกใบแจ้งหนี้"
            }
            action={
              search || category !== ALL_CATEGORIES ? undefined : (
                <Button
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  data-ocid="products.empty_create_button"
                >
                  เพิ่มสินค้า
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table data-ocid="products.table">
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>รหัส</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead className="text-right">ราคาต่อหน่วย</TableHead>
                  <TableHead className="text-right">หน่วย</TableHead>
                  <TableHead className="text-right">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((product, index) => (
                  <TableRow
                    key={product.id.toString()}
                    data-ocid={`products.row.${index + 1}`}
                  >
                    <TableCell className="font-medium">
                      <Link
                        to="/manager/products/$productId"
                        params={{ productId: product.id.toString() }}
                        className="transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-ocid={`products.link.${index + 1}`}
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="ledger-figure text-muted-foreground">
                      {product.sku || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category || "—"}
                    </TableCell>
                    <TableCell className="ledger-figure text-right">
                      {formatTHB(product.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.unit || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          product.active
                            ? "text-xs font-medium text-success"
                            : "text-xs font-medium text-muted-foreground"
                        }
                      >
                        {product.active ? "เปิดขาย" : "ปิดขาย"}
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
            <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
            <DialogDescription>
              ระบุชื่อสินค้า ราคาต่อหน่วยเป็นบาท และหมวดหมู่เพื่อใช้ในการออกใบแจ้งหนี้
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isPending={createProduct.isPending}
            errorMessage={
              createProduct.isError
                ? "เพิ่มสินค้าไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่"
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
