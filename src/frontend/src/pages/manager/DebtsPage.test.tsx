import { DebtsPage } from "@/pages/manager/DebtsPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import { AgingBucket, type DebtRow, type DebtSummary } from "@/types/app";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

const SUMMARY: DebtSummary = {
  totalOutstanding: 250000n,
  customerCount: 2n,
  aging: [
    { bucket: AgingBucket.current, amount: 100000n },
    { bucket: AgingBucket.days31to60, amount: 150000n },
  ],
};

const ROWS: DebtRow[] = [
  {
    customerId: 1n,
    customerName: "ร้านกาแฟดอย",
    phone: "0812345678",
    invoiceCount: 2n,
    oldestDueAt: 0n,
    outstandingBalance: 100000n,
    aging: [{ bucket: AgingBucket.current, amount: 100000n }],
  },
  {
    customerId: 2n,
    customerName: "ร้านค้าภูเขา",
    phone: "0899999999",
    invoiceCount: 1n,
    oldestDueAt: 0n,
    outstandingBalance: 150000n,
    aging: [{ bucket: AgingBucket.days31to60, amount: 150000n }],
  },
];

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("DebtsPage", () => {
  it("lists each customer's outstanding balance and the total owed", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getDebtSummary: vi.fn(async () => SUMMARY),
        listDebts: vi.fn(async () => ROWS),
      }),
    );

    renderWithProviders(<DebtsPage />);

    expect(await screen.findByText("ร้านกาแฟดอย")).toBeInTheDocument();
    expect(screen.getByText("ร้านค้าภูเขา")).toBeInTheDocument();
    expect(screen.getByTestId("debts.total_outstanding")).toHaveTextContent(
      "฿2,500.00",
    );

    const table = screen.getByTestId("debts.table");
    expect(within(table).getByText("฿1,000.00")).toBeInTheDocument();
    expect(within(table).getByText("฿1,500.00")).toBeInTheDocument();
  });

  it("renders the aging buckets with Thai labels", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getDebtSummary: vi.fn(async () => SUMMARY),
        listDebts: vi.fn(async () => ROWS),
      }),
    );

    renderWithProviders(<DebtsPage />);

    expect(await screen.findByText("ยังไม่ครบกำหนด")).toBeInTheDocument();
    expect(screen.getByText("31–60 วัน")).toBeInTheDocument();
  });

  it("shows an empty state when no customer owes anything", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getDebtSummary: vi.fn(async () => ({
          totalOutstanding: 0n,
          customerCount: 0n,
          aging: [],
        })),
        listDebts: vi.fn(async () => []),
      }),
    );

    renderWithProviders(<DebtsPage />);

    expect(await screen.findByText("ไม่มีลูกหนี้คงค้าง")).toBeInTheDocument();
    expect(screen.getByTestId("debts.total_outstanding")).toHaveTextContent(
      "฿0.00",
    );
  });
});
