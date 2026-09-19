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
import {
  dateToTimestamp,
  formatTHB,
  fromDateInputValue,
  parseBahtToSatang,
  toDateInputValue,
} from "@/lib/format";
import { type PaymentInput, PaymentMethod } from "@/types/app";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface PaymentFormProps {
  invoiceId: bigint;
  invoiceNumber: string;
  outstanding: bigint;
  onSubmit: (input: PaymentInput) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: "เงินสด",
  [PaymentMethod.bankTransfer]: "โอนผ่านธนาคาร",
  [PaymentMethod.other]: "อื่น ๆ",
};

/** Record a manual payment against an invoice. */
export function PaymentForm({
  invoiceId,
  invoiceNumber,
  outstanding,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => toDateInputValue(new Date()));
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.cash);
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const satang = parseBahtToSatang(amount);
    if (satang === null || satang <= 0n) {
      setFormError("กรุณากรอกจำนวนเงินที่รับชำระเป็นตัวเลขมากกว่าศูนย์");
      return;
    }
    const date = fromDateInputValue(paidAt);
    if (!date) {
      setFormError("กรุณาระบุวันที่รับชำระให้ถูกต้อง");
      return;
    }
    setFormError(null);
    onSubmit({
      invoiceId,
      amount: satang,
      paidAt: dateToTimestamp(date),
      method,
      reference: reference.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="payment.form"
    >
      <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">ใบแจ้งหนี้ {invoiceNumber}</p>
        <p className="ledger-figure text-sm font-medium text-foreground">
          ยอดคงค้าง {formatTHB(outstanding)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="payment-amount">จำนวนเงินที่รับชำระ (บาท)</Label>
          <Input
            id="payment-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            className="ledger-figure text-right"
            data-ocid="payment.amount_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment-date">วันที่รับชำระ</Label>
          <Input
            id="payment-date"
            type="date"
            value={paidAt}
            onChange={(event) => setPaidAt(event.target.value)}
            data-ocid="payment.date_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment-method">ช่องทางชำระเงิน</Label>
          <Select
            value={method}
            onValueChange={(value) => setMethod(value as PaymentMethod)}
          >
            <SelectTrigger
              id="payment-method"
              data-ocid="payment.method_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PaymentMethod).map((value) => (
                <SelectItem key={value} value={value}>
                  {METHOD_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment-reference">เลขที่อ้างอิง</Label>
          <Input
            id="payment-reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="เช่น เลขที่สลิป / เลขที่ใบเสร็จ"
            className="ledger-figure"
            data-ocid="payment.reference_input"
          />
        </div>
      </div>

      {formError ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="payment.form_error"
        >
          {formError}
        </p>
      ) : null}
      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="payment.submit_error"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="payment.cancel_button"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="payment.submit_button"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          บันทึกการชำระเงิน
        </Button>
      </div>
    </form>
  );
}
