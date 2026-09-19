import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatSatang, parseBahtToSatang } from "@/lib/format";
import type { Product, ProductInput, ProductUpdate } from "@/types/app";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (input: ProductInput | ProductUpdate) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
}

interface DraftState {
  name: string;
  sku: string;
  unit: string;
  unitPrice: string;
  category: string;
  active: boolean;
}

function initialDraft(product?: Product | null): DraftState {
  return {
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    unit: product?.unit ?? "ชิ้น",
    unitPrice: product ? formatSatang(product.unitPrice) : "0.00",
    category: product?.category ?? "",
    active: product?.active ?? true,
  };
}

/** Create/edit form for a product and its unit price in THB. */
export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: ProductFormProps) {
  const [draft, setDraft] = useState<DraftState>(() => initialDraft(product));
  const [priceError, setPriceError] = useState<string | null>(null);

  const isEditing = Boolean(product);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const unitPrice = parseBahtToSatang(draft.unitPrice);
    if (unitPrice === null) {
      setPriceError("กรุณากรอกราคาต่อหน่วยเป็นตัวเลข เช่น 120.00");
      return;
    }
    setPriceError(null);
    const base = {
      name: draft.name.trim(),
      sku: draft.sku.trim(),
      unit: draft.unit.trim(),
      unitPrice,
      category: draft.category.trim(),
    };
    onSubmit(isEditing ? { ...base, active: draft.active } : base);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="product.form"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="product-name">ชื่อสินค้า</Label>
          <Input
            id="product-name"
            value={draft.name}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="เช่น ปูนซีเมนต์ ตราเสือ 50 กก."
            required
            data-ocid="product.name_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-sku">รหัสสินค้า (SKU)</Label>
          <Input
            id="product-sku"
            value={draft.sku}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, sku: event.target.value }))
            }
            placeholder="เช่น CEM-50"
            className="ledger-figure"
            data-ocid="product.sku_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-category">หมวดหมู่</Label>
          <Input
            id="product-category"
            value={draft.category}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, category: event.target.value }))
            }
            placeholder="เช่น วัสดุก่อสร้าง"
            data-ocid="product.category_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-unit">หน่วยนับ</Label>
          <Input
            id="product-unit"
            value={draft.unit}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, unit: event.target.value }))
            }
            placeholder="เช่น ถุง / ชิ้น / กล่อง"
            data-ocid="product.unit_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-price">ราคาต่อหน่วย (บาท)</Label>
          <Input
            id="product-price"
            value={draft.unitPrice}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, unitPrice: event.target.value }))
            }
            placeholder="0.00"
            inputMode="decimal"
            aria-invalid={priceError ? true : undefined}
            aria-describedby={priceError ? "product-price-error" : undefined}
            className="ledger-figure text-right"
            data-ocid="product.unit_price_input"
          />
          {priceError ? (
            <p
              id="product-price-error"
              className="text-xs text-destructive"
              data-ocid="product.unit_price_error"
            >
              {priceError}
            </p>
          ) : null}
        </div>

        {isEditing ? (
          <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/40 px-3 py-2.5 sm:col-span-2">
            <div className="space-y-0.5">
              <Label htmlFor="product-active">เปิดขายสินค้านี้</Label>
              <p className="text-xs text-muted-foreground">
                ปิดเพื่อหยุดขายโดยไม่ลบประวัติใบแจ้งหนี้เดิม
              </p>
            </div>
            <Switch
              id="product-active"
              checked={draft.active}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, active: checked }))
              }
              data-ocid="product.active_switch"
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="product.form_error"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="product.cancel_button"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isPending || draft.name.trim() === ""}
          data-ocid="product.submit_button"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isEditing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </Button>
      </div>
    </form>
  );
}
