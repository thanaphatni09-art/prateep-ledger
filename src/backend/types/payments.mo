import Common "common";

module {
  public type PaymentId = Common.PaymentId;
  public type InvoiceId = Common.InvoiceId;
  public type CustomerId = Common.CustomerId;
  public type ProofId = Common.ProofId;
  public type Timestamp = Common.Timestamp;
  public type Satang = Common.Satang;
  public type PaymentStatus = Common.PaymentStatus;
  public type PaymentMethod = Common.PaymentMethod;
  public type ProofStatus = Common.ProofStatus;

  /// A payment recorded against an invoice.
  public type Payment = {
    id : PaymentId;
    invoiceId : InvoiceId;
    invoiceNumber : Text;
    customerId : CustomerId;
    customerName : Text;
    amount : Satang;
    paidAt : Timestamp;
    method : PaymentMethod;
    reference : Text;
    status : PaymentStatus;
    /// Set when the payment originated from an uploaded transfer proof.
    proofId : ?ProofId;
    createdAt : Timestamp;
  };

  /// Input for recording a manual payment.
  public type PaymentInput = {
    invoiceId : InvoiceId;
    amount : Satang;
    paidAt : Timestamp;
    method : PaymentMethod;
    reference : Text;
  };

  /// Search and filter options for the payment list.
  public type PaymentQuery = {
    search : ?Text;
    status : ?PaymentStatus;
    customerId : ?CustomerId;
  };

  /// A customer-uploaded bank-transfer proof.
  public type TransferProof = {
    id : ProofId;
    invoiceId : InvoiceId;
    invoiceNumber : Text;
    customerId : CustomerId;
    customerName : Text;
    amount : Satang;
    transferredAt : Timestamp;
    /// Platform file-storage key for the proof image.
    imageKey : Text;
    note : Text;
    status : ProofStatus;
    uploadedAt : Timestamp;
    reviewedAt : ?Timestamp;
    reviewNote : Text;
    /// Payment created when the proof was approved.
    paymentId : ?PaymentId;
  };

  /// Input for uploading a transfer proof.
  public type ProofInput = {
    invoiceId : InvoiceId;
    amount : Satang;
    transferredAt : Timestamp;
    imageKey : Text;
    note : Text;
  };

  /// Search and filter options for the proof review list.
  public type ProofQuery = {
    status : ?ProofStatus;
    customerId : ?CustomerId;
  };

  /// A receipt issued for an approved payment.
  public type Receipt = {
    id : Common.ReceiptId;
    number : Text;
    paymentId : PaymentId;
    invoiceId : InvoiceId;
    invoiceNumber : Text;
    customerId : CustomerId;
    customerName : Text;
    amount : Satang;
    paidAt : Timestamp;
    method : PaymentMethod;
    reference : Text;
    issuedAt : Timestamp;
  };
};
