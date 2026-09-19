import { CustomersPage } from "@/pages/manager/CustomersPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import type { CustomerSummary } from "@/types/app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

function makeCustomer(
  overrides: Partial<CustomerSummary> = {},
): CustomerSummary {
  return {
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
    loginPrincipal: undefined,
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("CustomersPage", () => {
  it("lists customers with their outstanding balance in THB", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => [
          makeCustomer({ outstandingBalance: 125000n }),
        ]),
      }),
    );

    renderWithProviders(<CustomersPage />);

    expect(await screen.findByText("ร้านกาแฟดอย")).toBeInTheDocument();
    expect(screen.getByText("฿1,250.00")).toBeInTheDocument();
  });

  it("shows an empty state when there are no customers", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => []),
      }),
    );

    renderWithProviders(<CustomersPage />);

    expect(await screen.findByText("ยังไม่มีลูกค้า")).toBeInTheDocument();
  });

  it("creates a customer account with the entered credit limit", async () => {
    const user = userEvent.setup();
    const createCustomer = vi.fn(async () => makeCustomer());
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => []),
        createCustomer,
      }),
    );

    renderWithProviders(<CustomersPage />);

    await user.click(await screen.findByRole("button", { name: "เปิดบัญชีลูกค้า" }));

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("ชื่อลูกค้า"),
      "บริษัท รุ่งเรืองการค้า จำกัด",
    );
    await user.type(within(dialog).getByLabelText("เบอร์โทรศัพท์"), "0899999999");
    const credit = within(dialog).getByLabelText("วงเงินเครดิต (บาท)");
    await user.clear(credit);
    await user.type(credit, "5000.00");

    await user.click(
      within(dialog).getByRole("button", { name: "สร้างบัญชีลูกค้า" }),
    );

    await waitFor(() => {
      expect(createCustomer).toHaveBeenCalledTimes(1);
    });
    expect(createCustomer).toHaveBeenCalledWith({
      name: "บริษัท รุ่งเรืองการค้า จำกัด",
      phone: "0899999999",
      address: "",
      creditLimit: 500000n,
      notes: "",
    });
  });

  it("rejects a non-numeric credit limit before submitting", async () => {
    const user = userEvent.setup();
    const createCustomer = vi.fn(async () => makeCustomer());
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers: vi.fn(async () => []),
        createCustomer,
      }),
    );

    renderWithProviders(<CustomersPage />);

    await user.click(await screen.findByRole("button", { name: "เปิดบัญชีลูกค้า" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("ชื่อลูกค้า"), "ลูกค้าทดสอบ");
    const credit = within(dialog).getByLabelText("วงเงินเครดิต (บาท)");
    await user.clear(credit);
    await user.type(credit, "abc");

    await user.click(
      within(dialog).getByRole("button", { name: "สร้างบัญชีลูกค้า" }),
    );

    expect(
      await screen.findByText("กรุณากรอกวงเงินเครดิตเป็นตัวเลข เช่น 5000.00"),
    ).toBeInTheDocument();
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it("passes the search term to the backend query", async () => {
    const user = userEvent.setup();
    const listCustomers = vi.fn(async () => [makeCustomer()]);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers,
      }),
    );

    renderWithProviders(<CustomersPage />);
    await screen.findByText("ร้านกาแฟดอย");

    await user.type(screen.getByLabelText("ค้นหาลูกค้า"), "ดอย");

    await waitFor(() => {
      expect(listCustomers).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "ดอย" }),
      );
    });
  });

  it("toggles the sort direction when a sortable column is clicked", async () => {
    const user = userEvent.setup();
    const listCustomers = vi.fn(async () => [makeCustomer()]);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listCustomers,
      }),
    );

    renderWithProviders(<CustomersPage />);
    await screen.findByText("ร้านกาแฟดอย");

    await user.click(screen.getByTestId("customers.sort_name_button"));

    await waitFor(() => {
      expect(listCustomers).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: "name", descending: true }),
      );
    });
  });
});
