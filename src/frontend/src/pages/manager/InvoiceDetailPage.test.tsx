import { InvoiceDetailPage } from "@/pages/manager/InvoiceDetailPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import {
  type InvoiceDetail,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

const INVOICE_ID = 5n;

function makeDetail(overrides: Partial<InvoiceDetail> = {}): InvoiceDetail {
  return {
    proofIds: [],
    payments: [],
    invoice: {
      id: INVOICE_ID,
      number: "INV-2569-0005",
      customerId: 1n,
      customerName: "ร้านกาแฟดอย",
      lines: [
        {
          productId: 10n,
          productName: "เมล็ดกาแฟอาราบิก้า",
          unit: "กก.",
          quantity: 3n,
          unitPrice: 45000n,
          lineTotal: 135000n,
        },
      ],
      subtotal: 135000n,
      total: 135000n,
      amountPaid: 0n,
      outstanding: 135000n,
      status: InvoiceStatus.unpaid,
      issuedAt: 0n,
      dueAt: 0n,
      notes: "",
    },
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("InvoiceDetailPage", () => {
  it("renders the line items and outstanding balance in THB", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getInvoice: vi.fn(async () => makeDetail()),
      }),
    );

    renderWithProviders(<InvoiceDetailPage />, {
      uiPath: "/manager/invoices/$invoiceId",
      initialPath: "/manager/invoices/5",
    });

    expect(await screen.findByText("เมล็ดกาแฟอาราบิก้า")).toBeInTheDocument();
    expect(screen.getByTestId("invoice_detail.outstanding")).toHaveTextContent(
      "฿1,350.00",
    );
  });

  it("records a manual payment with the entered amount and method", async () => {
    const user = userEvent.setup();
    const recordPayment = vi.fn(async () => ({
      id: 1n,
      invoiceId: INVOICE_ID,
      invoiceNumber: "INV-2569-0005",
      customerId: 1n,
      customerName: "ร้านกาแฟดอย",
      amount: 50000n,
      paidAt: 0n,
      method: PaymentMethod.cash,
      reference: "REF-1",
      status: PaymentStatus.approved,
      proofId: undefined,
      createdAt: 0n,
    }));
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getInvoice: vi.fn(async () => makeDetail()),
        recordPayment,
      }),
    );

    renderWithProviders(<InvoiceDetailPage />, {
      uiPath: "/manager/invoices/$invoiceId",
      initialPath: "/manager/invoices/5",
    });

    await user.click(
      await screen.findByTestId("invoice_detail.record_payment_button"),
    );

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("จำนวนเงินที่รับชำระ (บาท)"),
      "500",
    );
    await user.type(within(dialog).getByLabelText("เลขที่อ้างอิง"), "REF-1");
    await user.click(
      within(dialog).getByRole("button", { name: "บันทึกการชำระเงิน" }),
    );

    await waitFor(() => {
      expect(recordPayment).toHaveBeenCalledTimes(1);
    });
    expect(recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: INVOICE_ID,
        amount: 50000n,
        method: PaymentMethod.cash,
        reference: "REF-1",
      }),
    );
  });

  it("rejects a zero payment amount before submitting", async () => {
    const user = userEvent.setup();
    const recordPayment = vi.fn();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getInvoice: vi.fn(async () => makeDetail()),
        recordPayment,
      }),
    );

    renderWithProviders(<InvoiceDetailPage />, {
      uiPath: "/manager/invoices/$invoiceId",
      initialPath: "/manager/invoices/5",
    });

    await user.click(
      await screen.findByTestId("invoice_detail.record_payment_button"),
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("จำนวนเงินที่รับชำระ (บาท)"),
      "0",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "บันทึกการชำระเงิน" }),
    );

    expect(
      await screen.findByText("กรุณากรอกจำนวนเงินที่รับชำระเป็นตัวเลขมากกว่าศูนย์"),
    ).toBeInTheDocument();
    expect(recordPayment).not.toHaveBeenCalled();
  });

  it("disables recording a payment once the invoice is fully paid", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getInvoice: vi.fn(async () =>
          makeDetail({
            invoice: {
              ...makeDetail().invoice,
              amountPaid: 135000n,
              outstanding: 0n,
              status: InvoiceStatus.paid,
            },
          }),
        ),
      }),
    );

    renderWithProviders(<InvoiceDetailPage />, {
      uiPath: "/manager/invoices/$invoiceId",
      initialPath: "/manager/invoices/5",
    });

    expect(
      await screen.findByTestId("invoice_detail.record_payment_button"),
    ).toBeDisabled();
  });
});
