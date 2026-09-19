import { DocumentSheet } from "@/components/documents/DocumentSheet";
import { formatSatang, formatThaiDateLong } from "@/lib/format";
import type { ReceiptDocument as ReceiptDocumentData } from "@/types/app";
import { PaymentMethod } from "@/types/app";

interface ReceiptDocumentProps {
  document: ReceiptDocumentData;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: "เงินสด",
  [PaymentMethod.bankTransfer]: "โอนผ่านธนาคาร",
  [PaymentMethod.other]: "อื่น ๆ",
};

/** Thai-layout receipt: shop header, payer block, amount, and amount in words. */
export function ReceiptDocument({ document }: ReceiptDocumentProps) {
  const {
    header,
    number,
    issuedAt,
    customerName,
    customerAddress,
    invoiceNumber,
    amount,
    amountInWords,
    method,
    reference,
  } = document;

  return (
    <DocumentSheet label={`ใบเสร็จรับเงิน ${number}`}>
      {/* Shop header */}
      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 pb-5 doc-rule-strong">
        <div className="min-w-0 space-y-1">
          <h1 className="doc-title text-xl font-semibold">{header.shopName}</h1>
          <p className="max-w-xs text-xs leading-relaxed doc-ink-soft">
            {header.address}
          </p>
          <p className="text-xs doc-ink-soft">
            โทร. {header.phone}
            {header.taxId ? ` · เลขประจำตัวผู้เสียภาษี ${header.taxId}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="doc-title text-lg font-semibold doc-accent">
            ใบเสร็จรับเงิน
          </p>
          <p className="doc-label mt-1">เลขที่เอกสาร</p>
          <p className="doc-figure text-sm font-medium">{number}</p>
        </div>
      </header>

      {/* Payer + reference */}
      <section className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="doc-label">ได้รับเงินจาก</p>
          <p className="text-sm font-semibold">{customerName}</p>
          {customerAddress ? (
            <p className="max-w-xs text-xs leading-relaxed doc-ink-soft">
              {customerAddress}
            </p>
          ) : null}
        </div>
        <dl className="space-y-2 sm:text-right">
          <div>
            <dt className="doc-label">วันที่ออกเอกสาร</dt>
            <dd className="doc-figure text-sm">
              {formatThaiDateLong(issuedAt)}
            </dd>
          </div>
          <div>
            <dt className="doc-label">อ้างอิงใบแจ้งหนี้</dt>
            <dd className="doc-figure text-sm">{invoiceNumber}</dd>
          </div>
        </dl>
      </section>

      {/* Amount */}
      <section className="doc-avoid-break mt-6 rounded-sm border doc-rule px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="doc-label">จำนวนเงินที่ได้รับ</p>
            <p className="doc-figure mt-1 text-3xl font-semibold doc-accent">
              {formatSatang(amount)}
            </p>
            <p className="mt-1 text-xs doc-ink-soft">บาท</p>
          </div>
          <span className="doc-stamp">ชำระแล้ว</span>
        </div>
        <div className="mt-4 border-t pt-4 doc-rule">
          <p className="doc-label">จำนวนเงินเป็นตัวอักษร</p>
          <p className="mt-1 text-sm font-medium">{amountInWords}</p>
        </div>
      </section>

      {/* Payment details */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="doc-label">วิธีชำระเงิน</p>
          <p className="text-sm">{METHOD_LABELS[method] ?? method}</p>
        </div>
        <div className="space-y-1">
          <p className="doc-label">เลขที่อ้างอิงการชำระ</p>
          <p className="doc-figure text-sm">{reference || "—"}</p>
        </div>
      </section>

      {/* Signature */}
      <footer className="doc-avoid-break mt-12 flex flex-wrap items-end justify-between gap-8">
        <div className="text-center">
          <div className="w-48 border-b doc-rule-strong" />
          <p className="mt-2 text-xs doc-ink-soft">ผู้รับเงิน</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-b doc-rule-strong" />
          <p className="mt-2 text-xs doc-ink-soft">ผู้มีอำนาจลงนาม</p>
        </div>
      </footer>
    </DocumentSheet>
  );
}
