import { DocumentSheet } from "@/components/documents/DocumentSheet";
import {
  agingBucketLabel,
  formatSatang,
  formatThaiDateLong,
} from "@/lib/format";
import type { DebtNoticeDocument as DebtNoticeDocumentData } from "@/types/app";

interface DebtNoticeDocumentProps {
  document: DebtNoticeDocumentData;
}

/** Thai-layout debt notice: outstanding balance, aging, invoices, and bank details. */
export function DebtNoticeDocument({ document }: DebtNoticeDocumentProps) {
  const {
    header,
    customerName,
    customerAddress,
    customerPhone,
    issuedAt,
    outstandingBalance,
    amountInWords,
    aging,
    invoices,
    bankName,
    accountName,
    accountNumber,
    promptPayRef,
  } = document;

  return (
    <DocumentSheet label={`หนังสือแจ้งหนี้ค้างชำระ ${customerName}`}>
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
            หนังสือแจ้งหนี้ค้างชำระ
          </p>
          <p className="doc-label mt-1">วันที่ออกเอกสาร</p>
          <p className="doc-figure text-sm font-medium">
            {formatThaiDateLong(issuedAt)}
          </p>
        </div>
      </header>

      {/* Customer */}
      <section className="mt-5 space-y-1">
        <p className="doc-label">เรียน</p>
        <p className="text-sm font-semibold">{customerName}</p>
        {customerAddress ? (
          <p className="max-w-md text-xs leading-relaxed doc-ink-soft">
            {customerAddress}
          </p>
        ) : null}
        {customerPhone ? (
          <p className="text-xs doc-ink-soft">โทร. {customerPhone}</p>
        ) : null}
      </section>

      {/* Outstanding balance */}
      <section className="doc-avoid-break mt-6 rounded-sm border doc-rule px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="doc-label">ยอดค้างชำระทั้งสิ้น</p>
            <p className="doc-figure mt-1 text-3xl font-semibold doc-accent">
              {formatSatang(outstandingBalance)}
            </p>
            <p className="mt-1 text-xs doc-ink-soft">บาท</p>
          </div>
          <span className="doc-stamp">ค้างชำระ</span>
        </div>
        <div className="mt-4 border-t pt-4 doc-rule">
          <p className="doc-label">จำนวนเงินเป็นตัวอักษร</p>
          <p className="mt-1 text-sm font-medium">{amountInWords}</p>
        </div>
      </section>

      {/* Aging */}
      {aging.length > 0 ? (
        <section className="mt-6">
          <p className="doc-label mb-2">อายุหนี้</p>
          <div className="flex flex-wrap gap-2">
            {aging.map((bucket) => (
              <div
                key={bucket.bucket}
                className="rounded-sm border px-3 py-2 doc-rule"
              >
                <p className="text-xs doc-ink-soft">
                  {agingBucketLabel(bucket.bucket)}
                </p>
                <p className="doc-figure text-sm font-medium">
                  {formatSatang(bucket.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Outstanding invoices */}
      <section className="mt-6">
        <p className="doc-label mb-2">รายการใบแจ้งหนี้ที่ค้างชำระ</p>
        <table className="doc-table w-full border-collapse text-sm">
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
            {invoices.map((line, index) => (
              <tr key={`${line.description}-${index}`}>
                <td className="border px-3 py-2 text-center doc-figure doc-rule">
                  {index + 1}
                </td>
                <td className="border px-3 py-2 doc-rule">
                  {line.description}
                </td>
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
      </section>

      {/* Payment instructions */}
      <section className="doc-avoid-break mt-6 rounded-sm border doc-rule px-5 py-4">
        <p className="doc-label mb-2">ช่องทางชำระเงิน</p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div className="flex gap-2 text-sm">
            <dt className="doc-ink-soft">ธนาคาร</dt>
            <dd className="font-medium">{bankName || "—"}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="doc-ink-soft">ชื่อบัญชี</dt>
            <dd className="font-medium">{accountName || "—"}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="doc-ink-soft">เลขที่บัญชี</dt>
            <dd className="doc-figure font-medium">{accountNumber || "—"}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="doc-ink-soft">พร้อมเพย์</dt>
            <dd className="doc-figure font-medium">{promptPayRef || "—"}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-5 text-xs leading-relaxed doc-ink-soft">
        กรุณาชำระยอดค้างชำระภายใน 7 วันนับจากวันที่ในเอกสารนี้ หากได้ชำระเงินแล้ว
        โปรดแจ้งหลักฐานการโอนเพื่อให้เจ้าหน้าที่ตรวจสอบ ขอขอบพระคุณที่ให้ความร่วมมือ
      </p>

      {/* Signature */}
      <footer className="doc-avoid-break mt-12 flex flex-wrap items-end justify-between gap-8">
        <div className="text-center">
          <div className="w-48 border-b doc-rule-strong" />
          <p className="mt-2 text-xs doc-ink-soft">ผู้แจ้งหนี้</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-b doc-rule-strong" />
          <p className="mt-2 text-xs doc-ink-soft">ผู้รับแจ้ง</p>
        </div>
      </footer>
    </DocumentSheet>
  );
}
