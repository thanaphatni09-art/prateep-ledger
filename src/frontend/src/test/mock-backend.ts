import type { backendInterface } from "@/backend";
import { vi } from "vitest";

/**
 * A fully-typed stand-in for the generated `backendInterface`.
 *
 * Every method is a `vi.fn()` so a test can assert on the exact arguments the
 * app sent, and every method has a safe default so a component that queries
 * something the test does not care about still renders. Tests override only the
 * methods they exercise.
 */
export type MockBackend = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

const EMPTY_SETTINGS = {
  shopName: "",
  address: "",
  taxId: "",
  phone: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  promptPayRef: "",
  invoicePrefix: "INV",
  receiptPrefix: "REC",
  defaultPaymentTermsDays: 30n,
};

/**
 * Build a mock actor. `overrides` replace individual methods; anything omitted
 * keeps a benign default (empty list, zero count, null detail).
 */
export function createMockBackend(
  overrides: Partial<Record<keyof backendInterface, unknown>> = {},
): MockBackend {
  const base: Record<string, unknown> = {
    _initialize_access_control: vi.fn(async () => undefined),
    _internet_identity_sign_in_finish: vi.fn(async () => ({
      __kind__: "ok",
      ok: null,
    })),
    _internet_identity_sign_in_start: vi.fn(async () => new Uint8Array()),
    approveProof: vi.fn(async () => null),
    assignCallerUserRole: vi.fn(async () => undefined),
    bindCustomerLogin: vi.fn(async () => null),
    claimCustomerAccount: vi.fn(async () => null),
    countUnreadManagerNotifications: vi.fn(async () => 0n),
    countUnreadMyNotifications: vi.fn(async () => 0n),
    createCustomer: vi.fn(async () => {
      throw new Error("createCustomer not stubbed");
    }),
    createInvoice: vi.fn(async () => {
      throw new Error("createInvoice not stubbed");
    }),
    createProduct: vi.fn(async () => {
      throw new Error("createProduct not stubbed");
    }),
    deactivateProduct: vi.fn(async () => null),
    execute: vi.fn(async () => ({ hasMore: false, rows: [] })),
    getApiDoc: vi.fn(async () => ""),
    getCallerUserRole: vi.fn(async () => "guest"),
    getCustomer: vi.fn(async () => null),
    getCustomerDebt: vi.fn(async () => null),
    getDebtNoticeDocument: vi.fn(async () => null),
    getDebtSummary: vi.fn(async () => ({
      aging: [],
      totalOutstanding: 0n,
      customerCount: 0n,
    })),
    getInvoice: vi.fn(async () => null),
    getInvoiceDocument: vi.fn(async () => null),
    getMyCustomer: vi.fn(async () => null),
    getMyDebt: vi.fn(async () => null),
    getMyInvoice: vi.fn(async () => null),
    getMyReceipt: vi.fn(async () => null),
    getPayment: vi.fn(async () => null),
    getProduct: vi.fn(async () => null),
    getProof: vi.fn(async () => null),
    getReceiptDocument: vi.fn(async () => null),
    getSettings: vi.fn(async () => EMPTY_SETTINGS),
    isCallerAdmin: vi.fn(async () => false),
    listCustomers: vi.fn(async () => []),
    listDebts: vi.fn(async () => []),
    listInvoices: vi.fn(async () => []),
    listManagerNotifications: vi.fn(async () => []),
    listMyInvoices: vi.fn(async () => []),
    listMyNotifications: vi.fn(async () => []),
    listMyPayments: vi.fn(async () => []),
    listMyReceipts: vi.fn(async () => []),
    listPayments: vi.fn(async () => []),
    listProducts: vi.fn(async () => []),
    listProofs: vi.fn(async () => []),
    markAllManagerNotificationsRead: vi.fn(async () => 0n),
    markAllMyNotificationsRead: vi.fn(async () => 0n),
    markManagerNotificationRead: vi.fn(async () => null),
    markMyNotificationRead: vi.fn(async () => null),
    recordPayment: vi.fn(async () => {
      throw new Error("recordPayment not stubbed");
    }),
    rejectProof: vi.fn(async () => null),
    schema: vi.fn(async () => ""),
    updateCustomer: vi.fn(async () => null),
    updateProduct: vi.fn(async () => null),
    updateSettings: vi.fn(async () => EMPTY_SETTINGS),
    uploadProof: vi.fn(async () => {
      throw new Error("uploadProof not stubbed");
    }),
  };

  for (const [key, value] of Object.entries(overrides)) {
    base[key] = value;
  }

  return base as unknown as MockBackend;
}
