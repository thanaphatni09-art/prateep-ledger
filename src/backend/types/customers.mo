import Common "common";

module {
  public type CustomerId = Common.CustomerId;
  public type Timestamp = Common.Timestamp;
  public type Satang = Common.Satang;

  /// A customer account created by the manager.
  public type Customer = {
    id : CustomerId;
    name : Text;
    phone : Text;
    address : Text;
    creditLimit : Satang;
    notes : Text;
    /// Principal provisioned as the customer's login account.
    loginPrincipal : ?Principal;
    active : Bool;
    createdAt : Timestamp;
  };

  /// Customer row with derived balance figures for list views.
  public type CustomerSummary = {
    id : CustomerId;
    name : Text;
    phone : Text;
    address : Text;
    creditLimit : Satang;
    notes : Text;
    loginPrincipal : ?Principal;
    active : Bool;
    createdAt : Timestamp;
    outstandingBalance : Satang;
    invoiceCount : Nat;
  };

  /// Full customer detail view.
  public type CustomerDetail = {
    customer : Customer;
    outstandingBalance : Satang;
    aging : [Common.AgingBucketAmount];
    invoiceCount : Nat;
    paymentCount : Nat;
  };

  /// Input for creating a customer account.
  public type CustomerInput = {
    name : Text;
    phone : Text;
    address : Text;
    creditLimit : Satang;
    notes : Text;
  };

  /// Input for editing an existing customer account.
  public type CustomerUpdate = {
    name : Text;
    phone : Text;
    address : Text;
    creditLimit : Satang;
    notes : Text;
    active : Bool;
  };

  /// Search and sort options for the customer list.
  public type CustomerQuery = {
    search : ?Text;
    sortBy : ?Text;
    descending : ?Bool;
  };
};
