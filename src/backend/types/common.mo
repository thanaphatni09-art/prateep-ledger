module {
  /// Milliseconds since the Unix epoch.
  public type Timestamp = Int;

  /// Monetary amount in satang (1 THB = 100 satang). Integer math only.
  public type Satang = Nat;

  /// Identifier of a customer account.
  public type CustomerId = Nat;

  /// Identifier of a product.
  public type ProductId = Nat;

  /// Identifier of an invoice.
  public type InvoiceId = Nat;

  /// Identifier of a payment.
  public type PaymentId = Nat;

  /// Identifier of an uploaded transfer proof.
  public type ProofId = Nat;

  /// Identifier of a notification.
  public type NotificationId = Nat;

  /// Identifier of a receipt.
  public type ReceiptId = Nat;

  /// Lifecycle state of an invoice.
  public type InvoiceStatus = {
    #unpaid;
    #partiallyPaid;
    #paid;
    #overdue;
  };

  /// Lifecycle state of a payment.
  public type PaymentStatus = {
    #pending;
    #approved;
    #rejected;
  };

  /// Lifecycle state of an uploaded transfer proof. Shares the payment
  /// review lifecycle shape, so it aliases `PaymentStatus`.
  public type ProofStatus = PaymentStatus;

  /// How a payment was made.
  public type PaymentMethod = {
    #cash;
    #bankTransfer;
    #other;
  };

  /// Aging bucket for an outstanding balance.
  public type AgingBucket = {
    #current;
    #days1to30;
    #days31to60;
    #days61to90;
    #over90;
  };

  /// A single aging bucket with its outstanding amount.
  public type AgingBucketAmount = {
    bucket : AgingBucket;
    amount : Satang;
  };

  /// Kind of manager/customer notification.
  public type NotificationKind = {
    #proofUploaded;
    #invoiceOverdue;
    #paymentRecorded;
    #proofApproved;
    #proofRejected;
  };

  /// A notification row.
  public type Notification = {
    id : NotificationId;
    kind : NotificationKind;
    title : Text;
    body : Text;
    createdAt : Timestamp;
    read : Bool;
  };

  /// Shop profile and bank details shown to customers.
  public type ShopSettings = {
    shopName : Text;
    address : Text;
    taxId : Text;
    phone : Text;
    bankName : Text;
    accountName : Text;
    accountNumber : Text;
    promptPayRef : Text;
    invoicePrefix : Text;
    receiptPrefix : Text;
    defaultPaymentTermsDays : Nat;
  };

  /// Caller-visible role in the shop.
  public type AppRole = {
    #manager;
    #customer;
  };

  /// Error returned by domain operations that a caller can act on.
  public type AppError = {
    #notFound : Text;
    #notAuthorized;
    #invalidInput : Text;
    #conflict : Text;
  };
};
