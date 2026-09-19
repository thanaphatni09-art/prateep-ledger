import { DebtNoticeDocument } from "@/components/documents/DebtNoticeDocument";
import { InvoiceDocument } from "@/components/documents/InvoiceDocument";
import { PrintButton } from "@/components/documents/PrintButton";
import { ReceiptDocument } from "@/components/documents/ReceiptDocument";
import {
  AgingBucket,
  type DebtNoticeDocument as DebtNoticeDocumentData,
  type InvoiceDocument as InvoiceDocumentData,
  PaymentMethod,
  type ReceiptDocument as ReceiptDocumentData,
} from "@/types/app";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const HEADER = {
  shopName: "สมุดบัญชีร้าน",
  address: "123 ถนนสุขุมวิท กรุงเทพฯ",
  taxId: "1234567890123",
  phone: "021234567",
};

const ISSUED_AT = BigInt(new Date(2026, 8, 19).getTime()) * 1_000_000n;

describe("InvoiceDocument", () => {
  const document: InvoiceDocumentData = {
    header: HEADER,
    number: "INV-2569-0001",
    issuedAt: ISSUED_AT,
    dueAt: BigInt(new Date(2026, 9, 19).getTime()) * 1_000_000n,
    customerName: "ร้านกาแฟดอย",
    customerAddress: "เชียงใหม่",
    customerPhone: "0812345678",
    lines: [
      {
        description: "เมล็ดกาแฟอาราบิก้า",
        quantity: 3n,
        unit: "กก.",
        unitPrice: 45000n,
        lineTotal: 135000n,
      },
    ],
    subtotal: 135000n,
    total: 135000n,
    amountPaid: 35000n,
    outstanding: 100000n,
    amountInWords: "หนึ่งพันสามร้อยห้าสิบบาทถ้วน",
    notes: "ส่งของวันที่ 20",
  };

  it("renders the Thai invoice layout with THB totals", () => {
    render(<InvoiceDocument document={document} />);

    expect(
      screen.getByRole("article", { name: "ใบแจ้งหนี้ INV-2569-0001" }),
    ).toBeInTheDocument();
    expect(screen.getByText("สมุดบัญชีร้าน")).toBeInTheDocument();
    expect(screen.getByText("ร้านกาแฟดอย")).toBeInTheDocument();
    expect(screen.getByText("เมล็ดกาแฟอาราบิก้า")).toBeInTheDocument();
    expect(screen.getByText("19 กันยายน 2569")).toBeInTheDocument();
    expect(screen.getByText("หนึ่งพันสามร้อยห้าสิบบาทถ้วน")).toBeInTheDocument();
    // Line total, subtotal, total, paid, and outstanding all render as satang.
    expect(screen.getAllByText("1,350.00").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("350.00")).toBeInTheDocument();
    expect(screen.getByText("1,000.00")).toBeInTheDocument();
  });
});

describe("ReceiptDocument", () => {
  const document: ReceiptDocumentData = {
    header: HEADER,
    number: "REC-2569-0001",
    issuedAt: ISSUED_AT,
    customerName: "ร้านกาแฟดอย",
    customerAddress: "เชียงใหม่",
    invoiceNumber: "INV-2569-0001",
    amount: 135000n,
    amountInWords: "หนึ่งพันสามร้อยห้าสิบบาทถ้วน",
    method: PaymentMethod.bankTransfer,
    reference: "REF-001",
  };

  it("renders the Thai receipt with the payment method and amount", () => {
    render(<ReceiptDocument document={document} />);

    expect(
      screen.getByRole("article", { name: "ใบเสร็จรับเงิน REC-2569-0001" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ใบเสร็จรับเงิน")).toBeInTheDocument();
    expect(screen.getByText("โอนผ่านธนาคาร")).toBeInTheDocument();
    expect(screen.getByText("REF-001")).toBeInTheDocument();
    expect(screen.getByText("1,350.00")).toBeInTheDocument();
    expect(screen.getByText("ชำระแล้ว")).toBeInTheDocument();
  });
});

describe("DebtNoticeDocument", () => {
  const document: DebtNoticeDocumentData = {
    header: HEADER,
    customerName: "ร้านกาแฟดอย",
    customerAddress: "เชียงใหม่",
    customerPhone: "0812345678",
    issuedAt: ISSUED_AT,
    outstandingBalance: 100000n,
    amountInWords: "หนึ่งพันบาทถ้วน",
    aging: [
      { bucket: AgingBucket.current, amount: 40000n },
      { bucket: AgingBucket.days31to60, amount: 60000n },
    ],
    invoices: [
      {
        description: "INV-2569-0001",
        quantity: 1n,
        unit: "ฉบับ",
        unitPrice: 100000n,
        lineTotal: 100000n,
      },
    ],
    bankName: "ธนาคารกสิกรไทย",
    accountName: "สมุดบัญชีร้าน",
    accountNumber: "123-4-56789-0",
    promptPayRef: "0812345678",
  };

  it("renders the outstanding balance, aging, and bank details", () => {
    render(<DebtNoticeDocument document={document} />);

    expect(
      screen.getByRole("article", {
        name: "หนังสือแจ้งหนี้ค้างชำระ ร้านกาแฟดอย",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("หนังสือแจ้งหนี้ค้างชำระ")).toBeInTheDocument();
    // The balance, the invoice unit price, and the line total all render as
    // 1,000.00; assert the balance section carries it at least once.
    expect(screen.getAllByText("1,000.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ยังไม่ครบกำหนด")).toBeInTheDocument();
    expect(screen.getByText("31–60 วัน")).toBeInTheDocument();
    expect(screen.getByText("ธนาคารกสิกรไทย")).toBeInTheDocument();
    expect(screen.getByText("123-4-56789-0")).toBeInTheDocument();
    expect(screen.getByText("ค้างชำระ")).toBeInTheDocument();
  });
});

describe("PrintButton", () => {
  it("triggers the browser print dialog", async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(<PrintButton label="พิมพ์ใบแจ้งหนี้" />);
    await user.click(screen.getByRole("button", { name: "พิมพ์ใบแจ้งหนี้" }));

    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
