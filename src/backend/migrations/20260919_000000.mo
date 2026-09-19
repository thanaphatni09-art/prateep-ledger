import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Timestamp = Int;
  type Satang = Nat;

  type InvoiceStatus = { #unpaid; #partiallyPaid; #paid; #overdue };
  type PaymentStatus = { #pending; #approved; #rejected };
  type ProofStatus = { #pending; #approved; #rejected };
  type PaymentMethod = { #cash; #bankTransfer; #other };
  type NotificationKind = {
    #proofUploaded;
    #invoiceOverdue;
    #paymentRecorded;
    #proofApproved;
    #proofRejected;
  };

  type Notification = {
    id : Nat;
    kind : NotificationKind;
    title : Text;
    body : Text;
    createdAt : Timestamp;
    read : Bool;
  };

  type ShopSettings = {
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

  type Customer = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    creditLimit : Satang;
    notes : Text;
    loginPrincipal : ?Principal;
    active : Bool;
    createdAt : Timestamp;
  };

  type Product = {
    id : Nat;
    name : Text;
    sku : Text;
    unit : Text;
    unitPrice : Satang;
    category : Text;
    active : Bool;
    createdAt : Timestamp;
  };

  type InvoiceLine = {
    productId : Nat;
    productName : Text;
    unit : Text;
    quantity : Nat;
    unitPrice : Satang;
    lineTotal : Satang;
  };

  type Invoice = {
    id : Nat;
    number : Text;
    customerId : Nat;
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

  type Payment = {
    id : Nat;
    invoiceId : Nat;
    invoiceNumber : Text;
    customerId : Nat;
    customerName : Text;
    amount : Satang;
    paidAt : Timestamp;
    method : PaymentMethod;
    reference : Text;
    status : PaymentStatus;
    proofId : ?Nat;
    createdAt : Timestamp;
  };

  type TransferProof = {
    id : Nat;
    invoiceId : Nat;
    invoiceNumber : Text;
    customerId : Nat;
    customerName : Text;
    amount : Satang;
    transferredAt : Timestamp;
    imageKey : Text;
    note : Text;
    status : ProofStatus;
    uploadedAt : Timestamp;
    reviewedAt : ?Timestamp;
    reviewNote : Text;
    paymentId : ?Nat;
  };

  type Receipt = {
    id : Nat;
    number : Text;
    paymentId : Nat;
    invoiceId : Nat;
    invoiceNumber : Text;
    customerId : Nat;
    customerName : Text;
    amount : Satang;
    paidAt : Timestamp;
    method : PaymentMethod;
    reference : Text;
    issuedAt : Timestamp;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    customers : Map.Map<Nat, Customer>;
    products : Map.Map<Nat, Product>;
    invoices : Map.Map<Nat, Invoice>;
    payments : Map.Map<Nat, Payment>;
    proofs : Map.Map<Nat, TransferProof>;
    receipts : Map.Map<Nat, Receipt>;
    managerNotifications : List.List<Notification>;
    customerNotifications : Map.Map<Nat, List.List<Notification>>;
    settings : { var value : ShopSettings };
    counters : {
      var nextCustomerId : Nat;
      var nextProductId : Nat;
      var nextInvoiceId : Nat;
      var nextPaymentId : Nat;
      var nextProofId : Nat;
      var nextReceiptId : Nat;
      var nextNotificationId : Nat;
    };
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      customers = Map.empty();
      products = Map.empty();
      invoices = Map.empty();
      payments = Map.empty();
      proofs = Map.empty();
      receipts = Map.empty();
      managerNotifications = List.empty();
      customerNotifications = Map.empty();
      settings = {
        var value = {
          shopName = "";
          address = "";
          taxId = "";
          phone = "";
          bankName = "";
          accountName = "";
          accountNumber = "";
          promptPayRef = "";
          invoicePrefix = "INV";
          receiptPrefix = "REC";
          defaultPaymentTermsDays = 30;
        };
      };
      counters = {
        var nextCustomerId = 1;
        var nextProductId = 1;
        var nextInvoiceId = 1;
        var nextPaymentId = 1;
        var nextProofId = 1;
        var nextReceiptId = 1;
        var nextNotificationId = 1;
      };
    };
  };
};
