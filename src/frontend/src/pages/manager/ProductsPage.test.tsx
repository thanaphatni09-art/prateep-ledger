import { ProductsPage } from "@/pages/manager/ProductsPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import type { Product } from "@/types/app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 10n,
    name: "เมล็ดกาแฟอาราบิก้า",
    sku: "BEAN-01",
    unit: "กก.",
    unitPrice: 45000n,
    category: "กาแฟ",
    active: true,
    createdAt: 0n,
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("ProductsPage", () => {
  it("lists products with their unit price in THB", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProducts: vi.fn(async () => [makeProduct()]),
      }),
    );

    renderWithProviders(<ProductsPage />);

    expect(await screen.findByText("เมล็ดกาแฟอาราบิก้า")).toBeInTheDocument();
    expect(screen.getByText("฿450.00")).toBeInTheDocument();
  });

  it("creates a product with the entered unit price in THB", async () => {
    const user = userEvent.setup();
    const createProduct = vi.fn(async () => makeProduct());
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProducts: vi.fn(async () => []),
        createProduct,
      }),
    );

    renderWithProviders(<ProductsPage />);

    await user.click(await screen.findByRole("button", { name: "เพิ่มสินค้า" }));

    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("ชื่อสินค้า"), "แก้วกระดาษ");
    await user.type(within(dialog).getByLabelText("รหัสสินค้า (SKU)"), "CUP-01");
    await user.type(within(dialog).getByLabelText("หมวดหมู่"), "บรรจุภัณฑ์");
    const price = within(dialog).getByLabelText("ราคาต่อหน่วย (บาท)");
    await user.clear(price);
    await user.type(price, "2.50");

    await user.click(within(dialog).getByRole("button", { name: "เพิ่มสินค้า" }));

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledTimes(1);
    });
    expect(createProduct).toHaveBeenCalledWith({
      name: "แก้วกระดาษ",
      sku: "CUP-01",
      unit: "ชิ้น",
      unitPrice: 250n,
      category: "บรรจุภัณฑ์",
    });
  });

  it("rejects a non-numeric unit price before submitting", async () => {
    const user = userEvent.setup();
    const createProduct = vi.fn(async () => makeProduct());
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProducts: vi.fn(async () => []),
        createProduct,
      }),
    );

    renderWithProviders(<ProductsPage />);

    await user.click(await screen.findByRole("button", { name: "เพิ่มสินค้า" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("ชื่อสินค้า"), "สินค้าทดสอบ");
    const price = within(dialog).getByLabelText("ราคาต่อหน่วย (บาท)");
    await user.clear(price);
    await user.type(price, "ไม่ใช่ตัวเลข");

    await user.click(within(dialog).getByRole("button", { name: "เพิ่มสินค้า" }));

    expect(
      await screen.findByText("กรุณากรอกราคาต่อหน่วยเป็นตัวเลข เช่น 120.00"),
    ).toBeInTheDocument();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it("passes the search term to the backend query", async () => {
    const user = userEvent.setup();
    const listProducts = vi.fn(async () => [makeProduct()]);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProducts,
      }),
    );

    renderWithProviders(<ProductsPage />);
    await screen.findByText("เมล็ดกาแฟอาราบิก้า");

    await user.type(screen.getByLabelText("ค้นหาสินค้า"), "กาแฟ");

    await waitFor(() => {
      expect(listProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "กาแฟ" }),
      );
    });
  });

  it("filters by the selected category", async () => {
    const user = userEvent.setup();
    const listProducts = vi.fn(async () => [makeProduct()]);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProducts,
      }),
    );

    renderWithProviders(<ProductsPage />);
    await screen.findByText("เมล็ดกาแฟอาราบิก้า");

    await user.click(screen.getByLabelText("กรองตามหมวดหมู่"));
    await user.click(await screen.findByRole("option", { name: "กาแฟ" }));

    await waitFor(() => {
      expect(listProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: "กาแฟ" }),
      );
    });
  });
});
