import { createActor } from "@/backend";
import { queryKeys } from "@/lib/query-keys";
import type {
  Customer,
  CustomerDetail,
  CustomerId,
  CustomerInput,
  CustomerQuery,
  CustomerSummary,
  CustomerUpdate,
  DebtDetail,
  DebtNoticeDocument,
  DebtRow,
  DebtSummary,
  Invoice,
  InvoiceDetail,
  InvoiceDocument,
  InvoiceId,
  InvoiceInput,
  InvoiceQuery,
  Payment,
  PaymentId,
  PaymentInput,
  PaymentQuery,
  Product,
  ProductId,
  ProductInput,
  ProductQuery,
  ProductUpdate,
  ProofId,
  ProofInput,
  ProofQuery,
  Receipt,
  ReceiptDocument,
  ReceiptId,
  SettingsInput,
  ShopSettings,
  TransferProof,
} from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const NOT_READY = "ยังเชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง";

/* ── Shop settings ─────────────────────────────────────────────── */

export function useSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ShopSettings | null>({
    queryKey: queryKeys.settings.all,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SettingsInput) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.updateSettings(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}

/* ── Customers ─────────────────────────────────────────────────── */

export function useCustomers(filter: CustomerQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CustomerSummary[]>({
    queryKey: queryKeys.customers.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCustomers(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCustomer(id: CustomerId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CustomerDetail | null>({
    queryKey: queryKeys.customers.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.createCustomer(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: CustomerId; input: CustomerUpdate }) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.updateCustomer(id, input);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(variables.id),
      });
    },
  });
}

/**
 * Manager-only: bind a customer's Internet Identity principal to their account.
 * Returns `null` when the customer does not exist.
 */
export function useBindCustomerLogin() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      principal,
    }: { id: CustomerId; principal: Principal }) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.bindCustomerLogin(id, principal);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(variables.id),
      });
    },
  });
}

/**
 * Self-service: bind the signed-in caller's own principal to an unclaimed
 * customer account. Returns `null` when the account is missing or already
 * claimed by another principal.
 */
export function useClaimCustomerAccount() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: CustomerId) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.claimCustomerAccount(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.role });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.myCustomer,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

/* ── Products ──────────────────────────────────────────────────── */

export function useProducts(filter: ProductQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: queryKeys.products.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(id: ProductId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product | null>({
    queryKey: queryKeys.products.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.createProduct(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: ProductId; input: ProductUpdate }) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.updateProduct(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useDeactivateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProductId) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.deactivateProduct(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

/* ── Invoices ──────────────────────────────────────────────────── */

export function useInvoices(filter: InvoiceQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Invoice[]>({
    queryKey: queryKeys.invoices.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listInvoices(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInvoice(id: InvoiceId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<InvoiceDetail | null>({
    queryKey: queryKeys.invoices.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getInvoice(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useInvoiceDocument(id: InvoiceId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<InvoiceDocument | null>({
    queryKey: queryKeys.invoices.document(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getInvoiceDocument(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InvoiceInput) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.createInvoice(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.debts.all });
    },
  });
}

export function useMyInvoices() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Invoice[]>({
    queryKey: queryKeys.invoices.mine,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyInvoice(id: InvoiceId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Invoice | null>({
    queryKey: queryKeys.invoices.myDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMyInvoice(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/* ── Payments ──────────────────────────────────────────────────── */

export function usePayments(filter: PaymentQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Payment[]>({
    queryKey: queryKeys.payments.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPayments(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePayment(id: PaymentId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Payment | null>({
    queryKey: queryKeys.payments.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPayment(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRecordPayment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentInput) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.recordPayment(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.receipts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.debts.all });
    },
  });
}

export function useMyPayments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Payment[]>({
    queryKey: queryKeys.payments.mine,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ── Transfer proofs ───────────────────────────────────────────── */

export function useProofs(filter: ProofQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TransferProof[]>({
    queryKey: queryKeys.proofs.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProofs(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProof(id: ProofId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TransferProof | null>({
    queryKey: queryKeys.proofs.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProof(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useUploadProof() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProofInput) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.uploadProof(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.proofs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useApproveProof() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProofId) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.approveProof(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.proofs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.debts.all });
    },
  });
}

export function useRejectProof() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: ProofId; note: string }) => {
      if (!actor) throw new Error(NOT_READY);
      return actor.rejectProof(id, note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.proofs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

/* ── Receipts ──────────────────────────────────────────────────── */

export function useMyReceipts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Receipt[]>({
    queryKey: queryKeys.receipts.mine,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyReceipts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyReceipt(id: ReceiptId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Receipt | null>({
    queryKey: queryKeys.receipts.myDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMyReceipt(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useReceiptDocument(id: ReceiptId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ReceiptDocument | null>({
    queryKey: queryKeys.receipts.document(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getReceiptDocument(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/* ── Debts ─────────────────────────────────────────────────────── */

export function useDebtSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DebtSummary | null>({
    queryKey: queryKeys.debts.summary,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDebtSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDebtRows() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DebtRow[]>({
    queryKey: queryKeys.debts.list,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDebts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCustomerDebt(customerId: CustomerId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DebtDetail | null>({
    queryKey: queryKeys.debts.customer(customerId ?? 0n),
    queryFn: async () => {
      if (!actor || customerId === null) return null;
      return actor.getCustomerDebt(customerId);
    },
    enabled: !!actor && !isFetching && customerId !== null,
  });
}

export function useDebtNoticeDocument(customerId: CustomerId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DebtNoticeDocument | null>({
    queryKey: queryKeys.debts.notice(customerId ?? 0n),
    queryFn: async () => {
      if (!actor || customerId === null) return null;
      return actor.getDebtNoticeDocument(customerId);
    },
    enabled: !!actor && !isFetching && customerId !== null,
  });
}

export function useMyDebt() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DebtDetail | null>({
    queryKey: queryKeys.debts.mine,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyDebt();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Re-exported so pages can type a customer record without a second import. */
export type { Customer };
