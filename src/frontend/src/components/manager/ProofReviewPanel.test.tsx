import { ProofReviewPanel } from "@/components/manager/ProofReviewPanel";
import { ProofStatus, type TransferProof } from "@/types/app";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

function makeProof(overrides: Partial<TransferProof> = {}): TransferProof {
  return {
    id: 7n,
    invoiceId: 3n,
    invoiceNumber: "INV-2569-0003",
    customerId: 1n,
    customerName: "ร้านกาแฟดอย",
    amount: 150000n,
    transferredAt: BigInt(new Date(2026, 8, 18, 10, 30).getTime()) * 1_000_000n,
    imageKey: "blob-hash",
    note: "โอนแล้วครับ",
    status: ProofStatus.pending,
    uploadedAt: BigInt(new Date(2026, 8, 18, 11, 0).getTime()) * 1_000_000n,
    reviewNote: "",
    ...overrides,
  };
}

function renderPanel(overrides: Partial<TransferProof> = {}) {
  const onApprove = vi.fn();
  const onReject = vi.fn();
  render(
    <ProofReviewPanel
      proof={makeProof(overrides)}
      onApprove={onApprove}
      onReject={onReject}
      isApproving={false}
      isRejecting={false}
    />,
  );
  return { onApprove, onReject };
}

describe("ProofReviewPanel", () => {
  it("shows the customer, invoice, and transferred amount in THB", () => {
    renderPanel();

    expect(screen.getByText("ร้านกาแฟดอย")).toBeInTheDocument();
    expect(screen.getByText("ใบแจ้งหนี้ INV-2569-0003")).toBeInTheDocument();
    expect(screen.getByTestId("proof.amount")).toHaveTextContent("฿1,500.00");
  });

  it("calls onApprove when the manager approves a pending proof", async () => {
    const user = userEvent.setup();
    const { onApprove, onReject } = renderPanel();

    await user.click(screen.getByTestId("proof.approve_button"));

    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
  });

  it("requires a reason before confirming a rejection", async () => {
    const user = userEvent.setup();
    const { onReject } = renderPanel();

    await user.click(screen.getByTestId("proof.reject_button"));

    const confirm = screen.getByTestId("proof.confirm_reject_button");
    expect(confirm).toBeDisabled();

    await user.type(
      screen.getByTestId("proof.reject_note_textarea"),
      "ยอดโอนไม่ตรงกับใบแจ้งหนี้",
    );
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onReject).toHaveBeenCalledWith("ยอดโอนไม่ตรงกับใบแจ้งหนี้");
  });

  it("hides the action buttons once a proof is approved", () => {
    renderPanel({ status: ProofStatus.approved, reviewNote: "ยอดถูกต้อง" });

    expect(
      screen.getByText("อนุมัติแล้ว — ยอดชำระถูกบันทึกเข้าระบบ"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("proof.approve_button"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("proof.reject_button")).not.toBeInTheDocument();
  });

  it("shows the rejection reason and leaves the balance unchanged", () => {
    renderPanel({ status: ProofStatus.rejected, reviewNote: "สลิปไม่ชัดเจน" });

    expect(
      screen.getByText("ปฏิเสธแล้ว — ยอดคงค้างไม่เปลี่ยนแปลง"),
    ).toBeInTheDocument();
    expect(screen.getByText("สลิปไม่ชัดเจน")).toBeInTheDocument();
    expect(
      screen.queryByTestId("proof.approve_button"),
    ).not.toBeInTheDocument();
  });

  it("surfaces a review error message", () => {
    render(
      <ProofReviewPanel
        proof={makeProof()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
        isRejecting={false}
        errorMessage="อนุมัติไม่สำเร็จ"
      />,
    );

    expect(screen.getByTestId("proof.review_error")).toHaveTextContent(
      "อนุมัติไม่สำเร็จ",
    );
  });
});
