import type {
  CustomerId,
  CustomerQuery,
  InvoiceId,
  InvoiceQuery,
  NotificationQuery,
  PaymentId,
  PaymentQuery,
  ProductId,
  ProductQuery,
  ProofId,
  ProofQuery,
  ReceiptId,
} from "@/types/app";

/**
 * Central query-key factory. Every hook reads its key from here so mutations can
 * invalidate precisely without guessing at string literals.
 */
export const queryKeys = {
  auth: {
    role: ["auth", "role"] as const,
    isAdmin: ["auth", "isAdmin"] as const,
    myCustomer: ["auth", "myCustomer"] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filter: CustomerQuery) => ["customers", "list", filter] as const,
    detail: (id: CustomerId) => ["customers", "detail", id.toString()] as const,
  },
  products: {
    all: ["products"] as const,
    list: (filter: ProductQuery) => ["products", "list", filter] as const,
    detail: (id: ProductId) => ["products", "detail", id.toString()] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (filter: InvoiceQuery) => ["invoices", "list", filter] as const,
    detail: (id: InvoiceId) => ["invoices", "detail", id.toString()] as const,
    document: (id: InvoiceId) =>
      ["invoices", "document", id.toString()] as const,
    mine: ["invoices", "mine"] as const,
    myDetail: (id: InvoiceId) => ["invoices", "mine", id.toString()] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (filter: PaymentQuery) => ["payments", "list", filter] as const,
    detail: (id: PaymentId) => ["payments", "detail", id.toString()] as const,
    mine: ["payments", "mine"] as const,
  },
  proofs: {
    all: ["proofs"] as const,
    list: (filter: ProofQuery) => ["proofs", "list", filter] as const,
    detail: (id: ProofId) => ["proofs", "detail", id.toString()] as const,
  },
  receipts: {
    all: ["receipts"] as const,
    mine: ["receipts", "mine"] as const,
    myDetail: (id: ReceiptId) => ["receipts", "mine", id.toString()] as const,
    document: (id: ReceiptId) =>
      ["receipts", "document", id.toString()] as const,
  },
  debts: {
    all: ["debts"] as const,
    summary: ["debts", "summary"] as const,
    list: ["debts", "list"] as const,
    customer: (id: CustomerId) => ["debts", "customer", id.toString()] as const,
    notice: (id: CustomerId) => ["debts", "notice", id.toString()] as const,
    mine: ["debts", "mine"] as const,
  },
  notifications: {
    manager: (filter: NotificationQuery) =>
      ["notifications", "manager", filter] as const,
    managerUnread: ["notifications", "manager", "unread"] as const,
    mine: (filter: NotificationQuery) =>
      ["notifications", "mine", filter] as const,
    mineUnread: ["notifications", "mine", "unread"] as const,
  },
} as const;
