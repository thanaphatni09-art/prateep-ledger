import { InvoiceCreatePage } from "@/pages/manager/InvoiceCreatePage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import {
  type CustomerSummary,
  type Invoice,
  InvoiceStatus,
  type Product,
} from "@/types/app";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

const CUSTOMERS: CustomerSummary[] = [
  {
    id: 1n,
    name: "ร้านกาแฟดอย",
    phone: "0812345678",
    address: "เชียงใหม่",
    creditLimit: 100000n,
    notes: "",
    active: true,
    createdAt: 0n,
    invoiceCount: 0n,
    outstandingBalance: 0n,
  },
];

const PRODUCTS: Product[] = [
  {
    id: 10n,
    name: "เมล็ดกาแฟอาราบิก้า",
    sku: "BEAN-01",
    unit: "กก.",
    unitPrice: 45000n,
    category: "กาแฟ",
    active: true,
    createdAt: 0n,
  },
];

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 5n,
    number: "INV-2569-0005",
    customerId: 1n,
    customerName: "ร้านกาแฟดอย",
    lines: [],
    subtotal: 135000n,
    total: 135000n,
    amountPaid: 0n,
    outstanding: 135000n,
    status: InvoiceStatus.unpaid,
    issuedAt: 0n,
    dueAt: 0n,
    notes: "",
    ...overrides,
  };
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement,
  optionName: string | RegExp,
) {
  await user.click(trigger);
  const option = await screen.findByRole("option", { name: optionName });
  await user.click(option);
}

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("InvoiceCreatePage", () => {
  it("builds an invoice from a customer and product and submits the computed lines", async () => {
    const user = userEvent.setup();
    const createInvoice = vi.fn(async () => makeInvoice());
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => CUSTOMERS),
        listProducts: vi.fn(async () => PRODUCTS),
        createInvoice,
      }),
    );

    renderWithProviders(<InvoiceCreatePage />);

    await selectOption(
      user,
      await screen.findByLabelText("ลูกค้า"),
      /ร้านกาแฟดอย/,
    );
    await selectOption(user, screen.getByLabelText("สินค้า"), /เมล็ดกาแฟอาราบิก้า/);

    const quantity = screen.getByLabelText("จำนวน");
    await user.clear(quantity);
    await user.type(quantity, "3");

    // 450.00 THB × 3 = 1,350.00 THB
    await waitFor(() => {
      expect(screen.getByTestId("invoice.grand_total")).toHaveTextContent(
        "฿1,350.00",
      );
    });

    await user.click(screen.getByTestId("invoice.submit_button"));

    await waitFor(() => {
      expect(createInvoice).toHaveBeenCalledTimes(1);
    });
    expect(createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 1n,
        lines: [{ productId: 10n, quantity: 3n }],
      }),
    );
  });

  it("shows an empty state when no customers exist yet", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => []),
        listProducts: vi.fn(async () => PRODUCTS),
      }),
    );

    renderWithProviders(<InvoiceCreatePage />);

    expect(await screen.findByText("ยังไม่มีลูกค้าในระบบ")).toBeInTheDocument();
  });

  it("requires a customer before the invoice can be created", async () => {
    const user = userEvent.setup();
    const createInvoice = vi.fn();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => CUSTOMERS),
        listProducts: vi.fn(async () => PRODUCTS),
        createInvoice,
      }),
    );

    renderWithProviders(<InvoiceCreatePage />);

    await selectOption(
      user,
      await screen.findByLabelText("สินค้า"),
      /เมล็ดกาแฟอาราบิก้า/,
    );
    await user.click(screen.getByTestId("invoice.submit_button"));

    expect(
      await screen.findByText("กรุณาเลือกลูกค้าสำหรับใบแจ้งหนี้นี้"),
    ).toBeInTheDocument();
    expect(createInvoice).not.toHaveBeenCalled();
  });
});
