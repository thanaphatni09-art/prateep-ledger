import Common "common";

module {
  public type InvoiceId = Common.InvoiceId;
  public type PaymentId = Common.PaymentId;
  public type CustomerId = Common.CustomerId;
  public type Timestamp = Common.Timestamp;
  public type Satang = Common.Satang;

  /// A printable document header block.
  public type DocumentHeader = {
    shopName : Text;
    address : Text;
    taxId : Text;
    phone : Text;
  };

  /// A printable line on a document.
  public type DocumentLine = {
    description : Text;
    unit : Text;
    quantity : Nat;
    unitPrice : Satang;
    lineTotal : Satang;
  };

  /// A printable invoice document in Thai layout.
  public type InvoiceDocument = {
    header : DocumentHeader;
    number : Text;
    issuedAt : Timestamp;
    dueAt : Timestamp;
    customerName : Text;
    customerAddress : Text;
    customerPhone : Text;
    lines : [DocumentLine];
    subtotal : Satang;
    total : Satang;
    amountPaid : Satang;
    outstanding : Satang;
    amountInWords : Text;
    notes : Text;
  };

  /// A printable receipt document in Thai layout.
  public type ReceiptDocument = {
    header : DocumentHeader;
    number : Text;
    issuedAt : Timestamp;
    customerName : Text;
    customerAddress : Text;
    invoiceNumber : Text;
    amount : Satang;
    amountInWords : Text;
    method : Common.PaymentMethod;
    reference : Text;
  };

  /// A printable debt notice document in Thai layout.
  public type DebtNoticeDocument = {
    header : DocumentHeader;
    customerName : Text;
    customerAddress : Text;
    customerPhone : Text;
    issuedAt : Timestamp;
    outstandingBalance : Satang;
    amountInWords : Text;
    aging : [Common.AgingBucketAmount];
    invoices : [DocumentLine];
    bankName : Text;
    accountName : Text;
    accountNumber : Text;
    promptPayRef : Text;
  };
};
