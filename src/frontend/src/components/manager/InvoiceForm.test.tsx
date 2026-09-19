import { InvoiceForm } from "@/components/manager/InvoiceForm";
import type { CustomerSummary, Product } from "@/types/app";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
  {
    id: 20n,
    name: "แก้วกระดาษ",
    sku: "CUP-01",
    unit: "ใบ",
    unitPrice: 250n,
    category: "บรรจุภัณฑ์",
    active: true,
    createdAt: 0n,
  },
];

function renderForm(
  overrides: Partial<Parameters<typeof InvoiceForm>[0]> = {},
) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <InvoiceForm
      customers={CUSTOMERS}
      products={PRODUCTS}
      defaultTermsDays={30}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isPending={false}
      {...overrides}
    />,
  );
  return { onSubmit, onCancel };
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

describe("InvoiceForm", () => {
  it("computes the line total and grand total in THB from product price and quantity", async () => {
    const user = userEvent.setup();
    renderForm();

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
    expect(screen.getByTestId("invoice.line_total.1")).toHaveTextContent(
      "฿1,350.00",
    );
  });

  it("sums multiple product lines into the grand total", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectOption(user, screen.getByLabelText("สินค้า"), /เมล็ดกาแฟอาราบิก้า/);
    const firstQty = screen.getByLabelText("จำนวน");
    await user.clear(firstQty);
    await user.type(firstQty, "2");

    await user.click(screen.getByRole("button", { name: /เพิ่มรายการ/ }));

    const productSelects = screen.getAllByLabelText("สินค้า");
    await selectOption(user, productSelects[1], /แก้วกระดาษ/);

    const quantityInputs = screen.getAllByLabelText("จำนวน");
    await user.clear(quantityInputs[1]);
    await user.type(quantityInputs[1], "10");

    // 450.00 × 2 + 2.50 × 10 = 900.00 + 25.00 = 925.00 THB
    await waitFor(() => {
      expect(screen.getByTestId("invoice.grand_total")).toHaveTextContent(
        "฿925.00",
      );
    });
    expect(screen.getByTestId("invoice.line_total.1")).toHaveTextContent(
      "฿900.00",
    );
    expect(screen.getByTestId("invoice.line_total.2")).toHaveTextContent(
      "฿25.00",
    );
  });

  it("requires a customer before submitting", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await selectOption(user, screen.getByLabelText("สินค้า"), /เมล็ดกาแฟอาราบิก้า/);
    await user.click(screen.getByRole("button", { name: "ออกใบแจ้งหนี้" }));

    expect(
      await screen.findByText("กรุณาเลือกลูกค้าสำหรับใบแจ้งหนี้นี้"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("requires at least one product line before submitting", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await selectOption(user, screen.getByLabelText("ลูกค้า"), /ร้านกาแฟดอย/);
    await user.click(screen.getByRole("button", { name: "ออกใบแจ้งหนี้" }));

    expect(
      await screen.findByText("กรุณาเพิ่มรายการสินค้าอย่างน้อยหนึ่งรายการ"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the selected customer, product lines, and quantities", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await selectOption(user, screen.getByLabelText("ลูกค้า"), /ร้านกาแฟดอย/);
    await selectOption(user, screen.getByLabelText("สินค้า"), /เมล็ดกาแฟอาราบิก้า/);
    const quantity = screen.getByLabelText("จำนวน");
    await user.clear(quantity);
    await user.type(quantity, "4");

    await user.click(screen.getByRole("button", { name: "ออกใบแจ้งหนี้" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const input = onSubmit.mock.calls[0][0];
    expect(input.customerId).toBe(1n);
    expect(input.lines).toEqual([{ productId: 10n, quantity: 4n }]);
    expect(typeof input.issuedAt).toBe("bigint");
    expect(typeof input.dueAt).toBe("bigint");
    expect(input.dueAt).toBeGreaterThan(input.issuedAt);
  });

  it("calls onCancel when the cancel button is pressed", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderForm();

    await user.click(screen.getByRole("button", { name: "ยกเลิก" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
