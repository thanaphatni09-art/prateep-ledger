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
import { Textarea } from "@/components/ui/textarea";
import {
  dateToTimestamp,
  formatTHB,
  fromDateInputValue,
  toDateInputValue,
} from "@/lib/format";
import type {
  CustomerSummary,
  InvoiceInput,
  InvoiceLineInput,
  Product,
} from "@/types/app";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

interface InvoiceFormProps {
  customers: CustomerSummary[];
  products: Product[];
  defaultTermsDays: number;
  onSubmit: (input: InvoiceInput) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
}

interface LineDraft {
  /** Stable local identity for the row, independent of the product id. */
  key: string;
  productId: string;
  quantity: string;
}

const NEW_LINE_KEY = "line-new";

function todayInput(): string {
  return toDateInputValue(new Date());
}

function addDaysInput(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

/** Build an invoice by picking a customer and adding product lines. */
export function InvoiceForm({
  customers,
  products,
  defaultTermsDays,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [issuedAt, setIssuedAt] = useState(todayInput);
  const [dueAt, setDueAt] = useState(() => addDaysInput(defaultTermsDays));
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([
    { key: NEW_LINE_KEY, productId: "", quantity: "1" },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) map.set(product.id.toString(), product);
    return map;
  }, [products]);

  const grandTotal = useMemo(() => {
    let total = 0n;
    for (const line of lines) {
      const product = productById.get(line.productId);
      const quantity = Number.parseInt(line.quantity, 10);
      if (!product || !Number.isFinite(quantity) || quantity <= 0) continue;
      total += product.unitPrice * BigInt(quantity);
    }
    return total;
  }, [lines, productById]);

  function updateLine(key: string, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        key: `line-${prev.length}-${Date.now()}`,
        productId: "",
        quantity: "1",
      },
    ]);
  }

  function removeLine(key: string) {
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((line) => line.key !== key),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      setFormError("กรุณาเลือกลูกค้าสำหรับใบแจ้งหนี้นี้");
      return;
    }
    const issued = fromDateInputValue(issuedAt);
    const due = fromDateInputValue(dueAt);
    if (!issued || !due) {
      setFormError("กรุณาระบุวันที่ออกและวันครบกำหนดให้ถูกต้อง");
      return;
    }
    const parsedLines: InvoiceLineInput[] = [];
    for (const line of lines) {
      if (!line.productId) continue;
      const quantity = Number.parseInt(line.quantity, 10);
      if (!Number.isFinite(quantity) || quantity <= 0) continue;
      parsedLines.push({
        productId: BigInt(line.productId),
        quantity: BigInt(quantity),
      });
    }
    if (parsedLines.length === 0) {
      setFormError("กรุณาเพิ่มรายการสินค้าอย่างน้อยหนึ่งรายการ");
      return;
    }
    setFormError(null);
    onSubmit({
      customerId: BigInt(customerId),
      issuedAt: dateToTimestamp(issued),
      dueAt: dateToTimestamp(due),
      notes: notes.trim(),
      lines: parsedLines,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      data-ocid="invoice.form"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor="invoice-customer">ลูกค้า</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger
              id="invoice-customer"
              data-ocid="invoice.customer_select"
            >
              <SelectValue placeholder="เลือกลูกค้า" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem
                  key={customer.id.toString()}
                  value={customer.id.toString()}
                >
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice-issued">วันที่ออก</Label>
          <Input
            id="invoice-issued"
            type="date"
            value={issuedAt}
            onChange={(event) => setIssuedAt(event.target.value)}
            data-ocid="invoice.issued_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice-due">วันครบกำหนด</Label>
          <Input
            id="invoice-due"
            type="date"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            data-ocid="invoice.due_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice-notes">บันทึกในใบแจ้งหนี้</Label>
          <Input
            id="invoice-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="เช่น ส่งของวันที่ 20"
            data-ocid="invoice.notes_input"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">รายการสินค้า</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLine}
            className="gap-1.5"
            data-ocid="invoice.add_line_button"
          >
            <Plus className="size-4" aria-hidden="true" />
            เพิ่มรายการ
          </Button>
        </div>

        <div className="space-y-2">
          {lines.map((line, index) => {
            const product = productById.get(line.productId);
            const quantity = Number.parseInt(line.quantity, 10);
            const lineTotal =
              product && Number.isFinite(quantity) && quantity > 0
                ? product.unitPrice * BigInt(quantity)
                : 0n;
            return (
              <div
                key={line.key}
                className="grid grid-cols-1 gap-2 rounded-md border border-border bg-card p-3 sm:grid-cols-[1fr_6rem_8rem_auto] sm:items-end"
                data-ocid={`invoice.line.${index + 1}`}
              >
                <div className="space-y-1.5">
                  <Label htmlFor={`invoice-line-product-${line.key}`}>
                    สินค้า
                  </Label>
                  <Select
                    value={line.productId}
                    onValueChange={(value) =>
                      updateLine(line.key, { productId: value })
                    }
                  >
                    <SelectTrigger
                      id={`invoice-line-product-${line.key}`}
                      data-ocid={`invoice.line_product_select.${index + 1}`}
                    >
                      <SelectValue placeholder="เลือกสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((item) => (
                        <SelectItem
                          key={item.id.toString()}
                          value={item.id.toString()}
                        >
                          {item.name} · {formatTHB(item.unitPrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`invoice-line-qty-${line.key}`}>จำนวน</Label>
                  <Input
                    id={`invoice-line-qty-${line.key}`}
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.key, { quantity: event.target.value })
                    }
                    inputMode="numeric"
                    className="ledger-figure text-right"
                    data-ocid={`invoice.line_quantity_input.${index + 1}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-foreground">
                    รวม
                  </span>
                  <p
                    className="ledger-figure flex h-9 items-center justify-end rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground"
                    data-ocid={`invoice.line_total.${index + 1}`}
                  >
                    {formatTHB(lineTotal)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLine(line.key)}
                  disabled={lines.length === 1}
                  aria-label={`ลบรายการที่ ${index + 1}`}
                  data-ocid={`invoice.remove_line_button.${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-3">
        <span className="text-sm font-medium text-foreground">ยอดรวมทั้งสิ้น</span>
        <span
          className="ledger-figure text-lg font-semibold text-foreground"
          data-ocid="invoice.grand_total"
        >
          {formatTHB(grandTotal)}
        </span>
      </div>

      {formError ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="invoice.form_error"
        >
          {formError}
        </p>
      ) : null}
      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="invoice.submit_error"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="invoice.cancel_button"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="invoice.submit_button"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          ออกใบแจ้งหนี้
        </Button>
      </div>
    </form>
  );
}
