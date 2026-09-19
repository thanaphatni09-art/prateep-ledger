import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SettingsInput, ShopSettings } from "@/types/app";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface SettingsFormProps {
  settings: ShopSettings;
  onSubmit: (input: SettingsInput) => void;
  isPending: boolean;
  errorMessage?: string;
  successMessage?: string;
}

interface DraftState {
  shopName: string;
  address: string;
  taxId: string;
  phone: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  promptPayRef: string;
  invoicePrefix: string;
  receiptPrefix: string;
  defaultPaymentTermsDays: string;
}

function initialDraft(settings: ShopSettings): DraftState {
  return {
    shopName: settings.shopName,
    address: settings.address,
    taxId: settings.taxId,
    phone: settings.phone,
    bankName: settings.bankName,
    accountName: settings.accountName,
    accountNumber: settings.accountNumber,
    promptPayRef: settings.promptPayRef,
    invoicePrefix: settings.invoicePrefix,
    receiptPrefix: settings.receiptPrefix,
    defaultPaymentTermsDays: settings.defaultPaymentTermsDays.toString(),
  };
}

/** Shop profile, bank details, and document numbering settings. */
export function SettingsForm({
  settings,
  onSubmit,
  isPending,
  errorMessage,
  successMessage,
}: SettingsFormProps) {
  const [draft, setDraft] = useState<DraftState>(() => initialDraft(settings));
  const [termsError, setTermsError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const terms = Number.parseInt(draft.defaultPaymentTermsDays, 10);
    if (!Number.isFinite(terms) || terms < 0) {
      setTermsError("กรุณาระบุจำนวนวันเครดิตเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");
      return;
    }
    setTermsError(null);
    onSubmit({
      shopName: draft.shopName.trim(),
      address: draft.address.trim(),
      taxId: draft.taxId.trim(),
      phone: draft.phone.trim(),
      bankName: draft.bankName.trim(),
      accountName: draft.accountName.trim(),
      accountNumber: draft.accountNumber.trim(),
      promptPayRef: draft.promptPayRef.trim(),
      invoicePrefix: draft.invoicePrefix.trim(),
      receiptPrefix: draft.receiptPrefix.trim(),
      defaultPaymentTermsDays: BigInt(terms),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      data-ocid="settings.form"
    >
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">ข้อมูลร้านค้า</h2>
          <p className="text-xs text-muted-foreground">
            ข้อมูลนี้จะแสดงบนหัวใบแจ้งหนี้ ใบเสร็จ และหนังสือทวงถาม
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="settings-shop-name">ชื่อร้านค้า</Label>
            <Input
              id="settings-shop-name"
              value={draft.shopName}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, shopName: event.target.value }))
              }
              placeholder="เช่น ร้านรุ่งเรืองวัสดุก่อสร้าง"
              data-ocid="settings.shop_name_input"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="settings-address">ที่อยู่ร้าน</Label>
            <Textarea
              id="settings-address"
              value={draft.address}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, address: event.target.value }))
              }
              placeholder="ที่อยู่สำหรับออกเอกสาร"
              rows={3}
              data-ocid="settings.address_textarea"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-tax-id">เลขประจำตัวผู้เสียภาษี</Label>
            <Input
              id="settings-tax-id"
              value={draft.taxId}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, taxId: event.target.value }))
              }
              placeholder="0-0000-00000-00-0"
              className="ledger-figure"
              data-ocid="settings.tax_id_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-phone">เบอร์โทรศัพท์ร้าน</Label>
            <Input
              id="settings-phone"
              value={draft.phone}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="เช่น 02-123-4567"
              inputMode="tel"
              data-ocid="settings.phone_input"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">
            บัญชีธนาคารสำหรับรับโอน
          </h2>
          <p className="text-xs text-muted-foreground">
            ลูกค้าจะเห็นข้อมูลนี้เมื่อแนบหลักฐานการโอนเงิน
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="settings-bank-name">ธนาคาร</Label>
            <Input
              id="settings-bank-name"
              value={draft.bankName}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, bankName: event.target.value }))
              }
              placeholder="เช่น ธนาคารกสิกรไทย"
              data-ocid="settings.bank_name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-account-name">ชื่อบัญชี</Label>
            <Input
              id="settings-account-name"
              value={draft.accountName}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  accountName: event.target.value,
                }))
              }
              placeholder="ชื่อเจ้าของบัญชี"
              data-ocid="settings.account_name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-account-number">เลขที่บัญชี</Label>
            <Input
              id="settings-account-number"
              value={draft.accountNumber}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  accountNumber: event.target.value,
                }))
              }
              placeholder="000-0-00000-0"
              className="ledger-figure"
              data-ocid="settings.account_number_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-promptpay">พร้อมเพย์ / QR อ้างอิง</Label>
            <Input
              id="settings-promptpay"
              value={draft.promptPayRef}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  promptPayRef: event.target.value,
                }))
              }
              placeholder="เช่น 0812345678"
              className="ledger-figure"
              data-ocid="settings.promptpay_input"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">
            การออกเลขเอกสารและเงื่อนไขชำระ
          </h2>
          <p className="text-xs text-muted-foreground">
            ใช้เป็นค่าเริ่มต้นเมื่อออกใบแจ้งหนี้และใบเสร็จใหม่
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="settings-invoice-prefix">คำนำหน้าเลขใบแจ้งหนี้</Label>
            <Input
              id="settings-invoice-prefix"
              value={draft.invoicePrefix}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  invoicePrefix: event.target.value,
                }))
              }
              placeholder="เช่น INV"
              className="ledger-figure"
              data-ocid="settings.invoice_prefix_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-receipt-prefix">คำนำหน้าเลขใบเสร็จ</Label>
            <Input
              id="settings-receipt-prefix"
              value={draft.receiptPrefix}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  receiptPrefix: event.target.value,
                }))
              }
              placeholder="เช่น REC"
              className="ledger-figure"
              data-ocid="settings.receipt_prefix_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-terms">เครดิตเริ่มต้น (วัน)</Label>
            <Input
              id="settings-terms"
              value={draft.defaultPaymentTermsDays}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  defaultPaymentTermsDays: event.target.value,
                }))
              }
              inputMode="numeric"
              aria-invalid={termsError ? true : undefined}
              aria-describedby={termsError ? "settings-terms-error" : undefined}
              className="ledger-figure text-right"
              data-ocid="settings.terms_input"
            />
            {termsError ? (
              <p
                id="settings-terms-error"
                className="text-xs text-destructive"
                data-ocid="settings.terms_error"
              >
                {termsError}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="settings.form_error"
        >
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <output
          className="block rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
          data-ocid="settings.success_state"
        >
          {successMessage}
        </output>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="settings.submit_button"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          บันทึกการตั้งค่า
        </Button>
      </div>
    </form>
  );
}
