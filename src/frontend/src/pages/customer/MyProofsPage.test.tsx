import { MyProofsPage } from "@/pages/customer/MyProofsPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import { type Invoice, InvoiceStatus } from "@/types/app";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const putFile = vi.fn(async () => ({ hash: "sha256:abc123" }));

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return {
    ...coreInfraMock,
    loadConfig: vi.fn(async () => ({
      storage_gateway_url: "https://gateway.example",
      backend_canister_id: "aaaaa-aa",
      project_id: "test-project",
      bucket_name: "bucket",
      backend_host: "https://icp.example",
    })),
  };
});

vi.mock("@caffeineai/object-storage", () => ({
  StorageClient: class {
    putFile = putFile;
  },
}));

// jsdom has no real agent transport; the form only needs a non-throwing agent.
vi.mock("@icp-sdk/core/agent", () => ({
  HttpAgent: {
    createSync: vi.fn(() => ({})),
  },
}));

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 3n,
    number: "INV-2569-0003",
    customerId: 1n,
    customerName: "ร้านกาแฟดอย",
    lines: [],
    subtotal: 150000n,
    total: 150000n,
    amountPaid: 0n,
    outstanding: 150000n,
    status: InvoiceStatus.unpaid,
    issuedAt: 0n,
    dueAt: 0n,
    notes: "",
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreInfraMock();
  putFile.mockClear();
  setIdentity({ isAuthenticated: true });
});

describe("MyProofsPage", () => {
  it("lists the signed-in customer's unpaid invoices", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "user"),
        listMyInvoices: vi.fn(async () => [makeInvoice()]),
      }),
    );

    renderWithProviders(<MyProofsPage />);

    expect(await screen.findByText("INV-2569-0003")).toBeInTheDocument();
    expect(screen.getByText("฿1,500.00")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is outstanding", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "user"),
        listMyInvoices: vi.fn(async () => [
          makeInvoice({ outstanding: 0n, status: InvoiceStatus.paid }),
        ]),
      }),
    );

    renderWithProviders(<MyProofsPage />);

    expect(await screen.findByText("ไม่มียอดค้างชำระ")).toBeInTheDocument();
  });

  it("uploads a transfer proof with amount, date, and image", async () => {
    const user = userEvent.setup();
    const uploadProof = vi.fn(async () => ({
      id: 7n,
      invoiceId: 3n,
      invoiceNumber: "INV-2569-0003",
      customerId: 1n,
      customerName: "ร้านกาแฟดอย",
      amount: 150000n,
      transferredAt: 0n,
      imageKey: "sha256:abc123",
      note: "",
      status: { pending: null },
      uploadedAt: 0n,
      reviewedAt: undefined,
      reviewNote: "",
      paymentId: undefined,
    }));
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "user"),
        listMyInvoices: vi.fn(async () => [makeInvoice()]),
        uploadProof,
      }),
    );

    renderWithProviders(<MyProofsPage />);
    await screen.findByText("INV-2569-0003");

    const file = new File(["slip"], "slip.png", { type: "image/png" });
    await user.upload(screen.getByTestId("customer.proof_file_input"), file);

    expect(await screen.findByText("slip.png")).toBeInTheDocument();
    expect(screen.getByTestId("customer.proof_submit_button")).toBeEnabled();

    await user.click(screen.getByTestId("customer.proof_submit_button"));

    await waitFor(() => {
      expect(uploadProof).toHaveBeenCalledTimes(1);
    });
    expect(putFile).toHaveBeenCalledTimes(1);
    expect(uploadProof).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 3n,
        amount: 150000n,
        imageKey: "sha256:abc123",
      }),
    );
    expect(
      await screen.findByText(
        "ส่งหลักฐานเรียบร้อยแล้ว ผู้จัดการร้านจะตรวจสอบและแจ้งผลให้ทราบ",
      ),
    ).toBeInTheDocument();
  });

  it("rejects a non-image file before uploading", async () => {
    // `applyAccept: false` lets a non-image through the input's `accept`
    // filter so the form's own validation is what rejects it.
    const user = userEvent.setup({ applyAccept: false });
    const uploadProof = vi.fn();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "user"),
        listMyInvoices: vi.fn(async () => [makeInvoice()]),
        uploadProof,
      }),
    );

    renderWithProviders(<MyProofsPage />);
    await screen.findByText("INV-2569-0003");

    const file = new File(["not an image"], "notes.txt", {
      type: "text/plain",
    });
    await user.upload(screen.getByTestId("customer.proof_file_input"), file);

    expect(
      await screen.findByText("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG หรือ WEBP)"),
    ).toBeInTheDocument();
    expect(uploadProof).not.toHaveBeenCalled();
  });
});
