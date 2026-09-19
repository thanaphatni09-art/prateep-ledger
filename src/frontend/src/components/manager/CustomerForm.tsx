import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatSatang, parseBahtToSatang } from "@/lib/format";
import type { Customer, CustomerInput, CustomerUpdate } from "@/types/app";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface CustomerFormProps {
  /** Existing record when editing; omitted when creating. */
  customer?: Customer | null;
  onSubmit: (input: CustomerInput | CustomerUpdate) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
}

interface DraftState {
  name: string;
  phone: string;
  address: string;
  creditLimit: string;
  notes: string;
  active: boolean;
}

function initialDraft(customer?: Customer | null): DraftState {
  return {
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    creditLimit: customer ? formatSatang(customer.creditLimit) : "0.00",
    notes: customer?.notes ?? "",
    active: customer?.active ?? true,
  };
}

/** Create/edit form for a customer account and its credit terms. */
export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: CustomerFormProps) {
  const [draft, setDraft] = useState<DraftState>(() => initialDraft(customer));
  const [creditError, setCreditError] = useState<string | null>(null);

  const isEditing = Boolean(customer);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const creditLimit = parseBahtToSatang(draft.creditLimit);
    if (creditLimit === null) {
      setCreditError("กรุณากรอกวงเงินเครดิตเป็นตัวเลข เช่น 5000.00");
      return;
    }
    setCreditError(null);
    const base = {
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      creditLimit,
      notes: draft.notes.trim(),
    };
    onSubmit(isEditing ? { ...base, active: draft.active } : base);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="customer.form"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="customer-name">ชื่อลูกค้า</Label>
          <Input
            id="customer-name"
            value={draft.name}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="เช่น บริษัท รุ่งเรืองการค้า จำกัด"
            required
            data-ocid="customer.name_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customer-phone">เบอร์โทรศัพท์</Label>
          <Input
            id="customer-phone"
            value={draft.phone}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder="เช่น 081-234-5678"
            inputMode="tel"
            data-ocid="customer.phone_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customer-credit">วงเงินเครดิต (บาท)</Label>
          <Input
            id="customer-credit"
            value={draft.creditLimit}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, creditLimit: event.target.value }))
            }
            placeholder="0.00"
            inputMode="decimal"
            aria-invalid={creditError ? true : undefined}
            aria-describedby={creditError ? "customer-credit-error" : undefined}
            className="ledger-figure text-right"
            data-ocid="customer.credit_limit_input"
          />
          {creditError ? (
            <p
              id="customer-credit-error"
              className="text-xs text-destructive"
              data-ocid="customer.credit_limit_error"
            >
              {creditError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="customer-address">ที่อยู่</Label>
          <Textarea
            id="customer-address"
            value={draft.address}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, address: event.target.value }))
            }
            placeholder="ที่อยู่สำหรับออกใบแจ้งหนี้และหนังสือทวงถาม"
            rows={3}
            data-ocid="customer.address_textarea"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="customer-notes">บันทึกเพิ่มเติม</Label>
          <Textarea
            id="customer-notes"
            value={draft.notes}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="เงื่อนไขการชำระ ข้อตกลง หรือข้อมูลที่ต้องจำ"
            rows={2}
            data-ocid="customer.notes_textarea"
          />
        </div>

        {isEditing ? (
          <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/40 px-3 py-2.5 sm:col-span-2">
            <div className="space-y-0.5">
              <Label htmlFor="customer-active">สถานะบัญชี</Label>
              <p className="text-xs text-muted-foreground">
                ปิดใช้งานเพื่อหยุดออกใบแจ้งหนี้ใหม่ให้ลูกค้ารายนี้
              </p>
            </div>
            <Switch
              id="customer-active"
              checked={draft.active}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, active: checked }))
              }
              data-ocid="customer.active_switch"
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="customer.form_error"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="customer.cancel_button"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isPending || draft.name.trim() === ""}
          data-ocid="customer.submit_button"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isEditing ? "บันทึกการแก้ไข" : "สร้างบัญชีลูกค้า"}
        </Button>
      </div>
    </form>
  );
}
