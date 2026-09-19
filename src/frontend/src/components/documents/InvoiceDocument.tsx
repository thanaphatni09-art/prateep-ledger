import { DocumentSheet } from "@/components/documents/DocumentSheet";
import { formatSatang, formatThaiDateLong } from "@/lib/format";
import type { InvoiceDocument as InvoiceDocumentData } from "@/types/app";

interface InvoiceDocumentProps {
  document: InvoiceDocumentData;
}

/** Thai-layout invoice: shop header, customer block, line items, THB totals. */
export function InvoiceDocument({ document }: InvoiceDocumentProps) {
  const {
    header,
    number,
    issuedAt,
    dueAt,
    customerName,
    customerAddress,
    customerPhone,
    lines,
    subtotal,
    total,
    amountPaid,
    outstanding,
    amountInWords,
    notes,
  } = document;

  return (
    <DocumentSheet label={`ใบแจ้งหนี้ ${number}`}>
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
          <p className="doc-title text-lg font-semibold doc-accent">ใบแจ้งหนี้</p>
          <p className="doc-label mt-1">เลขที่เอกสาร</p>
          <p className="doc-figure text-sm font-medium">{number}</p>
        </div>
      </header>

      {/* Customer + dates */}
      <section className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="doc-label">ลูกค้า</p>
          <p className="text-sm font-semibold">{customerName}</p>
          {customerAddress ? (
            <p className="max-w-xs text-xs leading-relaxed doc-ink-soft">
              {customerAddress}
            </p>
          ) : null}
          {customerPhone ? (
            <p className="text-xs doc-ink-soft">โทร. {customerPhone}</p>
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
            <dt className="doc-label">กำหนดชำระ</dt>
            <dd className="doc-figure text-sm">{formatThaiDateLong(dueAt)}</dd>
          </div>
        </dl>
      </section>

      {/* Line items */}
      <table className="doc-table mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="doc-table-head">
            <th
              className="border px-3 py-2 text-left font-medium doc-rule"
              scope="col"
            >
              ลำดับ
            </th>
            <th
              className="border px-3 py-2 text-left font-medium doc-rule"
              scope="col"
            >
              รายการ
            </th>
            <th
              className="border px-3 py-2 text-right font-medium doc-rule"
              scope="col"
            >
              จำนวน
            </th>
            <th
              className="border px-3 py-2 text-left font-medium doc-rule"
              scope="col"
            >
              หน่วย
            </th>
            <th
              className="border px-3 py-2 text-right font-medium doc-rule"
              scope="col"
            >
              ราคา/หน่วย
            </th>
            <th
              className="border px-3 py-2 text-right font-medium doc-rule"
              scope="col"
            >
              รวม
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${line.description}-${index}`}>
              <td className="border px-3 py-2 text-center doc-figure doc-rule">
                {index + 1}
              </td>
              <td className="border px-3 py-2 doc-rule">{line.description}</td>
              <td className="border px-3 py-2 text-right doc-figure doc-rule">
                {line.quantity.toString()}
              </td>
              <td className="border px-3 py-2 doc-rule">{line.unit}</td>
              <td className="border px-3 py-2 text-right doc-figure doc-rule">
                {formatSatang(line.unitPrice)}
              </td>
              <td className="border px-3 py-2 text-right doc-figure doc-rule">
                {formatSatang(line.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <section className="mt-5 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="max-w-sm space-y-2">
          <p className="doc-label">จำนวนเงินเป็นตัวอักษร</p>
          <p className="text-sm font-medium doc-accent">{amountInWords}</p>
          {notes ? (
            <div className="pt-2">
              <p className="doc-label">หมายเหตุ</p>
              <p className="text-xs leading-relaxed doc-ink-soft">{notes}</p>
            </div>
          ) : null}
        </div>
        <dl className="w-full space-y-2 sm:max-w-xs">
          <div className="flex items-center justify-between gap-6">
            <dt className="text-sm doc-ink-soft">ยอดรวม</dt>
            <dd className="doc-figure text-sm">{formatSatang(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-6">
            <dt className="text-sm doc-ink-soft">ยอดสุทธิ</dt>
            <dd className="doc-figure text-sm font-semibold">
              {formatSatang(total)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-6">
            <dt className="text-sm doc-ink-soft">ชำระแล้ว</dt>
            <dd className="doc-figure text-sm">{formatSatang(amountPaid)}</dd>
          </div>
          <div className="doc-total-row flex items-center justify-between gap-6 rounded-sm px-3 py-2">
            <dt className="text-sm font-semibold">ยอดคงค้าง</dt>
            <dd className="doc-figure text-base font-semibold doc-accent">
              {formatSatang(outstanding)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Signature */}
      <footer className="doc-avoid-break mt-12 flex flex-wrap items-end justify-between gap-8">
        <div className="text-center">
          <div className="w-48 border-b doc-rule-strong" />
          <p className="mt-2 text-xs doc-ink-soft">ผู้รับเอกสาร</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-b doc-rule-strong" />
          <p className="mt-2 text-xs doc-ink-soft">ผู้มีอำนาจลงนาม</p>
        </div>
      </footer>
    </DocumentSheet>
  );
}
