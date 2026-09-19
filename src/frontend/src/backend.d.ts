import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AgingBucketAmount {
    bucket: AgingBucket;
    amount: Satang;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface Customer {
    id: CustomerId;
    loginPrincipal?: Principal;
    active: boolean;
    name: string;
    createdAt: Timestamp;
    creditLimit: Satang;
    address: string;
    notes: string;
    phone: string;
}
export interface CustomerDetail {
    aging: Array<AgingBucketAmount>;
    customer: Customer;
    invoiceCount: bigint;
    outstandingBalance: Satang;
    paymentCount: bigint;
}
export type CustomerId = bigint;
export interface CustomerInput {
    name: string;
    creditLimit: Satang;
    address: string;
    notes: string;
    phone: string;
}
export interface CustomerQuery {
    descending?: boolean;
    sortBy?: string;
    search?: string;
}
export interface CustomerSummary {
    id: CustomerId;
    loginPrincipal?: Principal;
    active: boolean;
    invoiceCount: bigint;
    name: string;
    createdAt: Timestamp;
    creditLimit: Satang;
    address: string;
    notes: string;
    outstandingBalance: Satang;
    phone: string;
}
export interface CustomerUpdate {
    active: boolean;
    name: string;
    creditLimit: Satang;
    address: string;
    notes: string;
    phone: string;
}
export interface DebtDetail {
    customerName: string;
    aging: Array<AgingBucketAmount>;
    invoices: Array<Invoice>;
    outstandingBalance: Satang;
    customerId: CustomerId;
    phone: string;
}
export interface DebtNoticeDocument {
    customerName: string;
    aging: Array<AgingBucketAmount>;
    customerPhone: string;
    promptPayRef: string;
    bankName: string;
    accountName: string;
    customerAddress: string;
    invoices: Array<DocumentLine>;
    outstandingBalance: Satang;
    accountNumber: string;
    issuedAt: Timestamp;
    amountInWords: string;
    header: DocumentHeader;
}
export interface DebtRow {
    customerName: string;
    aging: Array<AgingBucketAmount>;
    invoiceCount: bigint;
    oldestDueAt?: Timestamp;
    outstandingBalance: Satang;
    customerId: CustomerId;
    phone: string;
}
export interface DebtSummary {
    aging: Array<AgingBucketAmount>;
    totalOutstanding: Satang;
    customerCount: bigint;
}
export interface DocumentHeader {
    taxId: string;
    address: string;
    shopName: string;
    phone: string;
}
export interface DocumentLine {
    unit: string;
    lineTotal: Satang;
    description: string;
    quantity: bigint;
    unitPrice: Satang;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Invoice {
    id: InvoiceId;
    customerName: string;
    status: InvoiceStatus;
    total: Satang;
    outstanding: Satang;
    lines: Array<InvoiceLine>;
    amountPaid: Satang;
    notes: string;
    number: string;
    customerId: CustomerId;
    issuedAt: Timestamp;
    dueAt: Timestamp;
    subtotal: Satang;
}
export interface InvoiceDetail {
    proofIds: Array<ProofId>;
    payments: Array<Payment>;
    invoice: Invoice;
}
export interface InvoiceDocument {
    customerName: string;
    total: Satang;
    customerPhone: string;
    outstanding: Satang;
    lines: Array<DocumentLine>;
    amountPaid: Satang;
    customerAddress: string;
    notes: string;
    number: string;
    issuedAt: Timestamp;
    dueAt: Timestamp;
    amountInWords: string;
    subtotal: Satang;
    header: DocumentHeader;
}
export type InvoiceId = bigint;
export interface InvoiceInput {
    lines: Array<InvoiceLineInput>;
    notes: string;
    customerId: CustomerId;
    issuedAt: Timestamp;
    dueAt: Timestamp;
}
export interface InvoiceLine {
    unit: string;
    lineTotal: Satang;
    productId: ProductId;
    productName: string;
    quantity: bigint;
    unitPrice: Satang;
}
export interface InvoiceLineInput {
    productId: ProductId;
    quantity: bigint;
}
export interface InvoiceQuery {
    status?: InvoiceStatus;
    search?: string;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    customerId?: CustomerId;
}
export interface Notification {
    id: NotificationId;
    title: string;
    body: string;
    kind: NotificationKind;
    createdAt: Timestamp;
    read: boolean;
}
export type NotificationId = bigint;
export interface NotificationQuery {
    limit?: bigint;
    unreadOnly?: boolean;
}
export interface Payment {
    id: PaymentId;
    customerName: string;
    status: PaymentStatus;
    method: PaymentMethod;
    createdAt: Timestamp;
    reference: string;
    invoiceId: InvoiceId;
    invoiceNumber: string;
    customerId: CustomerId;
    amount: Satang;
    paidAt: Timestamp;
    proofId?: ProofId;
}
export type PaymentId = bigint;
export interface PaymentInput {
    method: PaymentMethod;
    reference: string;
    invoiceId: InvoiceId;
    amount: Satang;
    paidAt: Timestamp;
}
export interface PaymentQuery {
    status?: PaymentStatus;
    search?: string;
    customerId?: CustomerId;
}
export interface Product {
    id: ProductId;
    sku: string;
    active: boolean;
    name: string;
    createdAt: Timestamp;
    unit: string;
    category: string;
    unitPrice: Satang;
}
export type ProductId = bigint;
export interface ProductInput {
    sku: string;
    name: string;
    unit: string;
    category: string;
    unitPrice: Satang;
}
export interface ProductQuery {
    search?: string;
    category?: string;
    activeOnly?: boolean;
}
export interface ProductUpdate {
    sku: string;
    active: boolean;
    name: string;
    unit: string;
    category: string;
    unitPrice: Satang;
}
export type ProofId = bigint;
export interface ProofInput {
    note: string;
    invoiceId: InvoiceId;
    imageKey: string;
    transferredAt: Timestamp;
    amount: Satang;
}
export interface ProofQuery {
    status?: ProofStatus;
    customerId?: CustomerId;
}
export interface Receipt {
    id: ReceiptId;
    customerName: string;
    method: PaymentMethod;
    reference: string;
    invoiceId: InvoiceId;
    invoiceNumber: string;
    number: string;
    paymentId: PaymentId;
    customerId: CustomerId;
    issuedAt: Timestamp;
    amount: Satang;
    paidAt: Timestamp;
}
export interface ReceiptDocument {
    customerName: string;
    method: PaymentMethod;
    reference: string;
    invoiceNumber: string;
    customerAddress: string;
    number: string;
    issuedAt: Timestamp;
    amount: Satang;
    amountInWords: string;
    header: DocumentHeader;
}
export type ReceiptId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Satang = bigint;
export interface SettingsInput {
    taxId: string;
    defaultPaymentTermsDays: bigint;
    promptPayRef: string;
    bankName: string;
    accountName: string;
    invoicePrefix: string;
    address: string;
    shopName: string;
    accountNumber: string;
    phone: string;
    receiptPrefix: string;
}
export interface ShopSettings {
    taxId: string;
    defaultPaymentTermsDays: bigint;
    promptPayRef: string;
    bankName: string;
    accountName: string;
    invoicePrefix: string;
    address: string;
    shopName: string;
    accountNumber: string;
    phone: string;
    receiptPrefix: string;
}
export type Timestamp = bigint;
export interface TransferProof {
    id: ProofId;
    customerName: string;
    status: ProofStatus;
    note: string;
    invoiceId: InvoiceId;
    reviewNote: string;
    reviewedAt?: Timestamp;
    imageKey: string;
    invoiceNumber: string;
    paymentId?: PaymentId;
    customerId: CustomerId;
    transferredAt: Timestamp;
    amount: Satang;
    uploadedAt: Timestamp;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum AgingBucket {
    days1to30 = "days1to30",
    over90 = "over90",
    days31to60 = "days31to60",
    current = "current",
    days61to90 = "days61to90"
}
export enum InvoiceStatus {
    paid = "paid",
    unpaid = "unpaid",
    overdue = "overdue",
    partiallyPaid = "partiallyPaid"
}
export enum NotificationKind {
    invoiceOverdue = "invoiceOverdue",
    paymentRecorded = "paymentRecorded",
    proofApproved = "proofApproved",
    proofRejected = "proofRejected",
    proofUploaded = "proofUploaded"
}
export enum PaymentMethod {
    other = "other",
    cash = "cash",
    bankTransfer = "bankTransfer"
}
export enum PaymentStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ProofStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Approve a proof, creating the linked payment.
     */
    approveProof(id: ProofId): Promise<TransferProof | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Bind a login principal to a customer account (manager only).
     */
    bindCustomerLogin(id: CustomerId, principal: Principal): Promise<Customer | null>;
    /**
     * / Bind the signed-in caller's own principal to an unclaimed customer account.
     */
    claimCustomerAccount(id: CustomerId): Promise<Customer | null>;
    /**
     * / Count unread manager notifications.
     */
    countUnreadManagerNotifications(): Promise<bigint>;
    /**
     * / Count unread notifications for the signed-in customer.
     */
    countUnreadMyNotifications(): Promise<bigint>;
    /**
     * / Create a customer account with a provisioned login.
     */
    createCustomer(input: CustomerInput): Promise<Customer>;
    /**
     * / Create an invoice for a customer.
     */
    createInvoice(input: InvoiceInput): Promise<Invoice>;
    /**
     * / Create a product.
     */
    createProduct(input: ProductInput): Promise<Product>;
    /**
     * / Deactivate a product without deleting its invoice history.
     */
    deactivateProduct(id: ProductId): Promise<Product | null>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Fetch a customer detail view.
     */
    getCustomer(id: CustomerId): Promise<CustomerDetail | null>;
    /**
     * / Fetch one customer's debt detail.
     */
    getCustomerDebt(customerId: CustomerId): Promise<DebtDetail | null>;
    /**
     * / Build the printable debt notice document for a customer.
     */
    getDebtNoticeDocument(customerId: CustomerId): Promise<DebtNoticeDocument | null>;
    /**
     * / Aggregate outstanding balance and aging across all customers.
     */
    getDebtSummary(): Promise<DebtSummary>;
    /**
     * / Fetch an invoice detail view.
     */
    getInvoice(id: InvoiceId): Promise<InvoiceDetail | null>;
    /**
     * / Build the printable invoice document for an invoice.
     */
    getInvoiceDocument(id: InvoiceId): Promise<InvoiceDocument | null>;
    /**
     * / Resolve the signed-in caller's own customer account.
     */
    getMyCustomer(): Promise<Customer | null>;
    /**
     * / Fetch the signed-in customer's own debt detail.
     */
    getMyDebt(): Promise<DebtDetail | null>;
    /**
     * / Fetch one of the signed-in customer's own invoices.
     */
    getMyInvoice(id: InvoiceId): Promise<Invoice | null>;
    /**
     * / Fetch one of the signed-in customer's own receipts.
     */
    getMyReceipt(id: ReceiptId): Promise<Receipt | null>;
    /**
     * / Fetch a single payment.
     */
    getPayment(id: PaymentId): Promise<Payment | null>;
    /**
     * / Fetch a single product.
     */
    getProduct(id: ProductId): Promise<Product | null>;
    /**
     * / Fetch a single transfer proof.
     */
    getProof(id: ProofId): Promise<TransferProof | null>;
    /**
     * / Build the printable receipt document for a receipt.
     */
    getReceiptDocument(id: ReceiptId): Promise<ReceiptDocument | null>;
    /**
     * / Read the shop profile and bank details.
     */
    getSettings(): Promise<ShopSettings>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List customers with search and sort applied.
     */
    listCustomers(filter: CustomerQuery): Promise<Array<CustomerSummary>>;
    /**
     * / List every customer with an outstanding balance.
     */
    listDebts(): Promise<Array<DebtRow>>;
    /**
     * / List invoices with search, status, and date-range filters applied.
     */
    listInvoices(filter: InvoiceQuery): Promise<Array<Invoice>>;
    /**
     * / List notifications for the manager.
     */
    listManagerNotifications(filter: NotificationQuery): Promise<Array<Notification>>;
    /**
     * / List the signed-in customer's own invoices.
     */
    listMyInvoices(): Promise<Array<Invoice>>;
    /**
     * / List notifications for the signed-in customer.
     */
    listMyNotifications(filter: NotificationQuery): Promise<Array<Notification>>;
    /**
     * / List the signed-in customer's own payments.
     */
    listMyPayments(): Promise<Array<Payment>>;
    /**
     * / List the signed-in customer's own receipts.
     */
    listMyReceipts(): Promise<Array<Receipt>>;
    /**
     * / List payments with search and status filter applied.
     */
    listPayments(filter: PaymentQuery): Promise<Array<Payment>>;
    /**
     * / List products with search and category filter applied.
     */
    listProducts(filter: ProductQuery): Promise<Array<Product>>;
    /**
     * / List transfer proofs awaiting or already reviewed.
     */
    listProofs(filter: ProofQuery): Promise<Array<TransferProof>>;
    /**
     * / Mark every manager notification as read.
     */
    markAllManagerNotificationsRead(): Promise<bigint>;
    /**
     * / Mark every notification of the signed-in customer as read.
     */
    markAllMyNotificationsRead(): Promise<bigint>;
    /**
     * / Mark one manager notification as read.
     */
    markManagerNotificationRead(id: NotificationId): Promise<Notification | null>;
    /**
     * / Mark one of the signed-in customer's notifications as read.
     */
    markMyNotificationRead(id: NotificationId): Promise<Notification | null>;
    /**
     * / Record a manual payment against an invoice.
     */
    recordPayment(input: PaymentInput): Promise<Payment>;
    /**
     * / Reject a proof, leaving the invoice balance unchanged.
     */
    rejectProof(id: ProofId, note: string): Promise<TransferProof | null>;
    schema(): Promise<string>;
    /**
     * / Edit an existing customer account.
     */
    updateCustomer(id: CustomerId, input: CustomerUpdate): Promise<Customer | null>;
    /**
     * / Edit an existing product.
     */
    updateProduct(id: ProductId, input: ProductUpdate): Promise<Product | null>;
    /**
     * / Update the shop profile, bank details, and numbering settings.
     */
    updateSettings(input: SettingsInput): Promise<ShopSettings>;
    /**
     * / Upload a bank-transfer proof against an invoice.
     */
    uploadProof(input: ProofInput): Promise<TransferProof>;
}
