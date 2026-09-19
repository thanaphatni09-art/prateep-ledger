import { PaymentsPage } from "@/pages/manager/PaymentsPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import {
  type Payment,
  PaymentMethod,
  PaymentStatus,
  ProofStatus,
  type TransferProof,
} from "@/types/app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1n,
    invoiceId: 5n,
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
    ...overrides,
  };
}

function makeProof(overrides: Partial<TransferProof> = {}): TransferProof {
  return {
    id: 7n,
    invoiceId: 5n,
    invoiceNumber: "INV-2569-0005",
    customerId: 1n,
    customerName: "ร้านกาแฟดอย",
    amount: 150000n,
    transferredAt: 0n,
    imageKey: "sha256:abc123",
    note: "โอนแล้วครับ",
    status: ProofStatus.pending,
    uploadedAt: 0n,
    reviewedAt: undefined,
    reviewNote: "",
    paymentId: undefined,
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

/** The router mounts asynchronously; wait for the page shell before interacting. */
async function openProofsTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByTestId("payments.proofs_tab"));
}

describe("PaymentsPage", () => {
  it("lists ledger payments with amount in THB and status", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listPayments: vi.fn(async () => [makePayment()]),
      }),
    );

    renderWithProviders(<PaymentsPage />);

    expect(await screen.findByText("ร้านกาแฟดอย")).toBeInTheDocument();
    expect(screen.getByText("INV-2569-0005")).toBeInTheDocument();
    expect(screen.getByText("฿500.00")).toBeInTheDocument();
    expect(screen.getByTestId("status.badge")).toHaveTextContent("ชำระแล้ว");
  });

  it("shows an empty state when there are no payments", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listPayments: vi.fn(async () => []),
      }),
    );

    renderWithProviders(<PaymentsPage />);

    expect(await screen.findByText("ไม่พบรายการชำระเงิน")).toBeInTheDocument();
  });

  it("passes the search term to the payments query", async () => {
    const user = userEvent.setup();
    const listPayments = vi.fn(async () => [makePayment()]);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listPayments,
      }),
    );

    renderWithProviders(<PaymentsPage />);
    await screen.findByText("ร้านกาแฟดอย");

    await user.type(screen.getByLabelText("ค้นหาการชำระเงิน"), "INV-2569");

    await waitFor(() => {
      expect(listPayments).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "INV-2569" }),
      );
    });
  });

  it("lists transfer proofs awaiting review in the proofs tab", async () => {
    const user = userEvent.setup();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProofs: vi.fn(async () => [makeProof()]),
      }),
    );

    renderWithProviders(<PaymentsPage />);
    await openProofsTab(user);

    const table = await screen.findByTestId("payments.proof_table");
    expect(within(table).getByText("ร้านกาแฟดอย")).toBeInTheDocument();
    expect(within(table).getByText("INV-2569-0005")).toBeInTheDocument();
    expect(within(table).getByText("฿1,500.00")).toBeInTheDocument();
  });

  it("shows an empty state when no proofs have been uploaded", async () => {
    const user = userEvent.setup();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProofs: vi.fn(async () => []),
      }),
    );

    renderWithProviders(<PaymentsPage />);
    await openProofsTab(user);

    expect(await screen.findByText("ไม่มีหลักฐานการโอน")).toBeInTheDocument();
  });

  it("opens the review panel when a proof is selected", async () => {
    const user = userEvent.setup();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProofs: vi.fn(async () => [makeProof()]),
      }),
    );

    renderWithProviders(<PaymentsPage />);
    await openProofsTab(user);
    await user.click(await screen.findByTestId("payments.review_button.1"));

    expect(
      await screen.findByTestId("proof.approve_button"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("proof.amount")).toHaveTextContent("฿1,500.00");
  });

  it("approves the selected proof through the backend", async () => {
    const user = userEvent.setup();
    const approveProof = vi.fn(async () => null);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProofs: vi.fn(async () => [makeProof()]),
        approveProof,
      }),
    );

    renderWithProviders(<PaymentsPage />);
    await openProofsTab(user);
    await user.click(await screen.findByTestId("payments.review_button.1"));
    await user.click(await screen.findByTestId("proof.approve_button"));

    await waitFor(() => {
      expect(approveProof).toHaveBeenCalledTimes(1);
    });
    expect(approveProof).toHaveBeenCalledWith(7n);
  });

  it("rejects the selected proof with the entered reason", async () => {
    const user = userEvent.setup();
    const rejectProof = vi.fn(async () => null);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listProofs: vi.fn(async () => [makeProof()]),
        rejectProof,
      }),
    );

    renderWithProviders(<PaymentsPage />);
    await openProofsTab(user);
    await user.click(await screen.findByTestId("payments.review_button.1"));

    await user.click(await screen.findByTestId("proof.reject_button"));
    await user.type(
      screen.getByTestId("proof.reject_note_textarea"),
      "ยอดโอนไม่ตรงกับใบแจ้งหนี้",
    );
    await user.click(screen.getByTestId("proof.confirm_reject_button"));

    await waitFor(() => {
      expect(rejectProof).toHaveBeenCalledTimes(1);
    });
    expect(rejectProof).toHaveBeenCalledWith(7n, "ยอดโอนไม่ตรงกับใบแจ้งหนี้");
  });
});
