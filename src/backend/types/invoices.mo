import Common "common";
import Customers "customers";
import Products "products";
import Payments "payments";

module {
  public type InvoiceId = Common.InvoiceId;
  public type CustomerId = Common.CustomerId;
  public type ProductId = Common.ProductId;
  public type Timestamp = Common.Timestamp;
  public type Satang = Common.Satang;
  public type InvoiceStatus = Common.InvoiceStatus;

  /// One line on an invoice.
  public type InvoiceLine = {
    productId : ProductId;
    productName : Text;
    unit : Text;
    quantity : Nat;
    unitPrice : Satang;
    lineTotal : Satang;
  };

  /// An invoice issued to a customer.
  public type Invoice = {
    id : InvoiceId;
    number : Text;
    customerId : CustomerId;
    customerName : Text;
    lines : [InvoiceLine];
    subtotal : Satang;
    total : Satang;
    amountPaid : Satang;
    outstanding : Satang;
    status : InvoiceStatus;
    issuedAt : Timestamp;
    dueAt : Timestamp;
    notes : Text;
  };

  /// Input line when creating an invoice.
  public type InvoiceLineInput = {
    productId : ProductId;
    quantity : Nat;
  };

  /// Input for creating an invoice.
  public type InvoiceInput = {
    customerId : CustomerId;
    lines : [InvoiceLineInput];
    issuedAt : Timestamp;
    dueAt : Timestamp;
    notes : Text;
  };

  /// Search and filter options for the invoice list.
  public type InvoiceQuery = {
    search : ?Text;
    status : ?InvoiceStatus;
    customerId : ?CustomerId;
    fromDate : ?Timestamp;
    toDate : ?Timestamp;
  };

  /// Invoice detail with linked payments and proofs.
  public type InvoiceDetail = {
    invoice : Invoice;
    payments : [Payments.Payment];
    proofIds : [Common.ProofId];
  };
};
