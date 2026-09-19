import Common "common";
import Invoices "invoices";

module {
  public type CustomerId = Common.CustomerId;
  public type Satang = Common.Satang;
  public type Timestamp = Common.Timestamp;

  /// One customer's outstanding debt position.
  public type DebtRow = {
    customerId : CustomerId;
    customerName : Text;
    phone : Text;
    outstandingBalance : Satang;
    aging : [Common.AgingBucketAmount];
    oldestDueAt : ?Timestamp;
    invoiceCount : Nat;
  };

  /// Aggregate debt position across all customers.
  public type DebtSummary = {
    totalOutstanding : Satang;
    customerCount : Nat;
    aging : [Common.AgingBucketAmount];
  };

  /// A single customer's debt detail.
  public type DebtDetail = {
    customerId : CustomerId;
    customerName : Text;
    phone : Text;
    outstandingBalance : Satang;
    aging : [Common.AgingBucketAmount];
    invoices : [Invoices.Invoice];
  };
};
